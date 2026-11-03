import { ChevronRight } from 'lucide-react';
import { hotelCategoryMatchesSection, selectDirectoryHotels, type DirectoryCategory } from '@/lib/hotelSectionSelection';

function Stars({ rating }: { rating: string | null }) {
  const value = Number(rating);
  const count = Number.isFinite(value) ? Math.max(0, Math.min(5, Math.round(value))) : 5;
  return (
    <span aria-label={`${count} out of 5 stars`} className="inline-block text-lg leading-none tracking-wide text-[#f2a83b]">
      {'★'.repeat(count)}
    </span>
  );
}

export default function HotelDirectorySection({
  data, categories, type,
}: {
  data?: { categoryId?: number | string; hotelIds?: number[]; title?: string } | null;
  categories: DirectoryCategory[];
  type: 'Makkah Hotels Directory' | 'Madinah Hotels Directory';
}) {
  const { category, hotels } = selectDirectoryHotels(categories, data?.categoryId, data?.hotelIds);
  if (!category || !hotelCategoryMatchesSection(category, type) || hotels.length === 0) return null;
  const title = typeof data?.title === 'string' && data.title.trim() ? data.title.trim() : `Hotels in ${category.name}`;

  return (
    <section id={category.slug} aria-label={title} className="scroll-mt-28 bg-blue-lt px-4 py-12 md:px-6 md:py-16" data-section-type={type}>
      <div className="mx-auto max-w-[1400px]">
        <h2 className="mb-10 text-center text-2xl font-extrabold uppercase leading-tight text-primary md:text-4xl">{title}</h2>
        <div className="space-y-5">
          {hotels.map(hotel => (
            <article
              key={hotel.id}
              className="group grid overflow-hidden rounded-xl border border-[#d1d1d1] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] md:grid-cols-[minmax(0,42%)_minmax(0,58%)] lg:min-h-[290px] lg:grid-cols-[minmax(0,33%)_minmax(0,47%)_minmax(0,20%)] xl:min-h-[250px]"
            >
              {/* Hotel photo always fills the complete left column on desktop. */}
              <div className="relative min-h-[220px] overflow-hidden bg-slate-100 sm:min-h-[240px] lg:min-h-0">
                {hotel.imageUrl ? (
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full min-h-[240px] items-center justify-center text-sm font-semibold text-ink-light">
                    Hotel image coming soon
                  </div>
                )}
              </div>

              {/* Keep the hotel's existing content typography and colors. */}
              <div className="flex min-w-0 flex-col justify-center px-5 py-6 md:px-6 lg:px-7 xl:px-8">
                <h3 className="font-serif text-xl uppercase leading-snug text-primary md:text-2xl">
                  {hotel.name}
                </h3>
                <div className="mt-3"><Stars rating={hotel.rating} /></div>
                <p className="mt-3 break-words text-sm leading-5 text-ink-soft">
                  <span className="font-semibold text-primary">{hotel.city}</span>
                  {hotel.description ? ` · ${hotel.description}` : ''}
                </p>
              </div>

              {/* Right-side price/actions stay beside the description at desktop widths. */}
              <div className="flex min-w-0 flex-col items-center justify-center gap-5 border-t border-[#e5ebf4] bg-white px-5 py-6 text-center sm:flex-row sm:justify-between md:col-span-2 md:px-7 lg:col-span-1 lg:my-8 lg:flex-col lg:justify-around lg:gap-6 lg:border-l lg:border-t-0 lg:px-5 lg:py-0">
                <div>
                  <p className="text-2xl font-extrabold leading-tight text-primary">{hotel.priceLabel || 'TBC'}</p>
                  <p className="mt-3 text-sm font-medium text-ink-soft">{hotel.pricePeriod || 'per Night'}</p>
                </div>
                {/^(https?:\/\/)/i.test(hotel.websiteUrl) && (
                  <a
                    href={hotel.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-[0_5px_12px_rgba(0,0,0,0.12)] transition-colors hover:bg-white hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red sm:w-auto sm:min-w-[155px] lg:w-full lg:min-w-0"
                  >
                    See Details
                    <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
