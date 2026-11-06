'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type GalleryImage = string | { image?: string; src?: string; url?: string; alt?: string; title?: string };
type GalleryVideo = { url?: string; title?: string } | string;
type GalleryData = {
  images?: GalleryImage[];
  videos?: GalleryVideo[];
  eyebrow?: string;
  title?: string;
  description?: string;
};

function getTikTokVideoId(url: URL) {
  if (url.hostname !== 'tiktok.com' && !url.hostname.endsWith('.tiktok.com')) return null;
  return url.pathname.match(/^\/@[^/]+\/video\/(\d+)/)?.[1] || null;
}

function isTikTokUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'tiktok.com' || url.hostname.endsWith('.tiktok.com'));
  } catch {
    return false;
  }
}

function getImage(item: GalleryImage) {
  if (typeof item === 'string') return { src: item, alt: 'British Hajj Travel gallery image' };
  return { src: item.image || item.src || item.url || '', alt: item.alt || item.title || 'British Hajj Travel gallery image' };
}

function getEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const tiktokVideoId = getTikTokVideoId(url);
    if (tiktokVideoId) {
      return `https://www.tiktok.com/player/v1/${tiktokVideoId}?music_info=1&description=1`;
    }
    if (url.hostname === 'tiktok.com' || url.hostname.endsWith('.tiktok.com')) return null;
    if (url.hostname.includes('youtube.com')) {
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : value;
    }
    if (url.hostname === 'youtu.be') return `https://www.youtube.com/embed${url.pathname}`;
    if (url.hostname.includes('vimeo.com')) return `https://player.vimeo.com/video${url.pathname}`;
  } catch {
    return value;
  }
  return value;
}

export default function GallerySection({ data }: { data?: GalleryData }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const images = (Array.isArray(data?.images) ? data.images : [])
    .map(getImage)
    .filter((item: { src: string }) => item.src.trim());
  const videos: { url: string; title: string }[] = (Array.isArray(data?.videos) ? data.videos : [])
    .map((item: GalleryVideo) => typeof item === 'string' ? { url: item, title: 'Gallery video' } : { url: item.url || '', title: item.title || 'Gallery video' })
    .filter((item: { url: string }) => item.url.trim());

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(() => setActiveIndex((current) => current === null ? null : (current + 1) % images.length), [images.length]);
  const previous = useCallback(() => setActiveIndex((current) => current === null ? null : (current - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') previous();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, close, next, previous]);

  if (!images.length && !videos.length) return null;

  return (
    <section className="bg-blue-lt py-10 md:py-14">
      <div className="mx-auto w-full max-w-[1400px] px-5">
        {(data?.eyebrow || data?.title || data?.description) && (
          <div className="mb-8 text-center">
            {data?.eyebrow && <p className="eyebrow mx-auto w-fit justify-center text-center">{data.eyebrow}</p>}
            {data?.title && <h2 className="text-2xl font-extrabold text-primary md:text-4xl">{data.title}</h2>}
            {data?.description && <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">{data.description}</p>}
            <span className="mx-auto mt-3 block h-[3px] w-[70px] bg-[#ed1b2f]" />
          </div>
        )}

        {images.length > 0 && (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-4">
            {images.map((item: { src: string; alt: string }, index: number) => (
              <button
                type="button"
                key={`${item.src}-${index}`}
                onClick={() => setActiveIndex(index)}
                className="mb-5 block w-full cursor-zoom-in overflow-hidden rounded-[4px] bg-white text-left shadow-sm transition-shadow hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#ed1b2f]"
                aria-label={`Open gallery image ${index + 1}`}
              >
                <img src={item.src} alt={item.alt} loading="lazy" decoding="async" className="block h-auto w-full" />
              </button>
            ))}
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-12 border-t border-slate-200 pt-10">
            <h3 className="mb-6 text-center text-2xl font-bold text-primary">Videos</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {videos.map((video, index) => (
                <div key={`${video.url}-${index}`} className="overflow-hidden rounded-lg bg-black shadow-lg">
                  <GalleryVideoEmbed video={video} />
                  {video.title !== 'Gallery video' && <p className="bg-white px-4 py-3 text-sm font-semibold text-primary">{video.title}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeIndex !== null && images[activeIndex] && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Gallery image viewer" onClick={close}>
          <button type="button" onClick={close} aria-label="Close image viewer" className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-red text-white transition hover:bg-red-700"><X className="h-6 w-6" /></button>
          {images.length > 1 && <button type="button" onClick={(event) => { event.stopPropagation(); previous(); }} aria-label="Previous image" className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white hover:text-primary md:left-8"><ChevronLeft className="h-7 w-7" /></button>}
          <img src={images[activeIndex].src} alt={images[activeIndex].alt} className="max-h-[90vh] max-w-[92vw] object-contain" onClick={(event) => event.stopPropagation()} />
          {images.length > 1 && <button type="button" onClick={(event) => { event.stopPropagation(); next(); }} aria-label="Next image" className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white hover:text-primary md:right-8"><ChevronRight className="h-7 w-7" /></button>}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">{activeIndex + 1} / {images.length}</span>
        </div>
      )}
    </section>
  );
}

function GalleryVideoEmbed({ video }: { video: { url: string; title: string } }) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(() => getEmbedUrl(video.url));
  const [resolutionFailed, setResolutionFailed] = useState(false);
  const isPortraitVideo = isTikTokUrl(video.url);

  useEffect(() => {
    if (embedUrl || !isTikTokUrl(video.url)) return;

    const controller = new AbortController();
    const params = new URLSearchParams({ url: video.url });
    fetch(`/api/gallery/tiktok-embed?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || typeof result.embedUrl !== 'string') {
          throw new Error(result.error || 'Unable to resolve this TikTok video.');
        }
        setEmbedUrl(result.embedUrl);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error('Gallery TikTok embed resolution failed:', error);
        setResolutionFailed(true);
      });

    return () => controller.abort();
  }, [embedUrl, video.url]);

  return (
    <div className={isPortraitVideo ? 'aspect-[9/16] md:aspect-video' : 'aspect-video'}>
      {embedUrl ? (
        <iframe className="h-full w-full" src={embedUrl} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      ) : resolutionFailed ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-950 px-4 text-center text-sm text-white">
          <p>Unable to load this video embed.</p>
          <a href={video.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">Open video on TikTok</a>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center bg-slate-950 text-sm text-white">Loading video…</div>
      )}
    </div>
  );
}
