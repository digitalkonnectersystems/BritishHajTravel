import { hotelCategoryMatchesSection, selectDirectoryHotels, type DirectoryCategory } from '@/lib/hotelSectionSelection';

function Stars({ rating }: { rating: string | null }) {
  const value = Number(rating);
  const count = Number.isFinite(value) ? Math.max(0, Math.min(5, Math.round(value))) : 5;
  return <span aria-label={`${count} out of 5 stars`} className="text-xl leading-none tracking-[-0.16em] text-[#f2a83b]">{'★'.repeat(count)}</span>;
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
      <div className="mx-auto max-w-[1090px]">
        <h2 className="mb-10 text-center text-2xl font-extrabold uppercase leading-tight text-primary md:text-4xl">{title}</h2>
        <div className="space-y-5">
          {hotels.map(hotel => (
            <article key={hotel.id} className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_5px_16px_rgba(0,0,0,0.18)] md:grid-cols-[345px_1fr_245px]">
              <div className="relative min-h-[220px] bg-slate-100 md:min-h-[228px]">
                {hotel.imageUrl ? <img src={hotel.imageUrl} alt={hotel.name} className="absolute inset-0 h-full w-full object-cover" /> :
                  <div className="flex h-full min-h-[220px] items-center justify-center text-sm font-semibold text-slate-400">Hotel image coming soon</div>}
              </div>
              <div className="flex flex-col justify-center px-5 py-7 md:px-5 md:py-8">
                <h3 className="text-2xl font-medium uppercase leading-tight text-[#283695] md:text-[27px]">{hotel.name}</h3>
                <div className="mt-4"><Stars rating={hotel.rating} /></div>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500"><span className="font-bold text-slate-700">{hotel.city}</span>{hotel.description ? ` · ${hotel.description}` : ''}</p>
              </div>
              <div className="flex flex-row items-center justify-between gap-5 border-t border-slate-200 px-5 py-6 text-center md:flex-col md:justify-center md:border-l md:border-t-0 md:py-8">
                <div><p className="text-sm font-bold text-black">{hotel.priceLabel || 'TBC'}</p><p className="mt-5 text-sm text-black">{hotel.pricePeriod || 'per Night'}</p></div>
                {/^(https?:\/\/)/i.test(hotel.websiteUrl) && <a href={hotel.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 min-w-[150px] items-center justify-center rounded bg-[#ff1010] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#c90000]">See Details</a>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
