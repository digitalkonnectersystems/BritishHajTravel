export function getGuideVideoEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === 'youtu.be' || url.hostname.endsWith('.youtube.com')) {
      const videoId = url.hostname === 'youtu.be'
        ? url.pathname.slice(1)
        : url.searchParams.get('v') || url.pathname.match(/^\/embed\/([^/]+)/)?.[1];
      return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` : null;
    }
    if (url.hostname === 'vimeo.com' || url.hostname.endsWith('.vimeo.com')) {
      const videoId = url.pathname.match(/\/(\d+)(?:\/|$)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export default function GuideVideoSection({ data = {} }: { data?: { source?: string; url?: string; title?: string; caption?: string } }) {
  const url = typeof data.url === 'string' ? data.url.trim() : '';
  if (!url) return null;

  return (
    <section className="bg-white px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-5xl">
        {data.title && <h2 className="mb-5 text-center text-2xl font-extrabold text-slate-900 md:text-3xl">{data.title}</h2>}
        {data.source === 'upload' ? (
          <video className="aspect-video w-full rounded-2xl bg-slate-950 shadow-sm" controls preload="metadata">
            <source src={url} />
            Your browser does not support the video tag.
          </video>
        ) : (() => {
          const embedUrl = getGuideVideoEmbedUrl(url);
          return embedUrl ? (
            <div className="aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-sm">
              <iframe
                className="h-full w-full"
                src={embedUrl}
                title={data.title || data.caption || 'Guide video'}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">This video link is not a supported YouTube or Vimeo URL.</p>
          );
        })()}
        {data.caption && <p className="mt-3 text-center text-sm text-slate-500">{data.caption}</p>}
      </div>
    </section>
  );
}
