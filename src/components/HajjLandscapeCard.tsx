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

/** Responsive landscape Hajj card; compact on a two-card desktop row. Data is supplied by the parent. */
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
  // Keep every desktop hotel tile one-third of the accommodations row.
  // Navigation is local to this card and never changes the package pager.
  const [accommodationStart, setAccommodationStart] = useState(0);
  const maxAccommodationStart = Math.max(0, accommodations.length - 3);
  const safeAccommodationStart = Math.min(accommodationStart, maxAccommodationStart);
  const visibleAccommodations = accommodations.slice(safeAccommodationStart, safeAccommodationStart + 3);
  const canShowPreviousHotel = safeAccommodationStart > 0;
  const canShowNextHotel = safeAccommodationStart < maxAccommodationStart;

  return (
    <article className="min-w-0 overflow-hidden rounded-[24px] border border-[#e6ebf0] bg-white shadow-[0_8px_26px_rgba(10,27,67,0.09)]">
      {/* Full-width hero banner */}
      <div className="relative h-[200px] w-full overflow-hidden sm:h-[225px] xl:h-[200px]">
        {heroImage ? (
          <img src={heroImage} alt={packageTitle} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[#071a45]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-black/10" />
        {badgeTag && (
          <div className="absolute left-5 top-4 flex max-w-[65%] items-center gap-2 rounded-full bg-[#071637]/65 px-3 py-1.5 text-[12px] font-extrabold uppercase tracking-wide text-white sm:left-7 sm:text-[15px] xl:left-3 xl:top-2 xl:gap-1 xl:px-2 xl:py-1 xl:text-[11px]">
            <LucideIcons.Landmark className="h-5 w-5 shrink-0 xl:h-3 xl:w-3" />
            <span className="min-w-0 [overflow-wrap:anywhere]">{badgeTag}</span>
          </div>
        )}
        {duration && (
          <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-red px-3.5 py-2 text-[12px] font-extrabold text-white shadow-md sm:right-6 sm:text-base xl:right-2 xl:top-2 xl:gap-1 xl:px-2 xl:py-1 xl:text-[11px]">
            <LucideIcons.CalendarDays className="h-[18px] w-[18px] shrink-0 xl:h-3 xl:w-3" />
            <span>{duration}</span>
          </div>
        )}
        <div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-5 sm:left-9 sm:right-8 xl:bottom-2 xl:left-4 xl:right-3">
          {flightRoute && (
            <p className="mb-1.5 flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide sm:text-[16px] xl:mb-0 xl:gap-1 xl:text-[11px]">
              <LucideIcons.Plane className="h-[18px] w-[18px] shrink-0 xl:h-3 xl:w-3" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{flightRoute}</span>
            </p>
          )}
          <h3 className="max-w-[90%] font-serif text-[27px] font-bold leading-[1.12] [overflow-wrap:anywhere] sm:text-[38px] lg:text-[44px] xl:max-w-[95%] xl:text-[23px] xl:leading-[1.02]">
            {packageTitle}
          </h3>
        </div>
      </div>

      <div className="min-w-0 px-4 pb-4 pt-4 sm:px-7 sm:pb-5 xl:px-3 xl:pb-3 xl:pt-2">
        {accommodations.length > 0 && (
          <section aria-label="Accommodations" className="mb-5 xl:mb-3">
            <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2 xl:mb-1.5">
              <h4 className="text-[16px] font-black uppercase tracking-[0.02em] text-primary sm:text-[20px] xl:text-[11px]">ACCOMMODATIONS</h4>
              {packageCode && (
                <span className="max-w-full rounded-full bg-primary px-4 py-1.5 text-[11px] font-extrabold text-white [overflow-wrap:anywhere] sm:text-[12px] xl:px-2 xl:py-1 xl:text-[10px]">
                  PKG CODE: {packageCode}
                </span>
              )}
            </div>
            {/* Arrows overlay the hotel row without reducing the width of the three equal hotel columns. */}
            <div className="relative min-w-0">
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-2">
              {visibleAccommodations.map((acc, aIdx) => {
                const stayText = String(acc.nights || "").trim();
                const stayUnit = getDurationUnit(stayText) === "days" ? "Days" : "Nights";
                const showStay = acc.durationEnabled !== false && Boolean(stayText);
                return (
                  <div key={`${acc.city}-${safeAccommodationStart + aIdx}`} className="flex min-w-0 items-stretch gap-3 rounded-2xl border border-[#dfe6db] bg-[#fcfdf9] p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.025)] xl:gap-1.5 xl:rounded-xl xl:p-1.5">
                    <div className="relative min-h-[115px] w-[34%] max-w-[150px] shrink-0 overflow-hidden rounded-xl bg-slate-100 xl:min-h-[73px] xl:max-w-[78px] xl:rounded-md">
                      {acc.image ? (
                        <img src={acc.image} alt={acc.subtitle || `${acc.city} hotel`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"><LucideIcons.Hotel className="h-7 w-7 text-slate-400" /></div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-2 py-0.5 xl:gap-1 xl:py-0">
                      <div className="min-w-0 w-full">
                        <p className="mb-1 text-[12px] font-black uppercase text-primary [overflow-wrap:anywhere] sm:text-[13px] xl:mb-0.5 xl:text-[11px]">{acc.city}</p>
                        {acc.subtitle && (
                          <p className="whitespace-normal text-[12px] font-extrabold leading-[1.24] text-red [overflow-wrap:anywhere] sm:text-[14px] xl:text-[11px] xl:leading-[1.15]">{acc.subtitle}</p>
                        )}
                        {acc.location && (
                          <p className="mt-1.5 flex min-w-0 items-start gap-1.5 text-[11px] leading-snug text-primary sm:text-[12px] xl:mt-0.5 xl:gap-0.5 xl:text-[10px]">
                            <LucideIcons.MapPin className="mt-[2px] h-3.5 w-3.5 shrink-0 xl:h-2.5 xl:w-2.5" />
                            <span className="min-w-0 [overflow-wrap:anywhere]">{acc.location}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-wrap gap-1.5 xl:gap-1">
                        {showStay && (
                          <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-red px-2 py-1 text-[11px] font-extrabold text-white [overflow-wrap:anywhere] sm:text-[12px] xl:px-1.5 xl:py-0.5 xl:text-[10px]">
                            {stayUnit === "Days" ? <LucideIcons.Sun className="h-3.5 w-3.5 shrink-0" /> : <LucideIcons.MoonStar className="h-3.5 w-3.5 shrink-0" />}
                            {stayText}
                          </span>
                        )}
                        {acc.badgeEnabled !== false && acc.badge && (
                          <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-white [overflow-wrap:anywhere] xl:px-1.5 xl:py-0.5 xl:text-[10px]">
                            <DynamicIcon name={acc.badgeIcon || "Utensils"} className="h-3 w-3 shrink-0" />
                            {acc.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
              {canShowPreviousHotel && (
                <button
                  type="button"
                  onClick={() => setAccommodationStart((current) => Math.max(0, Math.min(current, maxAccommodationStart) - 1))}
                  aria-label="Previous hotel"
                  className="absolute left-0 top-1/2 z-20 inline-flex h-9 w-7 -translate-x-1/4 -translate-y-1/2 items-center justify-center rounded-r-lg border border-primary/25 bg-white/95 text-primary shadow-[0_2px_10px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-colors hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <LucideIcons.ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {canShowNextHotel && (
                <button
                  type="button"
                  onClick={() => setAccommodationStart((current) => Math.min(maxAccommodationStart, Math.min(current, maxAccommodationStart) + 1))}
                  aria-label="Next hotel"
                  className="absolute right-0 top-1/2 z-20 inline-flex h-9 w-7 translate-x-1/4 -translate-y-1/2 items-center justify-center rounded-l-lg border border-primary/25 bg-white/95 text-primary shadow-[0_2px_10px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-colors hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <LucideIcons.ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </section>
        )}

        {(inclusions.length > 0 || eligibility.length > 0) && (
          <div className={`grid min-w-0 gap-4 xl:gap-2 ${inclusions.length > 0 && eligibility.length > 0 ? "lg:grid-cols-[1.48fr_1fr]" : "grid-cols-1"}`}>
            {inclusions.length > 0 && (
              <section aria-label="Package inclusions" className="relative min-w-0 pt-3">
                <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-6 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white sm:text-[12px] xl:px-4 xl:py-1 xl:text-[10px]">
                  PACKAGE INCLUSIONS
                </div>
                <div className="h-full rounded-2xl border border-[#dfe8df] bg-[#f8faf6] px-3 pb-3 pt-7 sm:px-4 xl:rounded-lg xl:px-1.5 xl:pb-2 xl:pt-4">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 xl:gap-0.5">
                    {inclusions.map((inc: any, iIdx: number) => {
                      const label = typeof inc === "string" ? inc : String(inc?.text || "");
                      const iconName = typeof inc === "string" ? "CheckCircle" : (inc?.icon || "CheckCircle");
                      return (
                        <div key={iIdx} className="flex min-w-0 flex-col items-center gap-2 text-center xl:gap-1">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c8d7ea] bg-white sm:h-12 sm:w-12 xl:h-7 xl:w-7">
                            <DynamicIcon name={iconName} className="h-5 w-5 text-primary xl:h-3.5 xl:w-3.5" />
                          </span>
                          <span className="w-full whitespace-pre-line text-[10px] font-semibold leading-[1.2] text-primary [overflow-wrap:anywhere] sm:text-[11px] xl:text-[10px]">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
            {eligibility.length > 0 && (
              <section aria-label="Package eligibility" className="min-w-0 rounded-2xl border border-[#dfe8df] bg-[#f8faf6] px-4 py-3 lg:mt-3 xl:rounded-lg xl:px-2 xl:py-2">
                <ul className="space-y-2 xl:space-y-1">
                  {eligibility.map((item, iIdx) => (
                    <li key={iIdx} className="flex min-w-0 items-start gap-3 text-[11px] leading-[1.3] text-primary sm:text-[12px] xl:gap-1 xl:text-[10px] xl:leading-[1.24]">
                      <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white xl:h-3.5 xl:w-3.5">
                        <LucideIcons.Check className="h-3.5 w-3.5 stroke-[3] xl:h-2.5 xl:w-2.5" />
                      </span>
                      <span className="min-w-0 [overflow-wrap:anywhere]">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <div className="mt-4 flex min-w-0 flex-col gap-4 border-t border-[#e5e8ec] pt-4 lg:flex-row lg:items-center lg:justify-between lg:gap-5 xl:mt-2.5 xl:gap-2 xl:pt-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase text-primary xl:text-[11px]">OPERATOR</p>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
              {operatorName && <span className="min-w-0 text-[18px] font-black leading-tight text-primary [overflow-wrap:anywhere] sm:text-[22px] xl:text-[13px]">{operatorName}</span>}
              {operatorRating && <span className="shrink-0 rounded-md bg-red px-2 py-1 text-[12px] font-extrabold text-white xl:px-1.5 xl:py-0.5 xl:text-[11px]">{operatorRating}</span>}
            </div>
          </div>
          {(price || priceSubtext) && (
            <div className="min-w-0 text-left lg:flex-1 lg:text-center">
              {priceSubtext && <p className="text-[11px] font-extrabold uppercase tracking-wide text-red [overflow-wrap:anywhere] sm:text-[12px] xl:text-[10px]">{priceSubtext}</p>}
              {price && <p className="mt-1 text-[24px] font-black leading-none text-primary sm:text-[30px] xl:text-[19px]">{price}</p>}
            </div>
          )}
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 lg:w-[40%] lg:max-w-[510px] xl:w-[41%] xl:gap-1.5">
            <button type="button" onClick={onViewDetail} className="flex min-h-[50px] min-w-0 items-center justify-center gap-2 rounded-xl border-[1.5px] border-primary bg-white px-2 py-3 text-center text-[12px] font-extrabold uppercase text-primary transition-colors hover:bg-primary hover:text-white sm:text-[15px] xl:min-h-[35px] xl:gap-1 xl:rounded-lg xl:px-1 xl:py-1 xl:text-[11px]">
              <LucideIcons.Eye className="h-5 w-5 shrink-0 xl:h-3.5 xl:w-3.5" />
              <span>VIEW DETAIL</span>
            </button>
            <button type="button" onClick={onBook} className="flex min-h-[50px] min-w-0 items-center justify-center gap-2 rounded-xl bg-red px-2 py-3 text-center text-[12px] font-extrabold uppercase text-white transition-colors hover:bg-red/90 sm:text-[15px] xl:min-h-[35px] xl:gap-1 xl:rounded-lg xl:px-1 xl:py-1 xl:text-[11px]">
              <LucideIcons.BookOpen className="h-5 w-5 shrink-0 xl:h-3.5 xl:w-3.5" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{bookLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
