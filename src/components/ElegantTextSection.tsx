"use client";

import SafeRichText from '@/components/SafeRichText';

/** CMS text on the left and an optional image on the right, styled with Tailwind. */
type ElegantTextData = {
  eyebrow?: string;
  title?: string;
  content?: string;
  image?: string;
  imageAlt?: string;
  buttonText?: string;
  buttonUrl?: string;
  // Old saved sections may still contain these fields. Layout is always text-left.
  appearance?: 'card' | 'clean';
  alignment?: 'left' | 'center';
  imagePosition?: 'left' | 'right';
};

export default function ElegantTextSection({ data }: { data?: ElegantTextData }) {
  const content = typeof data?.content === 'string' ? data.content.trim() : '';
  const title = typeof data?.title === 'string' ? data.title.trim() : '';
  const eyebrow = typeof data?.eyebrow === 'string' ? data.eyebrow.trim() : '';
  const image = typeof data?.image === 'string' ? data.image.trim() : '';
  const imageAlt = typeof data?.imageAlt === 'string' ? data.imageAlt.trim() : '';
  const buttonText = typeof data?.buttonText === 'string' ? data.buttonText.trim() : '';
  const buttonUrl = typeof data?.buttonUrl === 'string' ? data.buttonUrl.trim() : '';
  const hasContent = Boolean(content && !/^(<p>\s*(<br\s*\/?\s*>)?\s*<\/p>)+$/i.test(content));
  const safeButtonUrl = /^(\/(?!\/)|#|https:\/\/|mailto:|tel:)/i.test(buttonUrl) ? buttonUrl : '';
  const hasText = Boolean(title || eyebrow || hasContent || (buttonText && safeButtonUrl));

  if (!hasText && !image) return null;

  return (
    <section className="w-full bg-white py-8 md:py-12 lg:py-[72px]" aria-label={title || eyebrow || 'Page information'}>
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 xl:px-12">
        <div
          className={`grid grid-cols-1 items-center gap-6 md:gap-10 lg:gap-14 ${hasText && image ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]' : ''}`}
        >
          {hasText && (
            <div className={`min-w-0 ${image ? '' : 'max-w-3xl'}`}>
              {eyebrow && <span className="eyebrow font-sans">{eyebrow}</span>}
              {title && <h2 className="section-title font-serif">{title}</h2>}
              {hasContent && (
                <SafeRichText
                  html={content}
                  unstyled
                  stripInlineTypography
                  className="prose max-w-none break-words font-sans text-ink leading-relaxed [&_p:last-child]:mb-0 [&_img]:h-auto [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
                />
              )}
              {buttonText && safeButtonUrl && (
                <a
                  href={safeButtonUrl}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#009bc0] px-6 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#007a98] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {buttonText}
                </a>
              )}
            </div>
          )}
          {image && (
            <div className="aspect-[157/100] w-full min-w-0 overflow-hidden rounded-xl bg-slate-100 shadow-[0_6px_18px_rgba(10,30,55,0.09)]">
              <img
                className="block h-full w-full object-cover"
                src={image}
                alt={imageAlt || title || eyebrow || 'Section image'}
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
