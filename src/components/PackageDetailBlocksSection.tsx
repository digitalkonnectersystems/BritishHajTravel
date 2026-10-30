'use client';
import { useEffect, useState } from 'react';
import { getPackagesByIds } from '@/actions/packageActions';
import { usePriceFormatter } from '@/components/CurrencyProvider';
import { isTbcPrice } from '@/lib/priceDisplay';

function parseStored(value: any) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return {}; }
}
export default function PackageDetailBlocksSection({ data }: { data: any }) {
  const [pkg, setPkg] = useState<any>(null);
  const formatPrice = usePriceFormatter();
  const packageId = Number(data?.packageId);
  useEffect(() => {
    if (!Number.isSafeInteger(packageId) || packageId < 1) { setPkg(null); return; }
    let alive = true;
    getPackagesByIds([packageId]).then(rows => { if (alive) setPkg(rows[0] || null); }).catch(() => { if (alive) setPkg(null); });
    return () => { alive = false; };
  }, [packageId]);
  if (!pkg) return null;
  const card = parseStored(pkg.cardData), details = parseStored(pkg.detailPageData);
  const galleryRaw = parseStored(pkg.packagesGallery);
  const gallery = Array.isArray(galleryRaw) ? galleryRaw : (Array.isArray(galleryRaw.items) ? galleryRaw.items : []);
  const hotels = [
    { key: 'makkahHotel', label: 'Makkah Hotel' },
    { key: 'madinahHotel', label: 'Madinah Hotel' },
    { key: 'aziziyaHotel', label: 'Aziziyah Hotel' },
    { key: 'minaHotel', label: 'Mina Accommodation' },
  ];
  const enabled = (key: string) => data?.[key] !== false;
  const prices = Array.isArray(details.packagePrices) && details.packagePrices.length ? details.packagePrices : (card.packagePrices || []);
  return <section className="bg-white py-12 px-4">
    <div className="max-w-[1360px] mx-auto space-y-7">
      <div><p className="uppercase tracking-widest text-primary text-xs font-bold">{data?.eyebrow || 'PACKAGE DETAILS'}</p>
        <h2 className="text-2xl md:text-3xl font-semibold text-primary">{data?.title || pkg.title}</h2></div>
      {enabled('showOverview') && (pkg.shortDescription || pkg.fullDescription) && <div className="rounded-xl border p-5 leading-relaxed"><h3 className="font-bold text-primary mb-2">Package Overview</h3><p className="whitespace-pre-line">{pkg.shortDescription || pkg.fullDescription}</p></div>}
      {enabled('showFlight') && (card.flightRoute || details.flightRoute) && <div className="rounded-xl bg-blue-50 border p-5"><h3 className="font-bold text-primary mb-2">Flight Route</h3><p>{card.flightRoute || details.flightRoute}</p></div>}
      {enabled('showHotels') && <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hotels.map(({key, label}) => {
          const hotel = details[key] || card[key] || {};
          if (!hotel.name || hotel.enabled === false) return null;
          return <article key={key} className="rounded-2xl border overflow-hidden bg-white shadow-sm">
            {(hotel.image || card[key]?.image) && <img className="w-full h-48 object-cover" loading="lazy" src={hotel.image || card[key]?.image} alt={hotel.name} />}
            <div className="p-5"><h3 className="font-bold text-primary text-lg">{label}</h3><p className="font-semibold">{hotel.name}</p>
              {hotel.location && <p className="text-sm text-slate-600">{hotel.location}</p>}
              {hotel.nights && <p className="text-sm">{hotel.nights}</p>}
            </div>
          </article>;
        })}
      </div>}
      {enabled('showPrices') && <div className="rounded-xl border p-5">
        <h3 className="font-bold text-primary mb-3">Package Prices</h3>
        {Array.isArray(prices) && prices.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {prices.map((entry: any, i: number) => <div key={i} className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm">{entry.packageType || entry.type || 'Package'}</p>
            <p className="font-bold text-xl">{isTbcPrice(entry.price, entry.priceStatus) ? 'TBC' : formatPrice(entry.price)}</p>
          </div>)}
        </div> : <p className="font-bold">{formatPrice(pkg.startingPrice) || 'Price on request'}</p>}
      </div>}
      {enabled('showInclusions') && Array.isArray(card.includes) && card.includes.length > 0 && <div className="rounded-xl border p-5">
        <h3 className="font-bold text-primary mb-3">What's Included</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">{card.includes.map((item: any, i: number) => <li key={i} className="text-sm">✓ {String(item)}</li>)}</ul>
      </div>}
      {enabled('showGallery') && gallery.length > 0 && <div className="rounded-xl border p-5">
        <h3 className="font-bold text-primary mb-3">Package Gallery</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((item: any, i: number) => {
            const src = typeof item === 'string' ? item : (item?.url || item?.src || item?.image || '');
            return typeof src === 'string' && (/^https:\/\//.test(src) || /^\/(?!\/)/.test(src)) ?
              <img key={i} src={src} alt={typeof item === 'object' && item?.alt ? item.alt : `Package gallery image ${i + 1}`} loading="lazy" className="w-full h-52 object-cover rounded-lg" /> : null;
          })}
        </div>
      </div>}
    </div>
  </section>;
}
