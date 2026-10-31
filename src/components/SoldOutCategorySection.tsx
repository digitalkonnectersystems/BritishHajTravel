'use client';

import { useEffect, useState } from 'react';
import { Bus, Building2, Check, FileText, MoonStar, Plane, Tent, UserRound } from 'lucide-react';
import { getSoldOutPackages } from '@/actions/packageActions';
import { usePriceFormatter } from '@/components/CurrencyProvider';

type PackageType = 'hajj' | 'umrah';
type SectionData = {
  eyebrow?: string;
  title?: string;
  description?: string;
  badgeImage?: string;
};

type PackageRow = {
  id: number;
  type: string;
  status: string;
  title: string;
  startingPrice?: number | string | null;
  featuredImage?: string | null;
  cardData?: Record<string, any> | string | null;
};

function cardDataFor(pkg: PackageRow): Record<string, any> {
  if (pkg.cardData && typeof pkg.cardData === 'object') return pkg.cardData;
  if (typeof pkg.cardData === 'string') {
    try { return JSON.parse(pkg.cardData) || {}; } catch { return {}; }
  }
  return {};
}

function eligibleSoldOutPackages(items: PackageRow[], packageType: PackageType): PackageRow[] {
  return items.filter((pkg) => pkg.status === 'sold_out' && pkg.type === packageType && cardDataFor(pkg).isVisible !== false);
}

function includeIcon(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('flight')) return Plane;
  if (lower.includes('transport') || lower.includes('bus')) return Bus;
  if (lower.includes('hotel') || lower.includes('accommodation')) return Building2;
  if (lower.includes('visa') || lower.includes('document')) return FileText;
  if (lower.includes('guide') || lower.includes('imam')) return UserRound;
  return Check;
}

/** Shared presentation, used by two separately registered CMS section components. */
export default function SoldOutCategorySection({
  packageType,
  data = {},
  initialPackages,
}: {
  packageType: PackageType;
  data?: SectionData;
  initialPackages?: PackageRow[];
}) {
  const formatPrice = usePriceFormatter();
  const [packages, setPackages] = useState<PackageRow[]>(() => eligibleSoldOutPackages(initialPackages || [], packageType));
  const [loading, setLoading] = useState(!Array.isArray(initialPackages));

  // Refresh on mount, including with SSR data. A package newly marked sold out
  // should appear without requiring a manual selection in the page editor.
  useEffect(() => {
    let active = true;
    getSoldOutPackages()
      .then((items) => { if (active) setPackages(eligibleSoldOutPackages(items as PackageRow[], packageType)); })
      .catch((error) => { console.error('Unable to refresh sold-out packages:', error); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [packageType]);

  const heading = data.title?.trim() || (packageType === 'hajj'
    ? 'Hajj Packages Officially Sold Out' : 'Umrah Packages Officially Sold Out');
  const eyebrow = data.eyebrow?.trim() || 'LUXURY PACKAGES';
  const description = data.description?.trim() || '';
  const badgeImage = typeof data.badgeImage === 'string' && /^(\/|https?:\/\/)/i.test(data.badgeImage)
    && /\.(png|jpe?g|webp)(?:[?#]|$)/i.test(data.badgeImage)
    ? data.badgeImage : '';

  // Keep the section out of the page when there are no sold-out cards.
  if (!loading && packages.length === 0) return null;

  return (
    <section className="w-full py-10 sm:py-12 lg:py-14" style={{ backgroundColor: '#fff' }} aria-label={heading}>
      <div className="mx-auto w-full max-w-[1400px] px-4">
        <div className="mb-7 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,370px)] md:items-end md:gap-8">
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.22em] sm:text-[15px]" style={{ color: '#b50007' }}>{eyebrow}</p>
            <h2 className="max-w-[520px] font-serif text-[27px] leading-[1.14] sm:text-[32px] lg:text-[38px]" style={{ color: '#020e43' }}>{heading}</h2>
          </div>
          {description && <p className="max-w-[460px] border-l-2 border-slate-200 pl-4 text-[13px] leading-[1.7] sm:text-[14px]" style={{ color: '#020e43' }}>{description}</p>}
        </div>
        {loading && packages.length === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[1, 2, 3].map(i => <div key={i} className="h-[475px] animate-pulse rounded-[22px] bg-white/70" />)}
          </div>
        ) : (
          <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {packages.map((pkg) => {
              const card = cardDataFor(pkg);
              const hero = String(card.bannerImage || pkg.featuredImage || '');
              const inclusions = Array.isArray(card.includes) ? card.includes : [];
              const price = Number(pkg.startingPrice);
              const displayedPrice = Number.isFinite(price) && price > 0
                ? formatPrice(pkg.startingPrice) : 'Price on request';
              return (
                <article key={pkg.id} className="flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#e2e5dc] bg-white shadow-sm">
                  <div className="relative h-[195px] overflow-hidden bg-slate-700 sm:h-[220px]">
                    {hero ? (
                      <img src={hero} alt={pkg.title} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-slate-600 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-black/55" />
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-5">
                      {badgeImage ? (
                        <img src={badgeImage} alt="Sold out" loading="lazy" className="max-h-[128px] max-w-[72%] object-contain drop-shadow-xl" />
                      ) : (
                        <span className="-rotate-[18deg] border-[4px] border-white px-3 py-1.5 text-[24px] font-black uppercase tracking-tight text-white drop-shadow-2xl sm:text-[28px]">SOLD OUT</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold tracking-[0.13em]" style={{ color: '#071B2E' }}>
                      {packageType === 'hajj' ? <Tent className="h-4 w-4" aria-hidden="true" /> : <MoonStar className="h-4 w-4" aria-hidden="true" />}
                      {packageType.toUpperCase()}
                    </div>
                    <h3 className="mb-2 font-serif text-[23px] leading-[1.15] sm:text-[25px]" style={{ color: '#071B2E' }}>{pkg.title}</h3>
                    <p className="text-[12px]" style={{ color: '#243246' }}>Starting From</p>
                    <p className="mb-5 mt-0.5 text-[20px] font-bold leading-tight" style={{ color: '#071B2E' }}>
                      {displayedPrice}
                      {displayedPrice !== 'Price on request' && <span className="ml-1 text-[12px] font-normal">/ Person</span>}
                    </p>
                    {inclusions.length > 0 && (
                      <>
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: '#071B2E' }}>PACKAGE INCLUDES</p>
                        <ul className="mt-auto space-y-3">
                          {inclusions.map((item: any, index: number) => {
                            const text = typeof item === 'string' ? item : String(item?.text || '');
                            if (!text) return null;
                            const Icon = includeIcon(text);
                            return <li key={index} className="flex items-start gap-3 text-[12px] leading-5" style={{ color: '#0F2433' }}>
                              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                              <span>{text}</span>
                            </li>;
                          })}
                        </ul>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
