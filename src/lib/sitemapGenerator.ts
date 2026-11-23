import { runtimeInfo, runtimeError, runtimeWarn } from '@/lib/runtimeDiagnostics';
import { db } from '@/db';
import { sitePages, packages, blogPosts, visaServices, destinations, visaProcessing, sitemapConfigs, sitemapLogs } from '@/db/schema';
import { eq, or, and, isNotNull } from 'drizzle-orm';
import { classify, EXCLUDED_PATHS, STATIC_PATHS, SITEMAP_SEGMENTS, segmentFileName, type SitemapSegment, type SitemapSource } from '@/lib/sitemapRules';

interface SitemapItem {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  images?: string[];
  /** Data source the URL came from; used to choose its topic sitemap. */
  source?: SitemapSource;
  /** True when changefreq/priority were set on this page's own SEO settings in the CMS. */
  explicit?: boolean;
  segment?: SitemapSegment;
}

/**
 * A page's own changefreq/priority wins over sitemapRules only when it was set deliberately.
 * "monthly" + "0.5" was the old blanket default applied to every URL, so it is ignored.
 */
function isDeliberateSeoOverride(seo: { changeFrequency?: unknown; priority?: unknown } | null | undefined): boolean {
  const freq = seo?.changeFrequency ? String(seo.changeFrequency) : '';
  const prio = seo?.priority ? String(seo.priority) : '';
  if (!freq && !prio) return false;
  return !((freq === '' || freq === 'monthly') && (prio === '' || prio === '0.5'));
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeImageUrl(imgUrl: string, baseUrl: string): string {
  if (!imgUrl) return '';
  const trimmed = imgUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${cleanBase}${cleanPath}`;
}

/** Full list of every URL (used by Admin > SEO > Sitemap metrics). */
export async function generateSitemapXml(baseUrl: string): Promise<string> {
  return renderUrlset(await gatherAllSitemapItems(baseUrl), baseUrl);
}

/** One topic sitemap, e.g. /sitemap-hajj.xml. Highest priority first. */
export async function generateSegmentSitemapXml(baseUrl: string, segment: SitemapSegment): Promise<string> {
  const items = (await gatherAllSitemapItems(baseUrl))
    .filter((item) => item.segment === segment)
    .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));
  return renderUrlset(items, baseUrl);
}

/** /sitemap.xml: index of the topic sitemaps, each with its newest lastmod. */
export async function generateSitemapIndexXml(baseUrl: string): Promise<string> {
  const items = await gatherAllSitemapItems(baseUrl);
  const origin = baseUrl.replace(/\/+$/, '');
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const segment of SITEMAP_SEGMENTS) {
    const inSegment = items.filter((item) => item.segment === segment);
    if (inSegment.length === 0) continue;
    const lastmod = inSegment.map((item) => item.lastmod || '').sort().pop();
    xml += `  <sitemap>\n    <loc>${escapeXml(`${origin}/${segmentFileName(segment)}`)}</loc>\n`;
    if (lastmod) xml += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }
  xml += `</sitemapindex>`;
  return xml;
}

function renderUrlset(items: SitemapItem[], baseUrl: string): string {
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  
  for (const item of items) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
    if (item.lastmod) xml += `    <lastmod>${escapeXml(item.lastmod)}</lastmod>\n`;
    if (item.changefreq) xml += `    <changefreq>${escapeXml(item.changefreq)}</changefreq>\n`;
    if (item.priority) xml += `    <priority>${escapeXml(item.priority)}</priority>\n`;
    
    if (item.images && item.images.length > 0) {
      for (const img of item.images) {
        if (!img) continue;
        const absoluteImg = normalizeImageUrl(img, baseUrl);
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(absoluteImg)}</image:loc>\n`;
        xml += `    </image:image>\n`;
      }
    }
    xml += `  </url>\n`;
  }
  
  xml += `</urlset>`;
  
  return xml;
}

