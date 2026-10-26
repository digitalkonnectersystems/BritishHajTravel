"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { getDurationUnit } from "@/lib/packageHelpers";

export type HajjCardAccommodation = {
  city: string;
  subtitle?: string;
  location?: string;
  badge?: string;
  badgeIcon?: string;
  badgeEnabled?: boolean;
  nights?: string;
  image?: string;
  durationEnabled?: boolean;
};

export type HajjLandscapeCardProps = {
  heroImage: string;
  packageTitle: string;
  badgeTag?: string;
  duration?: string;
  flightRoute?: string;
  packageCode?: string;
  accommodations: HajjCardAccommodation[];
  inclusions: any[];
  eligibility: string[];
  operatorName?: string;
  operatorRating?: string;
  priceSubtext?: string;
  price?: string;
  bookLabel: string;
  onViewDetail: () => void;
  onBook: () => void;
};

/** Responsive Hajj package card. Data and click handlers are supplied by the parent. */
export default function HajjLandscapeCard({
  heroImage,
  packageTitle,
  badgeTag,
  duration,
  flightRoute,
  packageCode,
  accommodations,
  inclusions,
  eligibility,
  operatorName,
  operatorRating,
  priceSubtext,
  price,
  bookLabel,
  onViewDetail,
  onBook,
}: HajjLandscapeCardProps) {
  // Show two compact hotel rows and advance by one without changing the package pager.
  const [accommodationStart, setAccommodationStart] = useState(0);
  const maxAccommodationStart = Math.max(0, accommodations.length - 2);
  const safeAccommodationStart = Math.min(accommodationStart, maxAccommodationStart);
  const visibleAccommodations = accommodations.slice(
    safeAccommodationStart,
    safeAccommodationStart + 2
  );
  const canShowPreviousHotel = safeAccommodationStart > 0;
  const canShowNextHotel = safeAccommodationStart < maxAccommodationStart;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.07)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
      {/* Compact, consistent image height in the four-column package grid. */}
      <div className="relative h-[180px] shrink-0 overflow-hidden bg-[#071a45] xl:h-[160px]">
        {heroImage ? (
          <img
            src={heroImage}
            alt={packageTitle}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#071a45] via-[#133877] to-[#27599a]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071a45]/70 via-transparent to-black/30" />
        <div className="absolute left-3 right-3 top-3 flex flex-wrap items-start justify-between gap-1.5">
          {badgeTag && (
            <span
              title={badgeTag}
              className="inline-flex min-w-0 max-w-[60%] items-center gap-1 rounded-full border border-white/30 bg-white/95 px-2 py-1 text-[10px] font-bold uppercase text-primary shadow-sm"
            >
              <LucideIcons.Landmark className="h-3 w-3 shrink-0" />
              <span className="truncate">{badgeTag}</span>
            </span>
          )}
          {duration && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red px-2 py-1 text-[10px] font-extrabold text-white shadow-sm">
              <LucideIcons.CalendarDays className="h-3 w-3 shrink-0" />
              {duration}
            </span>
          )}
        </div>
        {flightRoute && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-[#071a45]/75 px-2.5 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm">
              <LucideIcons.Plane className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate" title={flightRoute}>{flightRoute}</span>
            </div>
          </div>
        )}
      </div>

      {/* Fixed heading height keeps every Accommodations section at the same y-position. */}
      <div className="h-[103px] shrink-0 overflow-hidden px-3 pb-1 pt-2.5 sm:px-4 xl:px-3">
        <h3
          title={packageTitle}
          className="line-clamp-3 h-[63px] text-[19px] font-extrabold leading-[21px] tracking-tight text-primary [overflow-wrap:anywhere] xl:text-[18px]"
        >
          {packageTitle}
        </h3>
        {packageCode && (
          <span
            title={packageCode}
            className="mt-1 inline-block max-w-full truncate rounded bg-slate-100 px-2 py-0.5 align-top text-[12px] font-bold text-slate-600"
          >
            Code: {packageCode}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-3 pb-3 sm:px-4 xl:px-3">
        {/* Two visible hotel rows. Remaining hotels are available using the arrows. */}
        <section aria-label="Accommodations" className="min-w-0 shrink-0 border-t border-slate-100 pt-2.5 xl:h-[211px]">
          <div className="mb-2 flex h-[29px] items-center justify-between gap-2">
            <h4 className="flex min-w-0 items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[0.035em] text-primary">
              <LucideIcons.Hotel className="h-3.5 w-3.5 shrink-0 text-red" />
              Accommodations
            </h4>
            {accommodations.length > 2 && (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous hotel"
                  onClick={() => setAccommodationStart((current) => Math.max(0, Math.min(current, maxAccommodationStart) - 1))}
                  disabled={!canShowPreviousHotel}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-primary hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <LucideIcons.ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Next hotel"
                  onClick={() => setAccommodationStart((current) => Math.min(maxAccommodationStart, Math.min(current, maxAccommodationStart) + 1))}
                  disabled={!canShowNextHotel}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-primary hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <LucideIcons.ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            {visibleAccommodations.map((acc, aIdx) => {
              const stayText = String(acc.nights || "").trim();
              const stayUnit = getDurationUnit(stayText) === "days" ? "Days" : "Nights";
              const showStay = acc.durationEnabled !== false && Boolean(stayText);
              return (
                <div
                  key={`${acc.city}-${safeAccommodationStart + aIdx}`}
                  className="flex h-[78px] min-w-0 items-center gap-2 overflow-hidden rounded-lg border border-slate-200 bg-[#f8fafc] p-1.5"
                >
                  <div className="h-full w-[58px] shrink-0 overflow-hidden rounded-md bg-slate-200">
                    {acc.image ? (
                      <img
                        src={acc.image}
                        alt={acc.subtitle || `${acc.city} hotel`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <LucideIcons.Hotel className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
                    <p className="truncate text-[10px] font-extrabold uppercase text-primary" title={acc.city}>{acc.city}</p>
                    {acc.subtitle && (
                      <p title={acc.subtitle} className="truncate text-[12px] font-bold leading-[14px] text-slate-800">{acc.subtitle}</p>
                    )}
                    {acc.location && (
                      <p className="flex min-w-0 items-center gap-0.5 text-[10px] text-slate-500">
                        <LucideIcons.MapPin className="h-2.5 w-2.5 shrink-0 text-red" />
                        <span title={acc.location} className="truncate">{acc.location}</span>
                      </p>
                    )}
                    {(showStay || (acc.badgeEnabled !== false && acc.badge)) && (
                      <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                        {showStay && (
                          <span title={`${stayText} (${stayUnit})`} className="inline-flex max-w-[52%] shrink-0 items-center gap-0.5 truncate rounded bg-red/10 px-1 py-0.5 text-[9px] font-bold text-red">
                            {stayUnit === "Days" ? <LucideIcons.Sun className="h-2.5 w-2.5 shrink-0" /> : <LucideIcons.MoonStar className="h-2.5 w-2.5 shrink-0" />}
                            <span className="truncate">{stayText}</span>
                          </span>
                        )}
                        {acc.badgeEnabled !== false && acc.badge && (
                          <span title={acc.badge} className="inline-flex min-w-0 items-center gap-0.5 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-bold text-primary">
                            <DynamicIcon name={acc.badgeIcon || "Utensils"} className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">{acc.badge}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {accommodations.length === 0 && (
              <p className="rounded-lg bg-slate-50 px-2 py-3 text-[12px] text-slate-500">No accommodation details listed.</p>
            )}
          </div>
        </section>

        {/* Fixed desktop section height; long lists scroll rather than lengthening one card. */}
        <section aria-label="Package inclusions" className="mt-2.5 min-w-0 shrink-0 border-t border-slate-100 pt-2.5 xl:h-[147px]">
          <h4 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.035em] text-primary">Package inclusions</h4>
          <div className="grid grid-cols-3 gap-1.5 xl:max-h-[120px] xl:overflow-y-auto xl:pr-0.5" tabIndex={inclusions.length > 6 ? 0 : undefined}>
            {inclusions.map((inc: any, iIdx: number) => {
              const label = typeof inc === "string" ? inc : String(inc?.text || "");
              const iconName = typeof inc === "string" ? "CheckCircle" : (inc?.icon || "CheckCircle");
              return (
                <div key={iIdx} title={label} className="flex min-h-[46px] min-w-0 flex-col items-center justify-center gap-1 rounded-md border border-[#e8eef7] bg-[#f6f9fe] px-1 py-1.5 text-center">
                  <DynamicIcon name={iconName} className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="line-clamp-2 max-w-full whitespace-pre-line text-[9px] font-semibold leading-[11px] text-slate-700 [overflow-wrap:anywhere]">{label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-label="Package eligibility" className="mt-2.5 min-w-0 shrink-0 border-t border-slate-100 pt-2.5 xl:h-[140px]">
          <h4 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.035em] text-primary">Eligibility</h4>
          <ul className="space-y-1.5 xl:max-h-[140px] xl:overflow-y-auto xl:pr-1 mb-2" tabIndex={eligibility.length > 2 ? 0 : undefined}>
            {eligibility.map((item, iIdx) => (
              <li key={iIdx} className="flex min-w-0 items-start gap-1.5 text-[10px] leading-[14px] text-slate-600 font-bold">
                <LucideIcons.CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[#16804a]" />
                <span className="min-w-0 [overflow-wrap:anywhere]">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pinned bottom panel: identical button alignment even with differing card content. */}
        <div className="mt-auto border-t border-slate-100 pt-2.5">
          {(operatorName || operatorRating || price || priceSubtext) && (
            <div className="flex min-w-0 items-end justify-between gap-2 rounded-lg border border-[#e5eaf3] bg-[#f8faff] p-2.5">
              {(operatorName || operatorRating) && (
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase text-slate-500">Operator</p>
                  {operatorName && <p title={operatorName} className="mt-0.5 truncate text-[12px] font-extrabold text-primary">{operatorName}</p>}
                  {operatorRating && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary">
                      <LucideIcons.Star className="h-2.5 w-2.5 fill-[#e5a719] text-[#e5a719]" />{operatorRating}
                    </span>
                  )}
                </div>
              )}
              {(price || priceSubtext) && (
                <div className="min-w-0 text-right">
                  {priceSubtext && <p title={priceSubtext} className="max-w-[130px] truncate text-[9px] font-bold uppercase text-red">{priceSubtext}</p>}
                  {price && <p title={price} className="mt-0.5 text-[18px] font-black leading-none tracking-tight text-primary">{price}</p>}
                </div>
              )}
            </div>
          )}
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <button type="button" onClick={onViewDetail} className="inline-flex min-h-[40px] min-w-0 items-center justify-center gap-1 rounded-lg border border-primary bg-white px-1.5 py-1.5 text-center text-[12px] font-extrabold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              <LucideIcons.Eye className="h-4.5 w-4.5 shrink-0" />View Details
            </button>
            <button type="button" onClick={onBook} className="inline-flex min-h-[40px] min-w-0 items-center justify-center gap-1 rounded-lg bg-red px-1.5 py-1.5 text-center text-[12px] font-extrabold text-white transition-colors hover:bg-red/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red">
              <LucideIcons.BookOpen className="h-4.5 w-4.5 shrink-0" />
              <span className="line-clamp-2 min-w-0 [overflow-wrap:anywhere]">{bookLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
