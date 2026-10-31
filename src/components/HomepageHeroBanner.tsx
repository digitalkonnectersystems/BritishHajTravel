"use client";

import { normalizeUkPhoneInput } from "@/lib/ukPhone";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  ChevronRight,
  ArrowRight,
  ImageIcon,
  MoveRight,
} from "lucide-react";
import { submitQuoteEnquiryAction } from "@/actions/enquiryActions";
import SubmissionSuccessModal from "@/components/SubmissionSuccessModal";
import { FORM_SUCCESS_MESSAGE } from "@/lib/formSuccess";
import { resolveVisibleVisaCards, type PublicVisaPage } from "@/lib/publicPageVisibility";

function IndiaFlag() {
  return (
    <svg viewBox="0 0 36 24" className="h-full w-full object-cover">
      <rect width="36" height="8" fill="#FF9933" />
      <rect y="8" width="36" height="8" fill="#FFFFFF" />
      <rect y="16" width="36" height="8" fill="#138808" />
      <circle cx="18" cy="12" r="3" fill="#000080" />
      <circle cx="18" cy="12" r="2.2" fill="#FFFFFF" />
      <circle cx="18" cy="12" r="0.8" fill="#000080" />
      <path d="M18 9v6M15 12h6M16 10l4 4M16 14l4-4" stroke="#000080" strokeWidth="0.4" />
    </svg>
  );
}

function PakistanFlag() {
  return (
    <svg viewBox="0 0 36 24" className="h-full w-full object-cover">
      <rect width="36" height="24" fill="#01411C" />
      <rect width="9" height="24" fill="#FFFFFF" />
      <circle cx="23" cy="12" r="6" fill="#FFFFFF" />
      <circle cx="24.5" cy="10.8" r="5.2" fill="#01411C" />
      <polygon points="25.5,8 26.5,10.5 29,10.5 27,12 27.8,14.5 25.5,13 23.2,14.5 24,12 22,10.5 24.5,10.5" fill="#FFFFFF" />
    </svg>
  );
}

function BritishFlag() {
  return (
    <svg viewBox="0 0 36 24" className="h-full w-full object-cover">
      <rect width="36" height="24" fill="#012169" />
      <path d="M0 0L36 24M36 0L0 24" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M0 0L36 24" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M36 0L0 24" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M18 0v24M0 12h36" stroke="#FFFFFF" strokeWidth="6.5" />
      <path d="M18 0v24M0 12h36" stroke="#C8102E" strokeWidth="4" />
    </svg>
  );
}

function BangladeshFlag() {
  return (
    <svg viewBox="0 0 36 24" className="h-full w-full object-cover">
      <rect width="36" height="24" fill="#006A4E" />
      <circle cx="16" cy="12" r="6.5" fill="#F42A41" />
    </svg>
  );
}

function AfghanFlag() {
  return (
    <svg viewBox="0 0 36 24" className="h-full w-full object-cover">
      <rect width="12" height="24" fill="#000000" />
      <rect x="12" width="12" height="24" fill="#D32011" />
      <rect x="24" width="12" height="24" fill="#007A3D" />
      <circle cx="18" cy="12" r="4.5" fill="none" stroke="#FFFFFF" strokeWidth="0.6" strokeDasharray="1.2 0.8" />
      <path d="M16 14.5h4v-3h-4z M17 11.5h2v-1h-2z M18 8.5v2" stroke="#FFFFFF" strokeWidth="0.6" fill="none" />
      <path d="M15 15c1.5 1 4.5 1 6 0" stroke="#FFFFFF" strokeWidth="0.6" fill="none" />
    </svg>
  );
}

