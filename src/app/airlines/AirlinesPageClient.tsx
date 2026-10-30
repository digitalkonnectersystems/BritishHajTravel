'use client';

import Link from 'next/link';
import PageSectionsRenderer from '@/components/PageSectionsRenderer';
import AvailableFlightsSection from '@/components/AvailableFlightsSection';
import AvailableSeatsSection from '@/components/AvailableSeatsSection';
import MarqueeTrack from '@/components/MarqueeTrack';
import PageBanner from '@/components/PageBanner';

type AirlineSectionData = {
  items?: unknown[];
  logos?: unknown[];
  eyebrow?: string;
  title?: string;
  description?: string;
  btnLabel?: string;
  btnLink?: string;
  speedMs?: number;
  direction?: 'left' | 'right';
};

type AirlineSection = { type: string; data?: AirlineSectionData };

type AirlinePageData = {
  title?: string | null;
  bannerTitle?: string | null;
  bannerDescription?: string | null;
  bannerBgImage?: string | null;
  bannerPosition?: string | null;
  bannerSize?: string | null;
  seoSettings?: unknown;
  sections?: unknown;
};

function isAirlineSection(value: unknown): value is AirlineSection {
  if (!value || typeof value !== 'object') return false;
  const section = value as { type?: unknown; data?: unknown };
  return typeof section.type === 'string' &&
    (section.data === undefined || section.data === null || (typeof section.data === 'object' && !Array.isArray(section.data)));
}

function parseAirlineSections(value: unknown): AirlineSection[] {
  if (!value) return [];
  try {
    const parsed: unknown = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.filter(isAirlineSection) : [];
  } catch (error) {
    console.error('Error parsing airlines page sections:', error);
    return [];
  }
}

const handledTypes = new Set([
  'Available Flights Grid',
  'Flights Cards',
  'Available Seats',
  'Airlines Marquee',
  'Partners Marquee',
  'Logo Carousel',
  'Airlines Logo Carousel',
  'Flight Assistance CTA',
  'Flight Desk CTA',
]);

export default function AirlinesPageClient({ initialPageData }: { initialPageData?: AirlinePageData }) {
  const pageData = initialPageData || null;
  const sections = parseAirlineSections(pageData?.sections);


  return (
    <main className="min-h-screen bg-blue-lt">
      {pageData && (pageData.bannerTitle || pageData.title || pageData.bannerDescription || pageData.bannerBgImage) ? (
        <PageBanner
          title={pageData.bannerTitle || pageData.title || ''}
          description={pageData.bannerDescription || ''}
          bgImage={pageData.bannerBgImage}
          position={pageData.bannerPosition}
          size={pageData.bannerSize}
          heroSettings={pageData.seoSettings}
        />
      ) : null}

      {sections.length === 0 ? (
        <section className="px-4 py-16 text-center text-slate-600">
          <p>Flight information is not currently available.</p>
        </section>
      ) : (
        <>
          {sections.map((section, index) => {
            const data = section.data ?? {};

            if (section.type === 'Available Flights Grid' || section.type === 'Flights Cards') {
              return <AvailableFlightsSection key={index} data={data} />;
            }

            if (section.type === 'Available Seats') {
              return <AvailableSeatsSection key={index} data={data} />;
            }

            if (['Airlines Marquee', 'Partners Marquee', 'Logo Carousel', 'Airlines Logo Carousel'].includes(section.type)) {
              const logos = Array.isArray(data.logos)
                ? data.logos.filter((logo): logo is { src: string; alt?: string } => {
                    if (!logo || typeof logo !== 'object' || !('src' in logo)) return false;
                    return typeof logo.src === 'string' && (!('alt' in logo) || typeof logo.alt === 'string');
                  })
                : [];
              if (logos.length === 0) return null;

              return (
                <section key={index} id="flights" className="bg-white py-12">
                  {data.eyebrow || data.title ? (
                    <div className="wrap">
                      <div className="section-head center mb-8 text-center">
                        {data.eyebrow ? <div className="eyebrow mb-1 justify-center text-xs font-bold uppercase tracking-widest text-red">{data.eyebrow}</div> : null}
                        {data.title ? <h2>{data.title}</h2> : null}
                      </div>
                    </div>
                  ) : null}
                  <MarqueeTrack type="airline" images={logos} speedMs={data.speedMs} direction={data.direction} />
                </section>
              );
            }

            if (section.type === 'Flight Assistance CTA' || section.type === 'Flight Desk CTA') {
              if (!data.title && !data.description && !(data.btnLabel && data.btnLink)) return null;

              return (
                <section key={index} className="tint mt-12 border-t border-emerald-100 bg-emerald-50/60 py-20">
                  <div className="wrap mx-auto max-w-3xl px-4 text-center">
                    {data.title ? <h2 className="mb-4">{data.title}</h2> : null}
                    {data.description ? <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">{data.description}</p> : null}
                    {data.btnLabel && data.btnLink ? (
                      <Link href={data.btnLink} className="inline-block rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white transition hover:bg-red hover:text-slate-900">
                        {data.btnLabel}
                      </Link>
                    ) : null}
                  </div>
                </section>
              );
            }

            return <PageSectionsRenderer key={index} sections={[section]} pageData={pageData} />;
          })}
        </>
      )}
    </main>
  );
}
