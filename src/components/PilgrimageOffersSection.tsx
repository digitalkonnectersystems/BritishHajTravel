"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Gem, HandHeart, MoonStar, PlaneTakeoff } from "lucide-react";
import offerCollage from "@/assets/what-we-offer-collage.webp";

/** A reusable, CMS-editable layout. It is rendered only when added to a page. */
export type PilgrimageOffersData = {
  eyebrow?: string;
  title?: string;
  leftTitle?: string;
  offerImage?: string;
  offerImageAlt?: string;
  leftParagraph1?: string;
  leftParagraph2?: string;
  features?: string[];
  rightTitle?: string;
  rightParagraph1?: string;
  rightParagraph2?: string;
  makkahTitle?: string;
  makkahDescription?: string;
  makkahAction?: string;
  makkahUrl?: string;
  madinahTitle?: string;
  madinahDescription?: string;
  madinahAction?: string;
  madinahUrl?: string;
  insuranceTitle?: string;
  insuranceDescription?: string;
  insuranceAction?: string;
  insuranceUrl?: string;
  hajjTitle?: string;
  hajjDescription?: string;
  hajjUrl?: string;
};

export const PILGRIMAGE_OFFERS_DEFAULTS: Required<PilgrimageOffersData> = {
  eyebrow: "OUR SERVICES",
  title: "Hajj & Umrah Travel Services",
  leftTitle: "WHAT WE OFFER",
  offerImage: "",
  offerImageAlt: "Kaaba in Makkah, the Prophet's Mosque in Madinah and an aircraft",
  leftParagraph1:
    "British Haj Travels offers first-rate services to the pilgrims in the UK who are looking to perform Umrah or Haj in Saudi Arabia. The leading travel agency has devised various (5 star & cheap) Hajj & Umrah packages.",
  leftParagraph2:
    "The good thing about these packages is that British Hajj has conceived them by keeping the needs and budget of pilgrims in mind. So its clients can select one which suits them best.",
  features: ["5-Star Packages", "Budget Friendly", "ATOL Protected", "Expert Guidance"],
  rightTitle: "5 STAR & AFFORDABLE PACKAGES",
  rightParagraph1:
    "British Haj Travel Limited provides premium, fully compliant Hajj and Umrah services for pilgrims across the United Kingdom who wish to perform their sacred journey in Saudi Arabia. As a trusted and leading UK-based travel agency, we offer a carefully structured range of 5-star Hajj packages, affordable Hajj packages, luxury Umrah packages, and budget-friendly Umrah deals designed to suit every traveller’s needs.",
  rightParagraph2:
    "Book with confidence and experience a smooth, spiritually fulfilling pilgrimage with expert support at every step.",
  makkahTitle: "Live Makkah",
  makkahDescription: "Watch Live Makkah Stream",
  makkahAction: "Live View",
  makkahUrl: "",
  madinahTitle: "Live Madinah",
  madinahDescription: "Watch Live Madinah Stream",
  madinahAction: "Live View",
  madinahUrl: "",
  insuranceTitle: "Travel Insurance",
  insuranceDescription: "Promoting a safer Hajj",
  insuranceAction: "More Details",
  insuranceUrl: "",
  hajjTitle: "Hajj Packages 2027",
  hajjDescription: "View 5 Star Cheap Packages",
  hajjUrl: "",
};

/** Only allow internal slugs, HTTPS links and safe same-page anchors. */
function getLink(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const target = url.trim();
  if (/^\/(?!\/)/.test(target) || /^https:\/\/[^\s]+$/i.test(target) || /^#[a-zA-Z0-9_-]+$/.test(target)) {
    return target;
  }
  // Editors can paste a bare page slug; make it an internal path.
  if (/^[a-zA-Z0-9][a-zA-Z0-9\/_-]*$/.test(target)) return `/${target}`;
  return null;
}

function MakkahIcon() {
  return (
    <svg viewBox="0 0 42 42" fill="none" aria-hidden="true" className="h-[35px] w-[35px]">
      <path d="M5 13 21 8l16 5v19L21 37 5 32V13Z" fill="white" />
      <path d="m5 13 16 5 16-5M21 18v19" stroke="#18245b" strokeWidth="2" />
      <path d="m8 20 13 4 13-4" stroke="#18245b" strokeWidth="2.3" />
      <path d="m8 22 13 4 13-4" stroke="#18245b" strokeWidth="1" />
    </svg>
  );
}

function MadinahIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="white" aria-hidden="true" className="h-[36px] w-[36px]">
      <path d="M6 19h5v21H6zM7 17l2-8 2 8zM7.3 6.5a1.8 1.8 0 1 0 3.6 0 1.8 1.8 0 0 0-3.6 0" />
      <path d="M15 23h24v17H15zM17 22c0-5 5-7 10-13 5 6 10 8 10 13Z" />
      <path d="M25 40V30a4 4 0 0 1 8 0v10" fill="#21bb82" />
      <path d="M17 27h4v5h-4zM35 27h3v5h-3z" fill="#21bb82" />
    </svg>
  );
}

function SmallLinkCard({
  title, description, action, url, variant,
}: {
  title: string;
  description: string;
  action: string;
  url: string;
  variant: "makkah" | "madinah" | "insurance";
}) {
  const href = getLink(url);
  const icon = variant === "makkah" ? <MakkahIcon /> : variant === "madinah" ? <MadinahIcon /> : <HandHeart size={33} strokeWidth={2.8} />;
  const content = (
    <>
      <span className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[12px] text-white shadow-[0_9px_20px_rgba(7,15,45,.20)] sm:h-[60px] sm:w-[60px] ${variant === "makkah" ? "bg-gradient-to-br from-[#0b103c] to-[#253c83]" : variant === "madinah" ? "bg-gradient-to-br from-[#138f86] to-[#33e478]" : "bg-gradient-to-br from-[#cf000e] to-[#ff1419]"}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-extrabold leading-tight text-[#07113e]">{title}</span>
        <span className="mt-2.5 block text-[13px] leading-[1.4] text-[#815864]">{description}</span>
        <span className="mt-2 block text-[13px] font-bold leading-tight text-[#ce0012]">
          {action} <ArrowRight className="inline-block h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
        </span>
      </span>
      <span className="ml-auto flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full bg-[#ece1e8] text-[#081346] transition-colors duration-200 group-hover:bg-[#e8cbd4]">
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </span>
    </>
  );
  const classes = "group flex w-full min-w-0 items-center gap-3 sm:gap-[15px] rounded-[13px] border border-[#dfd1d8] border-l-[4px] border-l-[#ba0015] bg-[#f7ecf0]/70 px-3 sm:px-5 py-[22px] text-left no-underline transition-all duration-200 hover:bg-[#fff5f7] hover:shadow-[0_7px_24px_rgba(40,10,40,.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ba0015]";
  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes} title="Add a destination URL in the page editor to enable this link">
      {content}
    </div>
  );
}

