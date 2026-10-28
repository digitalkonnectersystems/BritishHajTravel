"use client";

import { ArrowUpRight, CalendarDays, Eye, Landmark, Plane } from "lucide-react";

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

/** Compact Hajj card with a distinct editorial layout and existing parent API. */
export default function HajjLandscapeCard({
  heroImage,
  packageTitle,
  badgeTag,
  duration,
  flightRoute,
  packageCode,
  priceSubtext,
  price,
  bookLabel,
  onViewDetail,
  onBook,
}: HajjLandscapeCardProps) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[18px] border border-[#dbe3ef] border-t-[3px] border-t-red bg-white shadow-[0_6px_22px_rgba(7,26,69,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(7,26,69,0.14)]">
      <div className="relative h-[158px] shrink-0 overflow-hidden bg-[#071a45]">
        {heroImage ? (
          <img
            src={heroImage}
            alt={packageTitle}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#071a45] via-[#133877] to-[#27599a]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071a45]/85 via-transparent to-black/30" />
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
          <span className="inline-flex min-w-0 max-w-[65%] items-center gap-1.5 rounded-md border border-white/30 bg-[#071a45]/90 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
            <Landmark className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="truncate" title={badgeTag || "Hajj 2027"}>{badgeTag || "Hajj 2027"}</span>
          </span>
          {duration && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white px-2 py-1.5 text-[10px] font-extrabold text-primary shadow-sm">
              <CalendarDays className="h-3 w-3 text-red" />
              {duration}
            </span>
          )}
        </div>
        {flightRoute && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
            <Plane className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="truncate" title={flightRoute}>{flightRoute}</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-3.5 pt-3 sm:px-4">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <h3 title={packageTitle} className="line-clamp-2 min-w-0 flex-1 text-[19px] font-extrabold !leading-[25px] tracking-tight text-primary [overflow-wrap:anywhere]">
            {packageTitle}
          </h3>
          <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eff3fa] text-red" aria-hidden="true">
            <Landmark className="h-4 w-4" />
          </span>
        </div>
        <div className="mb-3 mt-1 min-h-[20px]">
          {packageCode ? (
            <span title={packageCode} className="inline-block max-w-full truncate rounded border border-[#e3e9f2] bg-[#f5f7fb] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
              Package {packageCode}
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Hajj travel package</span>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-[#e5ebf4] bg-[#f6f8fc] px-3.5 pb-3 pt-2.5 sm:px-4">
        <div className="mb-2.5 flex min-w-0 items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold text-slate-500" title={priceSubtext || "Starting From"}>
              {priceSubtext || "Starting From"}
            </p>
            <p className="truncate text-[22px] font-black leading-7 tracking-tight text-primary" title={price || "Price on request"}>
              {price || "Price on request"}
            </p>
          </div>
          {price && <span className="shrink-0 pb-1 text-[10px] font-semibold text-slate-600">per person</span>}
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-2">
          <button type="button" onClick={onViewDetail} className="inline-flex min-h-[38px] min-w-0 items-center justify-center gap-1 rounded-md border border-primary bg-white px-1.5 py-2 text-[11px] font-extrabold text-primary transition-colors hover:bg-[#eaf0fa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            <Eye className="h-3.5 w-3.5 shrink-0" />
            <span>View Details</span>
          </button>
          <button type="button" onClick={onBook} title={bookLabel} className="inline-flex min-h-[38px] min-w-0 items-center justify-center gap-1 rounded-md bg-red px-1.5 py-2 text-center text-[11px] font-extrabold text-white transition-colors hover:bg-red/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red">
            <span className="line-clamp-2 min-w-0 [overflow-wrap:anywhere]">{bookLabel}</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </article>
  );
}
