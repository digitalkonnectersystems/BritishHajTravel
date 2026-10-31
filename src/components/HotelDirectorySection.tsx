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
            <article key={hotel.id} className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_5px_16px_rgba(0,0,0,0.18)] md:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.1fr)] min-[1025px]:grid-cols-[345px_1fr_245px]">
              <div className="relative min-h-[185px] bg-slate-100 sm:min-h-[215px] md:min-h-[228px]">
                {hotel.imageUrl ? <img src={hotel.imageUrl} alt={hotel.name} className="absolute inset-0 h-full w-full object-cover" /> :
                  <div className="flex h-full min-h-[220px] items-center justify-center text-sm font-semibold text-slate-400">Hotel image coming soon</div>}
              </div>
              <div className="flex min-w-0 flex-col justify-center px-4 py-5 sm:px-5 md:py-6 lg:py-8">
                <h3 className="text-2xl font-medium uppercase leading-tight text-[#283695] md:text-[27px]">{hotel.name}</h3>
                <div className="mt-4"><Stars rating={hotel.rating} /></div>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500"><span className="font-bold text-slate-700">{hotel.city}</span>{hotel.description ? ` · ${hotel.description}` : ''}</p>
              </div>
              <div className="flex min-w-0 flex-col items-stretch gap-3 border-t border-slate-200 px-4 py-4 text-center sm:flex-row sm:items-center sm:justify-between md:col-span-2 md:px-5 min-[1025px]:col-span-1 min-[1025px]:flex-col min-[1025px]:justify-center min-[1025px]:gap-5 min-[1025px]:border-l min-[1025px]:border-t-0 min-[1025px]:py-8">
                <div><p className="text-sm font-bold text-black">{hotel.priceLabel || 'TBC'}</p><p className="mt-1 text-sm text-black lg:mt-5">{hotel.pricePeriod || 'per Night'}</p></div>
                {/^(https?:\/\/)/i.test(hotel.websiteUrl) && <a href={hotel.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-full items-center justify-center rounded sm:w-auto sm:min-w-[150px] bg-[#ff1010] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#c90000]">See Details</a>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
