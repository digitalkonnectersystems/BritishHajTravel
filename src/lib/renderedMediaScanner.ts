/**
 * Client-side, same-origin audit of actual CSS box sizes on public pages.
 * Measurements are gathered at two viewport widths before any file is touched.
 * Never treat an image's naturalWidth as its rendered width: Next/Image may serve
 * a transformed srcset resource, and backgrounds use CSS cover sizing.
 */
export type RenderedMediaMeasurement = {
  relativePath: string;
  renderedWidth: number;
  renderedHeight: number;
};

export type RenderedScanProgress = {
  scanned: number;
  queued: number;
  discovered: number;
  currentPage: string;
};

export type RenderedScanResult = {
  measurements: RenderedMediaMeasurement[];
  scannedPages: number;
  failedPages: string[];
  truncated: boolean;
};

const MAX_PUBLIC_PAGES = 500;
const VIEWPORT_WIDTHS = [1440, 768, 390] as const;
const BLOCKED_PREFIXES = ['/admin', '/api', '/_next', '/media', '/images_BHT', '/letstravel'];

function publicPage(value: string, root: string): string | null {
  try {
    const url = new URL(value, root);
    const host = url.hostname.toLowerCase();
    const currentHost = new URL(root).hostname.toLowerCase();
    if (host !== currentHost && host !== 'britishhajtravel.com' && host !== 'www.britishhajtravel.com' && host !== 'new.britishhajtravel.com') return null;
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    if (BLOCKED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))) return null;
    if (/\.(?:xml|txt|pdf|jpe?g|png|gif|webp|avif|svg|ico|mp4|webm|mov|zip)$/i.test(pathname)) return null;
    return pathname;
  } catch { return null; }
}

/** Translate actual image requests (including Next/Image) into Media Library paths. */
export function localMediaPath(value: string, root: string): string | null {
  try {
    let url = new URL(value, root);
    if (url.origin !== root) return null;
    if (url.pathname === '/_next/image') {
      const source = url.searchParams.get('url');
      if (!source) return null;
      url = new URL(source, root);
      if (url.origin !== root) return null;
    }
    let relative = '';
    if (url.pathname.startsWith('/images_BHT/')) relative = url.pathname.slice('/images_BHT/'.length);
    else if (url.pathname.startsWith('/media/')) relative = url.pathname.slice('/media/'.length);
    else return null;
    relative = decodeURIComponent(relative);
    if (!/^[a-z0-9_.-]+(?:\/[a-z0-9_.-]+){1,4}$/i.test(relative) || relative.split('/').some(part => part === '..' || part === '.')) return null;
    if (!/\.(?:jpe?g|png|webp|avif)$/i.test(relative)) return null;
    return relative;
  } catch { return null; }
}

function collectPage(doc: Document, root: string, imageSizes: Map<string, RenderedMediaMeasurement>, addPage: (href: string) => void) {
  const add = (src: string, box: DOMRect) => {
    if (box.width <= 0 || box.height <= 0 || !Number.isFinite(box.width) || !Number.isFinite(box.height)) return;
    const relativePath = localMediaPath(src, root);
    if (!relativePath) return;
    const previous = imageSizes.get(relativePath);
    imageSizes.set(relativePath, {
      relativePath,
      renderedWidth: Math.max(previous?.renderedWidth || 0, Math.ceil(box.width)),
      renderedHeight: Math.max(previous?.renderedHeight || 0, Math.ceil(box.height)),
    });
  };
  for (const img of Array.from(doc.images)) {
    add(img.currentSrc || img.src, img.getBoundingClientRect());
    // An eager src can differ from the browser-selected srcset candidate.
    if (img.getAttribute('src')) add(img.getAttribute('src')!, img.getBoundingClientRect());
  }
  const cssUrl = /url\(\s*['"]?([^'"\)]+)['"]?\s*\)/g;
  for (const element of Array.from(doc.querySelectorAll<HTMLElement>('*'))) {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    const background = doc.defaultView?.getComputedStyle(element).backgroundImage || '';
    if (!background.includes('url(')) continue;
    cssUrl.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = cssUrl.exec(background)) !== null) add(match[1], rect);
  }
  for (const link of Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href]'))) addPage(link.href);
}

