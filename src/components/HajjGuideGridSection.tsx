'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getHajjGuideGridItems, type HajjGuideGridItem } from '@/actions/hajjGuideGridActions';

interface Props {
  data?: { eyebrow?: string; title?: string; description?: string; subtitle?: string; selectedGridIds?: number[] };
  items?: HajjGuideGridItem[];
}

/** The homepage reference uses a four-column navy panel with an image and caption per tile. */
export default function HajjGuideGridSection({ data, items }: Props) {
  const [fallbackItems, setFallbackItems] = useState<HajjGuideGridItem[]>([]);
  useEffect(() => {
    // Some legacy pages render section components without passing server section context.
    if (items !== undefined) return;
    let active = true;
    getHajjGuideGridItems().then((result) => { if (active) setFallbackItems(result); }).catch((error) => {
      console.error('Unable to load Hajj guide grid', error);
    });
    return () => { active = false; };
  }, [items]);

  const selected = useMemo(() => new Set(
    (Array.isArray(data?.selectedGridIds) ? data.selectedGridIds : [])
      .map(Number).filter((id) => Number.isInteger(id) && id > 0),
  ), [data]);

  const cards = (items ?? fallbackItems).filter((item) => item.status === 'published' && selected.has(item.id));
  const description = data?.description || data?.subtitle;

  return (
    <section className="w-full bg-primary px-4 py-9 sm:px-6 sm:py-12" aria-label={data?.title || 'UK-GLOBAL HAJJ GUIDE 2027'}>
      <div className="mx-auto w-full max-w-[1360px]">
        <div className="mb-5 text-center">
          {data?.eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/75">{data.eyebrow}</p>}
          <h2 className="font-sans text-[19px] font-extrabold uppercase tracking-[0.01em] text-white sm:text-[23px]">
            <span className="font-serif text-[clamp(1.5rem,2.2vw,2.25rem)] leading-[0.98]">{data?.title || 'UK-GLOBAL HAJJ GUIDE 2027'}</span>
          </h2>
          {description && <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-white/80">{description}</p>}
        </div>
        {cards.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {cards.map((card) => {
            // Manual URL takes precedence; a linked Hajj guide page is the fallback.
            const destination = card.targetUrl || card.guideSlug || '';
            const isExternal = /^https?:\/\//i.test(destination);
            const validUrl = destination.startsWith('/') && !destination.startsWith('//')
              || /^https?:\/\/[^\s/]+/i.test(destination);
            const body = (
              <>
                <div className="relative aspect-[7/5] w-full bg-white">
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.altText || card.title} loading="lazy" className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-3 text-center text-[12px] font-extrabold uppercase leading-5 text-[#020e43]">
                      {card.title}
                    </div>
                  )}
                </div>
                <div className="flex min-h-[42px] items-center justify-center bg-[#e5e7eb] px-2 py-2 text-center text-md font-extrabold uppercase leading-[1.35] text-primary">
                  {card.title}
                </div>
              </>
            );
            const cls = `block min-w-0 overflow-hidden rounded-xl bg-[#e5e7eb] shadow-sm ${validUrl ? 'transition-transform duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white' : ''}`;
            if (!validUrl) return <article key={card.id} className={cls}>{body}</article>;
            if (isExternal) return <a key={card.id} href={destination} target="_blank" rel="noopener noreferrer" aria-label={`Open ${card.title}`} className={cls}>{body}</a>;
            return <Link key={card.id} href={destination} className={cls} aria-label={`View ${card.title}`}>{body}</Link>;
          })}
        </div>}
      </div>
    </section>
  );
}
