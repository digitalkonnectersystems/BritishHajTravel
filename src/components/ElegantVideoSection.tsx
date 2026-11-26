"use client";

import SafeRichText from '@/components/SafeRichText';
import { getGuideVideoEmbedUrl } from '@/components/GuideVideoSection';

type ElegantVideoData = {
  eyebrow?: string;
  title?: string;
  highlight?: string;
  author?: string;
  paragraphOne?: string;
  paragraphTwo?: string;
  content?: string;
  videoUrl?: string;
  videoPoster?: string;
  videoFit?: 'cover' | 'contain' | 'fill';
  videoPosition?: string;
  buttonText?: string;
  buttonUrl?: string;
};

function isSafeMediaUrl(value: string): boolean {
  return /^\/(?!\/)/.test(value) || /^https?:\/\//i.test(value);
}

export default function ElegantVideoSection({ data = {} }: { data?: ElegantVideoData }) {
  const eyebrow = typeof data.eyebrow === 'string' ? data.eyebrow.trim() : '';
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const highlight = typeof data.highlight === 'string' ? data.highlight.trim() : '';
  const author = typeof data.author === 'string' ? data.author.trim() : '';
  const paragraphOne = typeof data.paragraphOne === 'string' ? data.paragraphOne.trim() : '';
  const paragraphTwo = typeof data.paragraphTwo === 'string' ? data.paragraphTwo.trim() : '';
  const content = typeof data.content === 'string' ? data.content.trim() : '';
  const buttonText = typeof data.buttonText === 'string' ? data.buttonText.trim() : '';
  const buttonUrl = typeof data.buttonUrl === 'string' ? data.buttonUrl.trim() : '';
  const rawVideoUrl = typeof data.videoUrl === 'string' ? data.videoUrl.trim() : '';
  const videoUrl = isSafeMediaUrl(rawVideoUrl) ? rawVideoUrl : '';
  const embedUrl = videoUrl ? getGuideVideoEmbedUrl(videoUrl) : null;
  const directVideoUrl = videoUrl && !embedUrl ? videoUrl : '';
  const rawPoster = typeof data.videoPoster === 'string' ? data.videoPoster.trim() : '';
  const poster = isSafeMediaUrl(rawPoster) ? rawPoster : undefined;
  const fit = data.videoFit === 'contain' || data.videoFit === 'fill' ? data.videoFit : 'cover';
  const allowedPositions = ['center', 'top', 'bottom', 'left', 'right', 'center top', 'center bottom'];
  const videoPosition = allowedPositions.includes(data.videoPosition || '') ? data.videoPosition! : 'center';
  const safeButtonUrl = /^(\/(?!\/)|#|https:\/\/|mailto:|tel:)/i.test(buttonUrl) ? buttonUrl : '';
  const hasText = Boolean(eyebrow || title || highlight || author || paragraphOne || paragraphTwo || content || (buttonText && safeButtonUrl));
  const hasMedia = Boolean(directVideoUrl || embedUrl || poster);

  if (!hasText && !hasMedia) return null;

  return (
    <section className="bg-blue-lt py-8 md:py-10" aria-label={eyebrow || 'Page information'}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-4 sm:px-5 md:grid-cols-[minmax(0,1fr)_minmax(250px,300px)] md:gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
        <div className="min-w-0">
          {eyebrow && <span className="eyebrow mb-5 block">{eyebrow}</span>}
          {(title || highlight) && (
            <div className="mb-4 border-l-4 border-primary pl-5 md:pl-6">
              <h2 className="section-heading m-0 font-serif text-2xl leading-tight text-primary md:text-3xl lg:text-4xl">
                {title}
                {highlight && <span className="text-red"> {highlight}</span>}
              </h2>
            </div>
          )}
          {author && <p className="mb-3 font-bold text-ink">{author}</p>}
          {paragraphOne && <p className="mb-6 whitespace-pre-line leading-relaxed text-ink-soft">{paragraphOne}</p>}
          {paragraphTwo && <p className="whitespace-pre-line leading-relaxed text-ink-soft">{paragraphTwo}</p>}
          {content && (
            <SafeRichText
              html={content}
              unstyled
              stripInlineTypography
              className="prose max-w-none break-words leading-relaxed text-ink-soft [&_p:last-child]:mb-0 [&_img]:h-auto [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
            />
          )}
          {buttonText && safeButtonUrl && (
            <a href={safeButtonUrl} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {buttonText}
            </a>
          )}
        </div>
        <div className="relative mx-auto aspect-[3/5] w-full max-w-[360px] overflow-hidden rounded-2xl border border-primary/30 bg-ink/5 md:mx-0 md:max-w-none">
          {directVideoUrl ? (
            <video
              key={directVideoUrl}
              className="h-full w-full"
              style={{ objectFit: fit, objectPosition: videoPosition }}
              controls
              playsInline
              preload="metadata"
              poster={poster}
              suppressHydrationWarning
              aria-label={title || 'Section video'}
            >
              <source
                src={directVideoUrl}
                type={/\.webm(?:[?#]|$)/i.test(directVideoUrl) ? 'video/webm' : /\.mov(?:[?#]|$)/i.test(directVideoUrl) ? 'video/quicktime' : 'video/mp4'}
              />
              Your browser does not support this video.
            </video>
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              title={title || 'Section video'}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : poster ? (
            // Deliberately use img for an optional poster without triggering Next image optimization.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="Video cover" className="h-full w-full" style={{ objectFit: fit, objectPosition: videoPosition }} loading="lazy" decoding="async" />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-ink-soft">
              Video will appear here when selected in the page editor.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