async function fetchSitemapPages(root: string): Promise<string[]> {
  const response = await fetch('/sitemap.xml', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Sitemap returned HTTP ${response.status}`);
  const xml = new DOMParser().parseFromString(await response.text(), 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('Sitemap XML is invalid');
  return Array.from(xml.getElementsByTagName('url')).map(entry => {
    const loc = entry.getElementsByTagName('loc').item(0)?.textContent || '';
    return publicPage(loc, root);
  }).filter((url): url is string => !!url);
}

function loadIframe(frame: HTMLIFrameElement, pathname: string, signal: AbortSignal): Promise<Document> {
  return new Promise((resolve, reject) => {
    let finished = false;
    const finish = (error?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      frame.removeEventListener('load', loaded);
      frame.removeEventListener('error', failed);
      signal.removeEventListener('abort', aborted);
      if (error) reject(error);
      else {
        try {
          const doc = frame.contentDocument;
          if (!doc || !doc.body) throw new Error('Browser blocked the same-origin page preview');
          resolve(doc);
        } catch (e) { reject(e instanceof Error ? e : new Error('Could not inspect page')); }
      }
    };
    const loaded = () => {
      // A newly attached iframe may first report its initial about:blank.
      if (frame.contentDocument?.URL === 'about:blank') return;
      finish();
    };
    const failed = () => finish(new Error('Page did not load'));
    const aborted = () => finish(new Error('Scan cancelled'));
    const timer = setTimeout(() => finish(new Error('Page load timed out')), 18000);
    frame.addEventListener('load', loaded);
    frame.addEventListener('error', failed);
    signal.addEventListener('abort', aborted, { once: true });
    if (signal.aborted) return aborted();
    // Mark synthetic page views so the normal GA4 tag does not count audits.
    const auditedUrl = new URL(pathname, window.location.origin);
    auditedUrl.searchParams.set('__bht_media_scan', '1');
    frame.src = `${auditedUrl.pathname}${auditedUrl.search}`;
  });
}

/**
 * Fail closed: if a page cannot be measured, the caller must not resize files.
 * Sitemap URLs are supplemented with links discovered from the public pages.
 */
export async function scanFrontendRenderedImages(
  signal: AbortSignal,
  onProgress: (progress: RenderedScanProgress) => void,
): Promise<RenderedScanResult> {
  const root = window.location.origin;
  const frames: HTMLIFrameElement[] = [];
  const queue: string[] = ['/'];
  const seen = new Set(queue);
  const sizes = new Map<string, RenderedMediaMeasurement>();
  const failedPages: string[] = [];
  const addPage = (value: string) => {
    const next = publicPage(value, root);
    if (next && !seen.has(next)) { seen.add(next); queue.push(next); }
  };
  try {
    // Abort if the sitemap cannot enumerate published pages: otherwise we
    // might shrink a shared image used by a page we have never inspected.
    const sitemapPages = await fetchSitemapPages(root);
    if (!sitemapPages.length) throw new Error('The published sitemap contains no pages. No images were modified.');
    sitemapPages.forEach(addPage);
    const frame = document.createElement('iframe');
    frame.setAttribute('title', 'Temporary public image dimension scanner');
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('tabindex', '-1');
    Object.assign(frame.style, {
      position: 'fixed', left: '-20000px', top: '0', width: '1440px', height: '900px',
      border: '0', opacity: '0', pointerEvents: 'none', zIndex: '-1',
    });
    document.body.appendChild(frame);
    frames.push(frame);
    let scannedPages = 0;
    while (queue.length && scannedPages < MAX_PUBLIC_PAGES) {
      if (signal.aborted) throw new Error('Scan cancelled');
      const pathname = queue.shift()!;
      onProgress({ scanned: scannedPages, queued: queue.length + 1, discovered: sizes.size, currentPage: pathname });
      try {
        frame.style.width = '1440px';
        const doc = await loadIframe(frame, pathname, signal);
        for (const img of Array.from(doc.images)) img.loading = 'eager';
        for (const width of VIEWPORT_WIDTHS) {
          frame.style.width = `${width}px`;
          // The iframe viewport changes CSS breakpoints without a second
          // full HTTP navigation. Notify JS-driven responsive components too.
          doc.defaultView?.dispatchEvent(new Event('resize'));
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => { signal.removeEventListener('abort', aborted); resolve(); }, width === 1440 ? 650 : 260);
            const aborted = () => { clearTimeout(timer); signal.removeEventListener('abort', aborted); reject(new Error('Scan cancelled')); };
            signal.addEventListener('abort', aborted, { once: true });
            if (signal.aborted) aborted();
          });
          collectPage(doc, root, sizes, addPage);
        }
      } catch (error) {
        if (signal.aborted) throw error;
        failedPages.push(`${pathname}: ${error instanceof Error ? error.message : 'Preview failed'}`);
      }
      scannedPages++;
      onProgress({ scanned: scannedPages, queued: queue.length, discovered: sizes.size, currentPage: pathname });
    }
    return { measurements: [...sizes.values()], scannedPages, failedPages, truncated: queue.length > 0 };
  } finally {
    for (const frame of frames) frame.remove();
  }
}