function SaudiFlag() {
  return (
    <svg viewBox="0 0 36 24" className="h-full w-full object-cover">
      <rect width="36" height="24" fill="#006C35" />
      <path d="M9 9.5h18M10 11.5h16M12 7.5h12" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M9 15.5h16M25 15.5l2-1.5M9 14.5v2" stroke="#FFFFFF" strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  );
}

function CountryFlag({ country, flag, flagImage }: { country: string; flag?: string; flagImage?: string }) {
  if (flagImage && flagImage.trim()) {
    return <img src={flagImage} alt={country} className="h-full w-full object-cover" loading="lazy" />;
  }

  const c = country.toLowerCase();
  if (c.includes("india")) return <IndiaFlag />;
  if (c.includes("pakistan")) return <PakistanFlag />;
  if (c.includes("bangladesh")) return <BangladeshFlag />;
  if (c.includes("afghan")) return <AfghanFlag />;
  if (c.includes("british") || c.includes("uk")) return <BritishFlag />;
  if (c.includes("saudi") || c.includes("eta")) return <SaudiFlag />;

  return <span className="text-xl leading-none">{flag || "🌐"}</span>;
}

function KaabaJourneyIllustration({
  journeyTextTop = "YOUR JOURNEY",
  journeyTextBottom = "BEGINS HERE",
  journeyIllustrationUrl,
}: {
  journeyTextTop?: string;
  journeyTextBottom?: string;
  journeyIllustrationUrl?: string;
}) {
  return (
    <div className="flex select-none items-center gap-3">
      {journeyIllustrationUrl ? (
        <img src={journeyIllustrationUrl} alt="Journey" className="h-12 w-24 shrink-0 object-contain" />
      ) : (
        <svg className="h-12 w-14 shrink-0" viewBox="0 0 70 54" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M8 45H62" stroke="#0A1B6F" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M14 42V24L26 16V42" stroke="#0A1B6F" strokeWidth="2" />
          <path d="M44 42V12H58V42" stroke="#0A1B6F" strokeWidth="2" />
          <path d="M47 12V8H55V12" stroke="#0A1B6F" strokeWidth="2" />
          <path d="M21 16V11H30V16" stroke="#D10F1B" strokeWidth="2" />
          <path d="M30 27H40V42H30" stroke="#0A1B6F" strokeWidth="2" />
          <path d="M34 23H36" stroke="#D10F1B" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      )}
      <div className="leading-tight text-primary">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{journeyTextTop}</div>
        <div className="font-serif text-lg">{journeyTextBottom}</div>
      </div>
    </div>
  );
}

function HeroSidePanel({
  theme = "blue",
  eyebrow,
  title,
  highlight,
  description,
  image,
  caption,
  chips,
  buttonLabel,
  buttonLink,
  route,
  className,
}: {
  theme?: "blue" | "red";
  eyebrow: string;
  title: string;
  highlight?: string;
  description: string;
  image?: string;
  caption?: string;
  chips?: string[];
  buttonLabel?: string;
  buttonLink?: string;
  route?: { from: string; to: string };
  className?: string;
}) {
  const isRed = theme === "red";

  return (
    <div
      className={[
        "bht-hero-side-panel relative flex h-full min-h-[300px] sm:min-h-[330px] lg:min-h-[360px] min-w-0 flex-col overflow-hidden px-5 py-6 pb-[44px] text-white sm:px-6 sm:pb-[60px]",
        className,
        isRed
          ? "bg-red"
          : "bg-[#0B1672]",
      ].join(" ")}
    >
      <div className="relative z-10 flex h-full min-w-0 flex-col">
        <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white sm:tracking-[0.3em] 2xl:tracking-[0.42em]">{eyebrow}</div>

        <h3 className="font-serif text-[clamp(1.25rem,2.2vw,2.125rem)] leading-[0.98] lg:whitespace-nowrap 2xl:whitespace-normal">
          {title}
          {highlight ? <span className="block text-red lg:ml-2 lg:inline 2xl:ml-0 2xl:block">{highlight}</span> : null}
        </h3>

        <p className="mt-4 text-[15px] leading-6 text-white/90 lg:whitespace-nowrap lg:text-[12px] lg:leading-5 2xl:whitespace-normal 2xl:text-[15px] 2xl:leading-6">{description}</p>

        {image ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-2">
            <div className="relative h-40 overflow-hidden rounded-xl bg-white/5 sm:h-44 2xl:h-[180px]">
              <img src={image} alt="" className={`h-full w-full object-cover ${image === "/images_BHT/hotels/makkah-clock-tower-low-angle.png" ? "object-top" : ""}`} loading="lazy" />
            </div>
          </div>
        ) : (
          <div className="mt-5 flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 text-center text-sm text-white/45 sm:h-44 2xl:h-[180px]">
            <div>
              <ImageIcon className="mx-auto mb-2 h-8 w-8" />
              <div>{caption || "Add panel image"}</div>
            </div>
          </div>
        )}

        {/* {!route && caption ? <p className="mt-4 text-center text-sm leading-6 text-white/45">{caption}</p> : null} */}

        {route ? (
          <div className="mt-auto pt-7">
            <div className="mb-6 flex items-center justify-between font-serif text-[clamp(1.75rem,3vw,2.375rem)] tracking-tight text-white">
              <span>{route.from}</span>
              <span className="mx-3 flex-1 border-t border-dashed border-white/40" />
              <span>{route.to}</span>
            </div>
            {buttonLink && buttonLabel ? (
              <Link
                href={buttonLink}
                className="inline-flex min-h-[58px] w-full items-center justify-center rounded-full bg-white px-6 text-center text-[15px] font-extrabold uppercase tracking-[0.12em] text-red transition hover:translate-y-[-1px] hover:shadow-lg"
              >
                {buttonLabel} <MoveRight className="ml-2 h-5 w-5" />
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            {chips && chips.length > 0 ? (
              <div className="mt-auto flex flex-wrap gap-2 pt-7 sm:gap-3">
                {chips.map((chip) => (
                  <span key={chip} className="inline-flex items-center rounded-full border border-white/55 px-3 py-1.5 text-xs font-semibold text-white/95 sm:px-4 sm:py-2 sm:text-sm">
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}

            {buttonLink && buttonLabel ? (
              <Link
                href={buttonLink}
                className="mt-5 inline-flex min-h-[58px] w-full items-center justify-center rounded-full bg-white px-6 text-center text-[15px] font-extrabold uppercase tracking-[0.12em] text-primary transition hover:translate-y-[-1px] hover:shadow-lg"
              >
                {buttonLabel} <MoveRight className="ml-2 h-5 w-5" />
              </Link>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default function HomepageHeroBanner({ data, pageData, backgroundImage, publishedVisaCards = [], publishedSitePaths = [] }: { data: any; pageData?: any; backgroundImage?: string; publishedVisaCards?: PublicVisaPage[]; publishedSitePaths?: string[] }) {
  const heroData = {
    heroEyebrow: data?.heroEyebrow || "",
    title: pageData?.bannerTitle || data?.title || "",
    description: pageData?.bannerDescription || data?.description || "",
    primaryBtnLabel: data?.primaryBtnLabel || "",
    primaryBtnLink: data?.primaryBtnLink || "",
    secondaryBtnLabel: data?.secondaryBtnLabel || "",
    secondaryBtnLink: data?.secondaryBtnLink || "",
    bgImage: String(backgroundImage || pageData?.bannerBgImage || data?.bannerBgImage || data?.bgImage || "").split(String.fromCharCode(92)).join("/"),
    position: "left center",
    size: pageData?.bannerSize || data?.bannerSize || "cover",
    visaTitle: data?.visaTitle || "",
    visaSubtitle: data?.visaSubtitle || "",
    visaDocumentsLabel: data?.visaDocumentsLabel || "",
    visaDocumentsLink: data?.visaDocumentsLink || "",
    visaCards: Array.isArray(data?.visaCards) ? data.visaCards : [],
    journeyTextTop: data?.journeyTextTop || "",
    journeyTextBottom: data?.journeyTextBottom || "",
    journeyIllustrationUrl: data?.journeyIllustrationUrl || "",
    hotelEyebrow: data?.hotelEyebrow || "",
    hotelTitle: data?.hotelTitle || "",
    hotelHighlight: data?.hotelHighlight || "",
    hotelDescription: data?.hotelDescription || "",
    hotelImage: data?.hotelImage || "",
    hotelVisible: data?.hotelVisible !== false && Boolean(data?.hotelTitle || data?.hotelDescription || data?.hotelImage),
    hotelCaption: data?.hotelCaption || "",
    hotelTags:
      Array.isArray(data?.hotelTags) ? data.hotelTags.filter((tag: unknown): tag is string => typeof tag === "string" && tag.trim().length > 0) : [],
    hotelButtonLabel: data?.hotelButtonLabel || "",
    hotelButtonLink: data?.hotelButtonLink || "",
    flightsEyebrow: data?.flightsEyebrow || "",
    flightsTitle: data?.flightsTitle || "",
    flightsDescription: data?.flightsDescription || "",
    flightsImage: data?.flightsImage || "",
    flightsVisible: data?.flightsVisible !== false && Boolean(data?.flightsTitle || data?.flightsDescription || data?.flightsImage),
    flightsCaption: data?.flightsCaption || "",
    flightsRouteFrom: data?.flightsRouteFrom || "",
    flightsRouteTo: data?.flightsRouteTo || "",
    flightsButtonLabel: data?.flightsButtonLabel || "",
    flightsButtonLink: data?.flightsButtonLink || "",
    quoteTitle: data?.quoteTitle || "",
  };

  const visibleVisaCards = resolveVisibleVisaCards<any>(heroData.visaCards, publishedVisaCards, publishedSitePaths);
  const visaDocumentsVisible = publishedSitePaths.includes(heroData.visaDocumentsLink);

  const [quoteForm, setQuoteForm] = useState({
    fullName: "",
    phone: "+44",
    email: "",
    packageType: "Select Package",
    adults: 1,
  });
  const [quoteStatus, setQuoteStatus] = useState<string | null>(null);
  const [quoteErrors, setQuoteErrors] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalRef, setModalRef] = useState("");
  const sidePanelCount = Number(heroData.hotelVisible) + Number(heroData.flightsVisible);
  const heroGridItemClass = sidePanelCount === 0
    ? "sm:col-span-1 2xl:order-2 2xl:col-span-1"
    : "sm:col-span-2 2xl:order-2 2xl:col-span-1";

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!quoteForm.fullName.trim()) newErrors.fullName = "Please fill out this field.";
    if (!quoteForm.phone.trim()) newErrors.phone = "Please fill out this field.";

    if (!quoteForm.email.trim()) {
      newErrors.email = "Please fill out this field.";
    } else if (!/\S+@\S+\.\S+/.test(quoteForm.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setQuoteErrors(newErrors);
      return;
    }

    setQuoteErrors({});
    setQuoteStatus("Submitting...");

    try {
      const res = await submitQuoteEnquiryAction({
        fullName: quoteForm.fullName,
        phone: quoteForm.phone,
        email: quoteForm.email,
        packageType: quoteForm.packageType,
        numberOfPilgrims: quoteForm.adults,
      });

      if (res.success) {
        const msg = `${FORM_SUCCESS_MESSAGE}${res.emailWarning ? ` ${res.emailWarning}` : ""}`;
        setModalMsg(msg);
        if (res.enquiryNumber) setModalRef(res.enquiryNumber);
        setModalOpen(true);
        setQuoteStatus(null);
        setQuoteForm({
          fullName: "",
          phone: "+44",
          email: "",
          packageType: "Select Package",
          adults: 1,
        });
      } else {
        setQuoteStatus(res.error || "Submission failed.");
      }
    } catch {
      setQuoteStatus("Failed to submit request.");
    }
  };

  return (
    <>
      <section className="">
        <div className="mx-auto w-full px-0">
          <div className="overflow-hidden bg-white shadow-[0_20px_65px_rgba(2,12,27,0.15)]">
            <div className={sidePanelCount === 2
              ? "grid grid-cols-1 min-[1025px]:grid-cols-2 2xl:grid-cols-[minmax(0,1.08fr)_minmax(0,3.35fr)_minmax(0,1fr)]"
              : sidePanelCount === 1
                ? "grid grid-cols-1 min-[1025px]:grid-cols-2 2xl:grid-cols-[minmax(0,3.35fr)_minmax(0,1fr)]"
                : "grid grid-cols-1"
            }>
              {heroData.hotelVisible ? (
                <HeroSidePanel
                  theme="blue"
                  eyebrow={heroData.hotelEyebrow}
                  title={heroData.hotelTitle}
                  highlight={heroData.hotelHighlight}
                  description={heroData.hotelDescription}
                  image={heroData.hotelImage}
                  caption={heroData.hotelCaption}
                  chips={heroData.hotelTags}
                  buttonLabel={heroData.hotelButtonLabel}
                  buttonLink={heroData.hotelButtonLink}
                  className="order-2 sm:order-2 2xl:order-1"
                />
              ) : null}

              <div className={`relative order-1 min-w-0 overflow-hidden bg-[linear-gradient(90deg,#1A1B6C_0%,#2B256E_55%,#2D225F_100%)] text-white ${heroGridItemClass}`}>
                {heroData.bgImage ? (
                  <>
                    <Image
                      src={heroData.bgImage}
                      alt=""
                      fill
                      priority
                      sizes="(max-width: 1535px) 100vw, 63vw"
                      className="object-cover"
                      style={{ objectPosition: heroData.position, objectFit: (heroData.size as any) || "cover" }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(174,205,255,1)_0%,rgba(243,243,243,0.1)_58%,rgba(131,161,227,0.65)_100%)]" />
                  </>
                ) : null}

                <div className="relative z-10 grid h-full grid-cols-1 items-center gap-8 px-5 py-8 sm:px-8 md:px-10 min-[1025px]:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-8 lg:px-8 2xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)] 2xl:gap-10 2xl:px-10 2xl:py-12">
                  <div className="flex min-w-0 flex-col justify-center">
                    <div className="hero">
                      {heroData.heroEyebrow ? <div className="mb-5 text-[13px] font-extrabold uppercase tracking-[0.18em] text-ink">{heroData.heroEyebrow}</div> : null}
                      {heroData.title ? <h1 className="font-serif text-[clamp(1.25rem,2.2vw,2.125rem)] leading-[0.98]" dangerouslySetInnerHTML={{ __html: heroData.title }} /> : null}
                      {heroData.description ? <p className="mt-5 max-w-[36rem] text-[16px] leading-7 text-[#294970] sm:mt-6 lg:text-[17px] lg:leading-8">{heroData.description}</p> : null}

                      {heroData.primaryBtnLink && heroData.primaryBtnLabel || heroData.secondaryBtnLink && heroData.secondaryBtnLabel ? (
                        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
                          {heroData.primaryBtnLink && heroData.primaryBtnLabel ? (
                            <Link
                              href={heroData.primaryBtnLink}
                              className="inline-flex min-h-[56px]  max-w-full items-center justify-center rounded-full bg-red px-6 text-center md:text-[15px] text-[14px] font-extrabold uppercase tracking-[0.1em] text-white transition hover:translate-y-[-1px] hover:bg-red/90 hover:shadow-lg sm:px-7"
                            >
                              {heroData.primaryBtnLabel}
                            </Link>
                          ) : null}
                          {heroData.secondaryBtnLink && heroData.secondaryBtnLabel ? (
                            <Link
                              href={heroData.secondaryBtnLink}
                              className="inline-flex min-h-[56px] max-w-full items-center justify-center rounded-full bg-white px-6 text-center md:text-[15px] text-[14px] font-extrabold uppercase tracking-[0.1em] text-primary transition hover:translate-y-[-1px] hover:bg-slate-100 hover:shadow-lg sm:px-7"
                            >
                              {heroData.secondaryBtnLabel}
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mx-auto w-full max-w-[400px] min-w-0 rounded-2xl bg-[#0B1672] p-5 shadow-[0_22px_40px_rgba(2,12,27,0.25)] sm:rounded-[28px] sm:p-6 md:p-7 2xl:max-w-[440px]">
                    <h2 className="mb-6 text-center font-serif text-[26px] leading-none text-white md:text-[30px]">{heroData.quoteTitle}</h2>
                    {quoteStatus ? <p className="mb-4 text-center text-sm font-semibold text-ink">{quoteStatus}</p> : null}

                    <form noValidate className="flex h-full flex-col gap-5" onSubmit={handleQuoteSubmit}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="quote-fullName" className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white">
                            Your Name
                          </label>
                          <input
                            id="quote-fullName"
                            type="text"
                            placeholder="Full Name"
                            value={quoteForm.fullName}
                            onChange={(e) => {
                              setQuoteForm({ ...quoteForm, fullName: e.target.value });
                              if (quoteErrors.fullName) setQuoteErrors((prev) => ({ ...prev, fullName: "" }));
                            }}
                            className={`h-14 w-full rounded-none border bg-white px-4 text-[15px] text-slate-900 outline-none transition ${quoteErrors.fullName ? "border-red-600 ring-1 ring-red-600" : "border-slate-200 focus:border-red"
                              }`}
                          />
                          {quoteErrors.fullName ? <span className="mt-1 block text-xs font-semibold text-red-200">{quoteErrors.fullName}</span> : null}
                        </div>

                        <div>
                          <label htmlFor="quote-phone" className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white">
                            Phone Number
                          </label>
                          <input
                            id="quote-phone"
                            type="tel"
                            placeholder="+44"
                            inputMode="numeric"
                            maxLength={13}
                            value={quoteForm.phone}
                            onChange={(e) => {
                              const value = normalizeUkPhoneInput(e.target.value);
                              setQuoteForm({ ...quoteForm, phone: value });
                              if (quoteErrors.phone) setQuoteErrors((prev) => ({ ...prev, phone: "" }));
                            }}
                            className={`h-14 w-full rounded-none border bg-white px-4 text-[15px] text-slate-900 outline-none transition ${quoteErrors.phone ? "border-red-600 ring-1 ring-red-600" : "border-slate-200 focus:border-red"
                              }`}
                          />
                          {quoteErrors.phone ? <span className="mt-1 block text-xs font-semibold text-red-200">{quoteErrors.phone}</span> : null}
                        </div>

                        <div>
                          <label htmlFor="quote-email" className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white">
                            Email Address
                          </label>
                          <input
                            id="quote-email"
                            type="email"
                            placeholder="your@email.com"
                            value={quoteForm.email}
                            onChange={(e) => {
                              setQuoteForm({ ...quoteForm, email: e.target.value });
                              if (quoteErrors.email) setQuoteErrors((prev) => ({ ...prev, email: "" }));
                            }}
                            className={`h-14 w-full rounded-none border bg-white px-4 text-[15px] text-slate-900 outline-none transition ${quoteErrors.email ? "border-red-600 ring-1 ring-red-600" : "border-slate-200 focus:border-red"
                              }`}
                          />
                          {quoteErrors.email ? <span className="mt-1 block text-xs font-semibold text-red-200">{quoteErrors.email}</span> : null}
                        </div>

                        <div>
                          <label htmlFor="quote-package" className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white">
                            Select Your Package
                          </label>
                          <select
                            id="quote-package"
                            value={quoteForm.packageType}
                            onChange={(e) => setQuoteForm({ ...quoteForm, packageType: e.target.value })}
                            className="h-14 w-full cursor-pointer appearance-none rounded-none border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition focus:border-red"
                          >
                            <option>Select Package</option>
                            <option>Umrah Package</option>
                            <option>Hajj Package</option>
                            <option>Flight Only</option>
                            <option>Saudi Visa</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="quote-pilgrims" className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-white">
                          Number of Pilgrims
                        </label>
                        <input
                          id="quote-pilgrims"
                          type="number"
                          min="1"
                          value={quoteForm.adults}
                          onChange={(e) => setQuoteForm({ ...quoteForm, adults: parseInt(e.target.value, 10) || 1 })}
                          className="h-14 w-full rounded-none border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition focus:border-red"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="inline-flex min-h-[60px] w-full items-center justify-center bg-red px-6 text-center text-[16px] font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-red/90"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {heroData.flightsVisible ? (
                <HeroSidePanel
                  theme="red"
                  eyebrow={heroData.flightsEyebrow}
                  title={heroData.flightsTitle}
                  description={heroData.flightsDescription}
                  image={heroData.flightsImage}
                  caption={heroData.flightsCaption}
                  buttonLabel={heroData.flightsButtonLabel}
                  buttonLink={heroData.flightsButtonLink}
                  route={heroData.flightsRouteFrom && heroData.flightsRouteTo
                    ? { from: heroData.flightsRouteFrom, to: heroData.flightsRouteTo }
                    : undefined}
                  className="order-3 sm:order-3 2xl:order-3"
                />
              ) : null}
            </div>
          </div>
        </div>

        {visibleVisaCards.length > 0 ? <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="relative z-20 -mt-2 overflow-hidden rounded-3xl border border-slate-100/90 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)] sm:-mt-4 sm:p-6 md:-mt-6 md:rounded-[30px] md:p-7 lg:-mt-8">
            <div className="mb-6 flex flex-col items-center justify-between gap-4 md:mb-7 md:flex-row">
              <div className="hidden w-1/4 items-center justify-start lg:flex">
                <KaabaJourneyIllustration
                  journeyTextTop={heroData.journeyTextTop}
                  journeyTextBottom={heroData.journeyTextBottom}
                  journeyIllustrationUrl={heroData.journeyIllustrationUrl}
                />
              </div>

              <div className="flex flex-col items-center text-center lg:w-2/4">
                <div className="flex items-center gap-2.5">
                  <h2 className="m-0 font-serif text-2xl font-normal tracking-tight text-primary sm:text-3xl md:text-[34px]">
                    {heroData.visaTitle}
                  </h2>
                </div>
                <p className="mb-0 mt-1 text-xs font-medium text-slate-500 sm:text-sm">{heroData.visaSubtitle}</p>
              </div>

              <div className="flex items-center justify-center lg:w-1/4 lg:justify-end">
                {visaDocumentsVisible ? <Link
                  href={heroData.visaDocumentsLink}
                  className="inline-flex whitespace-nowrap rounded-full border border-slate-200/60 bg-[#F1F5F9] px-4 py-2 text-xs font-semibold text-primary shadow-sm transition-all hover:bg-[#E2E8F0] md:text-sm"
                >
                  <FileText className="mr-2 h-4 w-4 text-primary" />
                  <span>{heroData.visaDocumentsLabel}</span>
                  <ChevronRight className="ml-2 h-3.5 w-3.5 text-primary" />
                </Link> : null}
              </div>
            </div>

            <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-[1140px]:flex-wrap min-[1140px]:justify-center min-[1140px]:overflow-visible min-[1140px]:pb-0 xl:flex-wrap xl:justify-center lg:gap-3">
              {visibleVisaCards.map(({ card: visa, href: cardHref }, index: number) => {
                return (
                  <Link
                    key={`${visa.slug || visa.country}-${index}`}
                    href={cardHref}
                    className="group flex min-w-[170px] flex-1 snap-start flex-col justify-between rounded-2xl border border-slate-100/90 bg-white p-3 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] sm:min-w-[185px] min-[1140px]:min-w-0 min-[1140px]:basis-[calc((100%_-_4.5rem)/7)] min-[1140px]:flex-none xl:min-w-0 xl:p-3.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-slate-200/80 bg-slate-50 shadow-xs">
                        <CountryFlag country={visa.country} flag={visa.flag} flagImage={visa.flagImage || visa.flagSvg} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary">
                          {visa.country}
                        </div>
                        <div className="mt-0.5 min-h-[14px] truncate text-[11px] font-medium leading-tight text-slate-400">
                          {visa.passportLabel || "\u00A0"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <span className="flex-1 rounded-full bg-red px-2 py-1.5 text-center text-xs font-extrabold tracking-tight text-white shadow-xs transition-colors group-hover:bg-red-700 sm:text-sm">
                        {visa.price}
                      </span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EDF2F7] text-primary transition-all group-hover:bg-red-700 group-hover:text-white">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div> : null}
      </section>

      <SubmissionSuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
        referenceNumber={modalRef}
      />
    </>
  );
}