export default function PilgrimageOffersSection({ data = {} }: { data?: PilgrimageOffersData }) {
  const d = { ...PILGRIMAGE_OFFERS_DEFAULTS, ...data };
  const features = Array.isArray(data.features) ? data.features : PILGRIMAGE_OFFERS_DEFAULTS.features;
  const hajjHref = getLink(d.hajjUrl);
  const hajjContent = (
    <>
      <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white">
        <PlaneTakeoff className="h-7 w-7" strokeWidth={2.3} aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-extrabold leading-tight text-white">{d.hajjTitle}</span>
        <span className="mt-0.5 block text-[11px] leading-tight text-white/95">{d.hajjDescription}</span>
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-white/30">
        <ArrowRight className="h-[19px] w-[19px]" aria-hidden="true" />
      </span>
    </>
  );
  const hajjClass = "group mt-6 flex min-h-[80px] w-full items-center gap-3 rounded-full bg-gradient-to-r from-[#1d0637] via-[#65001f] to-[#b8000f] px-5 py-3 text-left text-white no-underline shadow-[0_13px_23px_rgba(167,0,18,.21)] transition-all duration-200 hover:shadow-[0_16px_28px_rgba(167,0,18,.30)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600";

  return (
    <section className="w-full bg-white px-4 py-12 md:py-16" aria-label={d.title || "Hajj and Umrah services"}>
      <div className="mx-auto w-full max-w-[1080px]">
        {(d.eyebrow || d.title) && (
          <div className="mb-9 flex flex-col items-center text-center md:mb-11">
            {d.eyebrow && <span className="eyebrow mb-3 font-sans text-[#bd0010]">{d.eyebrow}</span>}
            {d.title && (
              <h2 className="!flex !justify-center !text-center font-serif text-primary text-[clamp(1.5rem,2.2vw,2.25rem)] leading-[0.98]">
                {d.title}
              </h2>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 items-stretch gap-7 lg:grid-cols-2 lg:gap-[60px]">
          <article className="flex min-w-0 flex-col overflow-hidden rounded-[15px] border-2 border-[#d9cfd5] bg-[#fff5f6] shadow-[0_5px_24px_rgba(21,10,38,.06)]">
            <div className="flex items-center gap-2.5 px-6 pt-6 pb-3">
              <MoonStar aria-hidden="true" className="h-[25px] w-[25px] shrink-0 text-[#bf0014]" fill="currentColor" strokeWidth={1.6} />
              <h3 className="m-0 text-[clamp(1rem,1.7vw,1.4rem)] !font-sans !font-extrabold leading-tight tracking-[.01em] text-[#07113e]">{d.leftTitle}</h3>
            </div>
            <div className="relative aspect-[505/221] w-full overflow-hidden bg-[#eee3e5]">
              {d.offerImage ? (
                // The editor accepts locally uploaded CMS media as well as remote image URLs.
                // eslint-disable-next-line @next/next/no-img-element
                <img className="h-full w-full object-cover" src={d.offerImage} alt={d.offerImageAlt} loading="lazy" />
              ) : (
                <Image src={offerCollage} alt={d.offerImageAlt} fill sizes="(min-width: 1024px) 510px, 100vw" className="object-cover" />
              )}
            </div>
            <div className="flex flex-1 flex-col px-5 pb-8 pt-6 sm:px-6">
              <div className="space-y-4 text-[14px] leading-[1.72] text-[#6b4751]">
                {d.leftParagraph1 && <p className="m-0 !text-[14px]">{d.leftParagraph1}</p>}
                {d.leftParagraph2 && <p className="m-0 !text-[14px]">{d.leftParagraph2}</p>}
              </div>
              {features.some((item) => item?.trim()) && (
                <div className="mt-5 grid grid-cols-1 gap-x-3 gap-y-6 rounded-[11px] border border-[#decdd5] bg-[#f8e9ed] px-4 py-5 sm:grid-cols-2 sm:px-5">
                  {features.filter((item) => typeof item === "string" && item.trim()).map((item, index) => (
                    <span key={`${index}-${item}`} className="flex items-center gap-2 text-[12px] font-bold leading-tight text-[#0a1242]">
                      <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#cb000f] text-white"><Check className="h-[11px] w-[11px]" strokeWidth={3} /></span>
                      {item}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-auto">
                {hajjHref ? <Link href={hajjHref} className={hajjClass}>{hajjContent}</Link> : <div className={hajjClass} title="Add a destination URL in the page editor to enable this link">{hajjContent}</div>}
              </div>
            </div>
          </article>

          <article className="flex min-w-0 flex-col rounded-[15px] border-2 border-[#d9cfd5] bg-[#fff7f8] px-5 pb-6 pt-6 shadow-[0_5px_24px_rgba(21,10,38,.06)] sm:px-6">
            <div className="flex items-center gap-3">
              <Gem className="h-[26px] w-[26px] shrink-0 text-[#c00015]" aria-hidden="true" strokeWidth={2.5} />
              <h3 className="m-0 text-[clamp(1rem,1.6vw,1.32rem)] !font-sans !font-extrabold leading-tight tracking-[.008em] text-[#07113e]">{d.rightTitle}</h3>
            </div>
            <div className="my-[17px] h-[2px] w-full bg-gradient-to-r from-[#c50013] via-[#e4a1ac] to-[#e9c9d0]" />
            <div className="border-l-[3px] border-l-[#efacba] pl-3.5 text-[14px] leading-[1.72] text-[#6b4751]">
              {d.rightParagraph1 && <p className="m-0 !text-[14px] text-justify">{d.rightParagraph1}</p>}
              {d.rightParagraph2 && <p className="mt-1 mb-0 !text-[14px] text-justify">{d.rightParagraph2}</p>}
            </div>
            <div className="mt-6 flex flex-1 flex-col justify-end gap-[14px]">
              <SmallLinkCard variant="makkah" title={d.makkahTitle} description={d.makkahDescription} action={d.makkahAction} url={d.makkahUrl} />
              <SmallLinkCard variant="madinah" title={d.madinahTitle} description={d.madinahDescription} action={d.madinahAction} url={d.madinahUrl} />
              <SmallLinkCard variant="insurance" title={d.insuranceTitle} description={d.insuranceDescription} action={d.insuranceAction} url={d.insuranceUrl} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
