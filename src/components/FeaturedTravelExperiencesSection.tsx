import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Globe2, Landmark, Plane, Ship } from 'lucide-react';
import { safeTravelCardHref, type FeaturedTravelCard, type FeaturedTravelSectionData } from '@/lib/featuredTravelExperiences';

const icons = { landmark: Landmark, plane: Plane, ship: Ship, globe: Globe2 };

/** Render only the CMS-saved section content. Does not add unpublished packages or rates. */
export default function FeaturedTravelExperiencesSection({ data }: { data?: Partial<FeaturedTravelSectionData> }) {
  const cards: FeaturedTravelCard[] = Array.isArray(data?.items)
    ? data.items.filter((card): card is FeaturedTravelCard => Boolean(card && card.visible !== false && card.title?.trim()))
    : [];

  if (!cards.length) return null;

  return (
    <section className="bg-[#fafbfe] py-12 md:py-16" aria-label={data?.title || 'Featured travel experiences'}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="mx-auto mb-6 max-w-3xl text-center">
          {data?.eyebrow && <p className="eyebrow justify-center">{data.eyebrow}</p>}
          {data?.title && <h2 className="font-serif text-primary text-[clamp(1.5rem,2.2vw,2.25rem)] leading-[0.98] !justify-center">{data.title}</h2>}
          {data?.subtitle && <p className="max-w-2xl text-center mx-auto text-sm leading-relaxed pt-4">{data.subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, i) => {
            const Icon = icons[card.icon] || Globe2;
            const href = safeTravelCardHref(card.buttonHref);
            const lines = typeof card.details === 'string' ? card.details.split(/\r?\n/).map(line => line.trim()).filter(Boolean) : [];
            return (
              <article key={card.id || i} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,14,67,0.06)] transition-shadow hover:shadow-[0_18px_44px_rgba(2,14,67,0.12)]">
                {card.image ? (
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw" unoptimized />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  {/* <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red/15 bg-red/5 text-red">
                    <Icon size={27} strokeWidth={1.7} aria-hidden="true" />
                  </div> */}
                  <h3 className="m-0 font-serif text-2xl leading-snug text-primary">{card.title}</h3>
                  {card.description && <p className="mb-0 mt-3 text-sm leading-5 text-ink-soft">{card.description}</p>}
                  {lines.length > 0 && (
                    <ul className="mb-6 mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm leading-6 text-ink-soft">
                      {lines.map((line, j) => (
                        <li key={`${card.id || i}-${j}`} className="flex gap-2.5"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red" />{line}</li>
                      ))}
                    </ul>
                  )}
                  {href && card.buttonLabel && (
                    <Link href={href} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-red hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red">
                      {card.buttonLabel}<ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
