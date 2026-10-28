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

const defaultVisaCards = [
  { country: "Pakistan", passportLabel: "Passport Holders", price: "From £165", slug: "pakistan" },
  { country: "India", passportLabel: "Passport Holders", price: "From £155", slug: "india" },
  { country: "Bangladesh", passportLabel: "Passport Holders", price: "From £155", slug: "bangladesh" },
  { country: "Afghanistan", passportLabel: "Passport Holders", price: "From £170", slug: "afghanistan" },
  { country: "British", passportLabel: "Passport Holders", price: "From £139", slug: "british" },
  { country: "Saudi ETA", passportLabel: "Quick Processing", price: "From £49", slug: "saudi-eta" },
  { country: "More", passportLabel: "Visa Options", price: "View All", slug: "saudi-visa" },
];

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
}: {
  theme?: "blue" | "red";
  eyebrow: string;
  title: string;
  highlight?: string;
  description: string;
  image?: string;
  caption?: string;
  chips?: string[];
  buttonLabel: string;
  buttonLink: string;
  route?: { from: string; to: string };
}) {
  const isRed = theme === "red";

  return (
    <div
      className={[
        "relative flex h-full min-h-[360px] flex-col overflow-hidden px-6 py-7 text-white",
        isRed
          ? "bg-gradient-to-b from-[#A40918] via-[#890514] to-[#69020F]"
          : "bg-gradient-to-b from-[#101D83] via-[#0C1972] to-[#091460]",
      ].join(" ")}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.42em] text-white/85">{eyebrow}</div>

        <h3 className="font-serif text-[34px] leading-[0.95] md:text-[44px]">
          {title}
          {highlight ? <span className="block text-red">{highlight}</span> : null}
        </h3>

        <p className="mt-4 max-w-[19rem] text-[15px] leading-8 text-white/90">{description}</p>

        {image ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-2">
            <div className="relative h-[150px] overflow-hidden rounded-xl bg-white/5">
              <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
        ) : (
          <div className="mt-5 flex h-[150px] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 text-center text-sm text-white/45">
            <div>
              <ImageIcon className="mx-auto mb-2 h-8 w-8" />
              <div>{caption || "Add panel image"}</div>
            </div>
          </div>
        )}

        {!route && caption ? <p className="mt-4 text-center text-sm leading-6 text-white/45">{caption}</p> : null}

        {route ? (
          <div className="mt-auto pt-7">
            <div className="mb-6 flex items-center justify-between font-serif text-[32px] tracking-tight text-white md:text-[38px]">
              <span>{route.from}</span>
              <span className="mx-3 flex-1 border-t border-dashed border-white/40" />
              <span>{route.to}</span>
            </div>
            <Link
              href={buttonLink}
              className="inline-flex min-h-[58px] w-full items-center justify-center rounded-full bg-white px-6 text-center text-[15px] font-extrabold uppercase tracking-[0.12em] text-red transition hover:translate-y-[-1px] hover:shadow-lg"
            >
              {buttonLabel} <MoveRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        ) : (
          <>
            {chips && chips.length > 0 ? (
              <div className="mt-auto flex flex-wrap gap-3 pt-7">
                {chips.map((chip) => (
                  <span key={chip} className="inline-flex items-center rounded-full border border-white/55 px-4 py-2 text-sm font-semibold text-white/95">
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}

            <Link
              href={buttonLink}
              className="mt-5 inline-flex min-h-[58px] w-full items-center justify-center rounded-full bg-white px-6 text-center text-[15px] font-extrabold uppercase tracking-[0.12em] text-primary transition hover:translate-y-[-1px] hover:shadow-lg"
            >
              {buttonLabel} <MoveRight className="ml-2 h-5 w-5" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function HomepageHeroBanner({ data, pageData }: { data: any; pageData?: any }) {
  const heroData = {
    heroEyebrow: data?.heroEyebrow || "EST IN UK 2001 · LICENSED PILGRIMAGE OPERATOR",
    title: pageData?.bannerTitle || data?.title || "Trusted UK Hajj & Umrah<br/>Travel Agency in the UK",
    description:
      pageData?.bannerDescription ||
      data?.description ||
      "Since 2001, British Haj Travel Ltd UK has helped pilgrims across the UK plan their sacred journeys with confidence. With over 20 years of experience, we offer trusted Hajj and Umrah packages, prioritising comfort, reliable service, and peace of mind throughout your spiritual journey.",
    primaryBtnLabel: data?.primaryBtnLabel || "Register For Hajj 2027",
    primaryBtnLink: data?.primaryBtnLink || "/hajj-packages",
    secondaryBtnLabel: data?.secondaryBtnLabel || "Umrah Enquiry 2026-27",
    secondaryBtnLink: data?.secondaryBtnLink || "/umrah-packages",
    bgImage: pageData?.bannerBgImage || data?.bannerBgImage || data?.bgImage || "",
    position: pageData?.bannerPosition || data?.bannerPosition || "center center",
    size: pageData?.bannerSize || data?.bannerSize || "cover",
    visaTitle: data?.visaTitle || "Umrah Visa",
    visaSubtitle: data?.visaSubtitle || "Fast & Hassle-Free Visa Processing",
    visaDocumentsLabel: data?.visaDocumentsLabel || "Required Documents",
    visaDocumentsLink: data?.visaDocumentsLink || "/saudi-visa",
    visaCards: Array.isArray(data?.visaCards) && data.visaCards.length > 0 ? data.visaCards : defaultVisaCards,
    journeyTextTop: data?.journeyTextTop || "YOUR JOURNEY",
    journeyTextBottom: data?.journeyTextBottom || "BEGINS HERE",
    journeyIllustrationUrl: data?.journeyIllustrationUrl || "",
    hotelEyebrow: data?.hotelEyebrow || "HOTEL BOOKING",
    hotelTitle: data?.hotelTitle || "Hotels in Makkah &",
    hotelHighlight: data?.hotelHighlight || "Madinah",
    hotelDescription: data?.hotelDescription || "Rooms close to the Haram, at prices booked direct.",
    hotelImage: data?.hotelImage || "",
    hotelCaption: data?.hotelCaption || "Makkah hotel / Clock Tower skyline (no people)",
    hotelTags:
      Array.isArray(data?.hotelTags) && data.hotelTags.length > 0 ? data.hotelTags : ["Haram view", "3★ - 5★", "Family rooms"],
    hotelButtonLabel: data?.hotelButtonLabel || "Book a Hotel",
    hotelButtonLink: data?.hotelButtonLink || "/hotels",
    flightsEyebrow: data?.flightsEyebrow || "FLIGHTS",
    flightsTitle: data?.flightsTitle || "Cheap Flights to Jeddah & Madinah",
    flightsDescription: data?.flightsDescription || "Direct and connecting fares from London, Manchester & Birmingham.",
    flightsImage: data?.flightsImage || "",
    flightsCaption: data?.flightsCaption || "Aircraft / runway at sunset (no people)",
    flightsRouteFrom: data?.flightsRouteFrom || "LHR",
    flightsRouteTo: data?.flightsRouteTo || "JED",
    flightsButtonLabel: data?.flightsButtonLabel || "Search Flights",
    flightsButtonLink: data?.flightsButtonLink || "/flights",
    quoteTitle: data?.quoteTitle || "Get a free Quote",
  };

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
    setQuoteStatus("Submitting to Database...");

    try {
      const res = await submitQuoteEnquiryAction({
        fullName: quoteForm.fullName,
        phone: quoteForm.phone,
        email: quoteForm.email,
        packageType: quoteForm.packageType,
        numberOfPilgrims: quoteForm.adults,
      });

      if (res.success) {
        const msg = res.message || "Thank you! Your quote request has been received. Our team will contact you shortly.";
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
      <section className="bg-[#f8fafc]">
        <div className="mx-auto w-full px-0">
          <div className="overflow-hidden bg-white shadow-[0_20px_65px_rgba(2,12,27,0.15)]">
            <div className="grid lg:grid-cols-[1.08fr_2fr_1.35fr_1fr]">
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
              />

              <div className="relative overflow-hidden bg-[linear-gradient(90deg,#1A1B6C_0%,#2B256E_55%,#2D225F_100%)] px-7 py-8 text-white md:px-10 lg:px-12 lg:py-12">
                {heroData.bgImage ? (
                  <>
                    <Image
                      src={heroData.bgImage}
                      alt=""
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover opacity-[0.16] mix-blend-screen"
                      style={{ objectPosition: heroData.position || "center center", objectFit: (heroData.size as any) || "cover" }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,96,0.94)_0%,rgba(31,32,93,0.88)_58%,rgba(35,25,71,0.92)_100%)]" />
                  </>
                ) : null}

                <div className="relative z-10 flex h-full flex-col justify-center">
                  <div className="mb-5 text-[13px] font-extrabold uppercase tracking-[0.18em] text-white/85">{heroData.heroEyebrow}</div>
                  <h1 className="max-w-[12ch] font-serif text-[36px] leading-[1.04] sm:text-[42px] lg:text-[56px]" dangerouslySetInnerHTML={{ __html: heroData.title }} />
                  <p className="mt-6 max-w-[36rem] text-[16px] leading-8 text-white/88 lg:text-[17px]">{heroData.description}</p>

                  <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                    <Link
                      href={heroData.primaryBtnLink}
                      className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-red px-7 text-center text-[15px] font-extrabold uppercase tracking-[0.1em] text-white transition hover:translate-y-[-1px] hover:bg-red/90 hover:shadow-lg"
                    >
                      {heroData.primaryBtnLabel}
                    </Link>
                    <Link
                      href={heroData.secondaryBtnLink}
                      className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-white px-7 text-center text-[15px] font-extrabold uppercase tracking-[0.1em] text-primary transition hover:translate-y-[-1px] hover:bg-slate-100 hover:shadow-lg"
                    >
                      {heroData.secondaryBtnLabel}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-[linear-gradient(180deg,#091B82_0%,#0B1970_100%)] px-6 py-7 text-white md:px-8 md:py-8">
                <div className="mx-auto h-full max-w-[380px] rounded-[28px] bg-[#0B1672] p-6 shadow-[0_22px_40px_rgba(2,12,27,0.25)] md:p-7">
                  <h2 className="mb-6 text-center font-serif text-[32px] leading-none text-white md:text-[36px]">{heroData.quoteTitle}</h2>
                  {quoteStatus ? <p className="mb-4 text-center text-sm font-semibold text-white/85">{quoteStatus}</p> : null}

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
                          className={`h-14 w-full rounded-none border bg-white px-4 text-[15px] text-slate-900 outline-none transition ${
                            quoteErrors.fullName ? "border-red-600 ring-1 ring-red-600" : "border-slate-200 focus:border-red"
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
                          className={`h-14 w-full rounded-none border bg-white px-4 text-[15px] text-slate-900 outline-none transition ${
                            quoteErrors.phone ? "border-red-600 ring-1 ring-red-600" : "border-slate-200 focus:border-red"
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
                          className={`h-14 w-full rounded-none border bg-white px-4 text-[15px] text-slate-900 outline-none transition ${
                            quoteErrors.email ? "border-red-600 ring-1 ring-red-600" : "border-slate-200 focus:border-red"
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

              <HeroSidePanel
                theme="red"
                eyebrow={heroData.flightsEyebrow}
                title={heroData.flightsTitle}
                description={heroData.flightsDescription}
                image={heroData.flightsImage}
                caption={heroData.flightsCaption}
                buttonLabel={heroData.flightsButtonLabel}
                buttonLink={heroData.flightsButtonLink}
                route={{ from: heroData.flightsRouteFrom, to: heroData.flightsRouteTo }}
              />
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
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
                <Link
                  href={heroData.visaDocumentsLink}
                  className="inline-flex whitespace-nowrap rounded-full border border-slate-200/60 bg-[#F1F5F9] px-4 py-2 text-xs font-semibold text-primary shadow-sm transition-all hover:bg-[#E2E8F0] md:text-sm"
                >
                  <FileText className="mr-2 h-4 w-4 text-primary" />
                  <span>{heroData.visaDocumentsLabel}</span>
                  <ChevronRight className="ml-2 h-3.5 w-3.5 text-primary" />
                </Link>
              </div>
            </div>

            <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden xl:grid xl:grid-cols-7 xl:overflow-visible xl:pb-0 lg:gap-3">
              {heroData.visaCards.map((visa: any, index: number) => {
                const cardHref = visa.slug?.startsWith("/") || visa.slug?.startsWith("http")
                  ? visa.slug
                  : `/saudi-visa?visa=${encodeURIComponent(visa.slug || "")}`;

                return (
                  <Link
                    key={`${visa.slug || visa.country}-${index}`}
                    href={cardHref}
                    className="group flex min-w-[170px] flex-1 snap-start flex-col justify-between rounded-2xl border border-slate-100/90 bg-white p-3.5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] sm:min-w-[185px] xl:min-w-0"
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
        </div>
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
