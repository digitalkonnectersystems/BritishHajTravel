"use client";
import { useCurrency } from "@/components/CurrencyProvider";

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

/** Hajj package card with a subtle Hajj-specific treatment alongside Umrah cards. */
export default function HajjLandscapeCard({
  heroImage,
  packageTitle,
  badgeTag,
  duration,
  priceSubtext,
  price,
  bookLabel,
  onViewDetail,
  onBook,
}: HajjLandscapeCardProps) {
  const currency = useCurrency();
  const displayPrice = price && /^(?:CAD|GBP|USD|EUR|SAR|PKR|£|\$|€)\s*/i.test(price) ? `${currency.symbol} ${price.replace(/^(?:CAD|GBP|USD|EUR|SAR|PKR|£|\$|€)\s*/i, "")}` : price && /^\d[\d,.]*$/.test(price) ? `${currency.symbol} ${price}` : price;
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#d1d1d1] border-t-4 border-t-red bg-white transition-transform duration-300 hover:-translate-y-0.5">
      <div className="relative h-48 shrink-0 overflow-hidden bg-[#071a45]">
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
        <span className="absolute left-4 top-4 inline-flex max-w-[calc(100%-2rem)] truncate rounded-md bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
          {badgeTag || "HAJJ 2027"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 w-fit rounded-full border border-[#e1e7f0] bg-[#f3f6fc] px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-gray-500">
          {duration || "HAJJ 2027"}
        </div>
        <h3 title={packageTitle} className="mb-2 line-clamp-2 font-serif text-2xl leading-[28px] text-primary">
          {packageTitle}
        </h3>
        <div className="mt-auto -mx-4 -mb-4 border-t border-[#e5ebf4] bg-[#f6f8fc] p-4">
          <span className="text-xs font-medium text-ink-soft">
            {priceSubtext || "Starting From"}
          </span>
          <p className="mb-5 text-xl font-black text-red" title={displayPrice || "Price on request"}>
            {displayPrice || "Price on request"}
            {price && <span className="ml-1 text-sm font-medium text-ink-soft">/ Person</span>}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onViewDetail}
              className="block flex-1 rounded-md border-2 border-primary py-3 text-center text-xs font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              View Detail
            </button>
            <button
              type="button"
              onClick={onBook}
              title={bookLabel}
              className="block flex-1 cursor-pointer rounded-md border-2 border-transparent bg-red py-3 text-center text-xs font-black uppercase tracking-widest text-white transition-colors hover:border-red hover:bg-white hover:text-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
            >
              {bookLabel}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