export async function gatherAllSitemapItems(baseUrl: string): Promise<SitemapItem[]> {
  let configs: any[] = [];
  try {
    configs = await db.select().from(sitemapConfigs);
  } catch (err) {
    // Graceful fallback if sitemap_configs table has not been pushed to db yet
    runtimeError('sitemap.source_failed', err, { source: 'sitemapConfigs' });
    configs = [];
  }
  
  const getConfig = (type: string) => {
    return configs.find(c => c.contentType === type) || {
      includeInSitemap: true,
      changeFrequency: 'monthly',
      priority: '0.5',
      includeImages: true,
      includeLastModified: true
    };
  };

  const globalConfig = getConfig('global');
  if (globalConfig.includeInSitemap === false) {
    runtimeWarn('sitemap.disabled_by_configuration', { source: 'global' });
    return [];
  }

  const items: SitemapItem[] = [];

  // Helper to parse seoSettings JSON
  const parseSeoSettings = (jsonStr: any) => {
    if (!jsonStr) return {};
    if (typeof jsonStr === 'string') {
      try { return JSON.parse(jsonStr); } catch (e) { return {}; }
    }
    return jsonStr;
  };

  // 1. Pages
  const pageConfig = getConfig('sitePages');
  if (pageConfig.includeInSitemap !== false) {
    try {
      const pages = await db.select().from(sitePages).where(eq(sitePages.status, 'published'));
      for (const page of pages) {
        const seo = parseSeoSettings(page.seoSettings);
        if (seo.includeInSitemap === false || seo.noIndex === true) continue;
        
        const rawSlug = (page.slug || '').trim();
        const cleanSlug = rawSlug === 'home' || rawSlug === '/' || rawSlug === '' ? '' : rawSlug.replace(/^\/+/, '');
        const normalizedPageSlug = cleanSlug.replace(/\/+$/, '').toLowerCase();
        // Only the existing CMS flight page is listed, and only under /flights.
        // Do not list alternate /airlines or duplicate /flights CMS records.
        if (normalizedPageSlug === 'airlines' || normalizedPageSlug === 'flights') continue;
        const rawUrl = seo.canonicalUrl || seo.customUrl;
        let url: string;
        if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
          url = `${baseUrl.replace(/\/+$/, '')}${new URL(rawUrl).pathname}`;
        } else if (rawUrl && rawUrl.startsWith('/')) {
          url = `${baseUrl.replace(/\/+$/, '')}${rawUrl}`;
        } else {
          url = cleanSlug ? `${baseUrl}/${cleanSlug}` : baseUrl;
        }
        // Override even a legacy canonical URL saved in CMS SEO settings.
        if (normalizedPageSlug === 'cheap-flights-air-tickets') {
          url = `${baseUrl.replace(/\/+$/, '')}/flights`;
        }

        items.push({
          loc: url,
          lastmod: pageConfig.includeLastModified !== false ? (seo.lastModifiedOverride || (page.updatedAt ? new Date(page.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])) : undefined,
          changefreq: seo.changeFrequency || pageConfig.changeFrequency || 'monthly',
          priority: seo.priority || pageConfig.priority || (cleanSlug === '' ? '1.0' : '0.8'),
          source: 'sitePages',
          explicit: isDeliberateSeoOverride(seo),
          images: pageConfig.includeImages !== false && page.bannerBgImage ? [page.bannerBgImage] : []
        });
      }
    } catch (e) {
      runtimeError('sitemap.source_failed', e, { source: 'sitePages' });
      console.warn('Sitemap sitePages fetch skipped:', e);
    }
  }

  // 2. Packages
  const pkgConfig = getConfig('packages');
  if (pkgConfig.includeInSitemap !== false) {
    try {
      const pkgs = await db.select().from(packages).where(eq(packages.status, 'available'));
      for (const pkg of pkgs) {
        const seo = parseSeoSettings(pkg.seoSettings);
        if (seo.includeInSitemap === false || seo.noIndex === true) continue;
        
        const cleanSlug = (pkg.slug || '').replace(/^\/+/, '');
        const rawPkgUrl = seo.canonicalUrl || seo.customUrl;
        let url: string;
        if (rawPkgUrl && (rawPkgUrl.startsWith('http://') || rawPkgUrl.startsWith('https://'))) {
          url = `${baseUrl.replace(/\/+$/, '')}${new URL(rawPkgUrl).pathname}`;
        } else if (rawPkgUrl && rawPkgUrl.startsWith('/')) {
          url = `${baseUrl.replace(/\/+$/, '')}${rawPkgUrl}`;
        } else {
          url = `${baseUrl}/package/${cleanSlug}`;
        }
        
        items.push({
          loc: url,
          lastmod: pkgConfig.includeLastModified !== false ? (seo.lastModifiedOverride || (pkg.updatedAt ? new Date(pkg.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])) : undefined,
          changefreq: seo.changeFrequency || pkgConfig.changeFrequency || 'weekly',
          priority: seo.priority || pkgConfig.priority || '0.9',
          source: 'packages',
          explicit: isDeliberateSeoOverride(seo),
          images: pkgConfig.includeImages !== false && pkg.featuredImage ? [pkg.featuredImage] : []
        });
      }
    } catch (e) {
      runtimeError('sitemap.source_failed', e, { source: 'packages' });
      console.warn('Sitemap packages fetch skipped:', e);
    }
  }

  // 3. Blog Posts
  const blogConfig = getConfig('blogPosts');
  if (blogConfig.includeInSitemap !== false) {
    try {
      const posts = await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true));
      for (const post of posts) {
        if (!post.slug || !post.slug.trim()) continue;
        const seo = parseSeoSettings(post.seoSettings);
        if (seo.includeInSitemap === false || seo.noIndex === true) continue;
        
        const rawUrl = seo.canonicalUrl || seo.customUrl;
        let url: string;
        if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
          url = `${baseUrl.replace(/\/+$/, '')}${new URL(rawUrl).pathname}`;
        } else if (rawUrl && rawUrl.startsWith('/')) {
          url = `${baseUrl.replace(/\/+$/, '')}${rawUrl}`;
        } else {
          url = `${baseUrl}/${post.slug}`;
        }
        
        items.push({
          loc: url,
          lastmod: blogConfig.includeLastModified !== false ? (seo.lastModifiedOverride || (post.updatedAt ? new Date(post.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])) : undefined,
          changefreq: seo.changeFrequency || blogConfig.changeFrequency || 'weekly',
          priority: seo.priority || blogConfig.priority || '0.7',
          source: 'blogPosts',
          explicit: isDeliberateSeoOverride(seo),
          images: blogConfig.includeImages !== false && post.featuredImage ? [post.featuredImage] : []
        });
      }
    } catch (e) {
      runtimeError('sitemap.source_failed', e, { source: 'blogPosts' });
      console.warn('Sitemap blogPosts fetch skipped:', e);
    }
  }

  // 4. Visa Services
  const visaConfig = getConfig('visaServices');
  if (visaConfig.includeInSitemap !== false) {
    try {
      const visas = await db
        .select({
          id: visaServices.id,
          slug: visaServices.slug,
          isPublished: visaServices.isPublished,
          createdAt: visaServices.createdAt,
        })
        .from(visaServices)
        .where(eq(visaServices.isPublished, true));

      for (const visa of visas) {
        if (!visa.slug) continue;
        const cleanSlug = (visa.slug || '').replace(/^\/+/, '');
        const url = `${baseUrl}/saudi-visa`;
        
        items.push({
          loc: url,
          lastmod: visaConfig.includeLastModified !== false ? (visa.createdAt ? new Date(visa.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]) : undefined,
          changefreq: visaConfig.changeFrequency || 'monthly',
          priority: visaConfig.priority || '0.6',
          source: 'visaServices',
        });
      }
    } catch (e) {
      runtimeError('sitemap.source_failed', e, { source: 'visaServices' });
      console.warn('Sitemap visaServices fetch skipped:', e);
    }
  }

  // 5. Published destinations. Sold-out offers remain accessible by direct URL only.
  const destinationConfig = getConfig('destinations');
  if (destinationConfig.includeInSitemap !== false) {
    try {
      const rows = await db.select().from(destinations).where(eq(destinations.status, 'published'));
      for (const item of rows) {
        const seo = parseSeoSettings(item.seoSettings);
        const destinationOffer = item.packageData as any;
        if (seo.noIndex === true || seo.includeInSitemap === false || destinationOffer?.status === 'sold_out') continue;
        const path = `/destinations/${String(item.slug || '').replace(/^\/+/, '')}`;
        if (!item.slug) continue;
        items.push({
          loc: `${baseUrl.replace(/\/+$/, '')}${path}`,
          lastmod: item.updatedAt ? new Date(item.updatedAt).toISOString().split('T')[0] : undefined,
          changefreq: destinationConfig.changeFrequency || 'monthly',
          priority: destinationConfig.priority || '0.7',
          source: 'destinations',
          images: destinationConfig.includeImages !== false && destinationOffer?.cardData?.bannerImage ? [destinationOffer.cardData.bannerImage] : [],
        });
      }
    } catch (e) {
      runtimeError('sitemap.source_failed', e, { source: 'destinations' });
      console.warn('Sitemap destinations fetch skipped:', e);
    }
  }

  // 6. Published visa processing pages, each under its own CMS slug.
  const visaPageConfig = getConfig('visaProcessing');
  if (visaPageConfig.includeInSitemap !== false) {
    try {
      const rows = await db.select().from(visaProcessing).where(eq(visaProcessing.status, 'published'));
      for (const item of rows) {
        const seo = parseSeoSettings(item.seoSettings);
        if (!item.slug || seo.noIndex === true || seo.includeInSitemap === false) continue;
        const slug = String(item.slug).replace(/^\/+/, '');
        const path = slug.startsWith('visa-processing/') ? `/${slug}` : `/visa-processing/${slug}`;
        items.push({
          loc: `${baseUrl.replace(/\/+$/, '')}${path}`,
          lastmod: item.updatedAt ? new Date(item.updatedAt).toISOString().split('T')[0] : undefined,
          changefreq: visaPageConfig.changeFrequency || 'monthly',
          priority: visaPageConfig.priority || '0.7',
          source: 'visaProcessing',
          images: visaPageConfig.includeImages !== false && item.bannerBgImage ? [item.bannerBgImage] : [],
        });
      }
    } catch (e) {
      runtimeError('sitemap.source_failed', e, { source: 'visaProcessing' });
      console.warn('Sitemap visaProcessing fetch skipped:', e);
    }
  }

  // A single canonical path must appear only once, even if multiple data sources include it.
  const unique = new Map<string, SitemapItem>();
  for (const item of items) {
    const url = new URL(item.loc, baseUrl);
    const normalizedPath = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
    const key = normalizedPath.toLowerCase();
    const loc = `${baseUrl.replace(/\/+$/, '')}${normalizedPath === '/' ? '/' : normalizedPath}`;
    if (!unique.has(key)) unique.set(key, { ...item, loc });
  }
  // Always list public code routes that have no CMS record.
  for (const path of STATIC_PATHS) {
    if (!unique.has(path)) {
      unique.set(path, { loc: `${baseUrl.replace(/\/+$/, '')}${path}`, lastmod: new Date().toISOString().split('T')[0], source: 'static' });
    }
  }

  // Apply SEO rules: drop duplicates/expired/outdated URLs, then assign topic sitemap, changefreq and priority.
  for (const [key, item] of [...unique.entries()]) {
    if (EXCLUDED_PATHS.has(key)) { unique.delete(key); continue; }
    const rule = classify(key, item.source || 'static');
    item.segment = rule.segment;
    if (!item.explicit) {
      item.changefreq = rule.changefreq;
      item.priority = rule.priority;
    }
  }
  runtimeInfo('sitemap.sources_complete', { rawUrls: items.length, uniqueUrls: unique.size, hasHajj2027: [...unique.values()].some(item => new URL(item.loc, baseUrl).pathname.replace(/\/+$/, '') === '/hajj-2027') });
  return [...unique.values()];
}
