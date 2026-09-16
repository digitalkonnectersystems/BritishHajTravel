"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, ChevronRight, ArrowRight } from "lucide-react";
import { submitQuoteEnquiryAction } from "@/actions/enquiryActions";
import SubmissionSuccessModal from "@/components/SubmissionSuccessModal";

function IndiaFlag() {
  return (
    <svg viewBox="0 0 36 24" className="w-full h-full object-cover">
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
    <svg viewBox="0 0 36 24" className="w-full h-full object-cover">
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
    <svg viewBox="0 0 36 24" className="w-full h-full object-cover">
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
    <svg viewBox="0 0 36 24" className="w-full h-full object-cover">
      <rect width="36" height="24" fill="#006A4E" />
      <circle cx="16" cy="12" r="6.5" fill="#F42A41" />
    </svg>
  );
}

function AfghanFlag() {
  return (
    <svg viewBox="0 0 36 24" className="w-full h-full object-cover">
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
    <svg viewBox="0 0 36 24" className="w-full h-full object-cover">
      <rect width="36" height="24" fill="#006C35" />
      <path d="M9 9.5h18M10 11.5h16M12 7.5h12" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M9 15.5h16M25 15.5l2-1.5M9 14.5v2" stroke="#FFFFFF" strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  );
}

function CountryFlag({ country, flag, flagImage }: { country: string; flag?: string; flagImage?: string }) {
  if (flagImage && flagImage.trim()) {
    return (
      <img
        src={flagImage}
        alt={country}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
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
    <div className="flex items-center gap-3 select-none">
      {journeyIllustrationUrl ? (
        <img
          src={journeyIllustrationUrl}
          alt="Journey"
          className="w-24 h-12 shrink-0 object-contain"
        />
      ) : (
        /* Architectural Kaaba & Mosque sketch */
        <svg
          className="w-14 h-12 shrink-0"
          viewBox="0 0 70 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M11 5L12.5 12V36H9.5V12L11 5Z" fill="#CBD5E1" opacity="0.6" />
          <circle cx="11" cy="4" r="1.5" fill="#94A3B8" />
          <path d="M59 7L60.5 15V36H57.5V15L59 7Z" fill="#CBD5E1" opacity="0.6" />
          <circle cx="59" cy="6" r="1.5" fill="#94A3B8" />
          <path d="M4 36H24V48H4V36Z" fill="#F1F5F9" />
          <path d="M5 40C5 38 7 36 9 36C11 36 13 38 13 40V48H5V40Z" fill="#E2E8F0" />
          <path d="M15 40C15 38 17 36 19 36C21 36 23 38 23 40V48H15V40Z" fill="#E2E8F0" />
          <path d="M46 36H66V48H46V36Z" fill="#F1F5F9" />
          <path d="M47 40C47 38 49 36 51 36C53 36 55 38 55 40V48H47V40Z" fill="#E2E8F0" />
          <path d="M57 40C57 38 59 36 61 36C63 36 65 38 65 40V48H57V40Z" fill="#E2E8F0" />
          <path d="M25 24L35 19L45 24V46L35 51L25 46V24Z" fill="#1E293B" opacity="0.75" />
          <path d="M25 24L35 19V51L25 46V24Z" fill="#0F172A" opacity="0.85" />
          <path d="M35 19L45 24V46L35 51V19Z" fill="#334155" opacity="0.75" />
          <path d="M25 29L35 24.5L45 29.5V31.5L35 26.5L25 31V29Z" fill="#D97706" opacity="0.95" />
        </svg>
      )}
      {/* Tracked Text */}
      <div className="flex flex-col justify-center">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 tracking-[0.2em] uppercase leading-tight whitespace-nowrap">
          {journeyTextTop}
        </span>
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 tracking-[0.2em] uppercase leading-tight whitespace-nowrap">
          {journeyTextBottom}
        </span>
        <span className="w-6 h-[2.5px] bg-[#9E0911] rounded-full mt-1.5" />
      </div>
    </div>
  );
}

const defaultVisaCards = [
  { country: "Indian", passportLabel: "Passport", price: "£145", flag: "🇮🇳", flagImage: "", slug: "indian-passport" },
  { country: "Pakistani", passportLabel: "Passport", price: "£170", flag: "🇵🇰", flagImage: "", slug: "pakistani-passport" },
  { country: "British", passportLabel: "Passport", price: "£150", flag: "🇬🇧", flagImage: "", slug: "british-passport" },
  { country: "Bangladeshi", passportLabel: "Passport", price: "£185", flag: "🇧🇩", flagImage: "", slug: "bangladeshi-passport" },
  { country: "Afghan", passportLabel: "Passport (with BRN)", price: "£190", flag: "🇦🇫", flagImage: "", slug: "afghan-passport" },
  { country: "British Tourist", passportLabel: "(1 Year)", price: "£115", flag: "🇬🇧", flagImage: "", slug: "british-tourist-1-year" },
  { country: "ETA. Saudi Visa", passportLabel: "", price: "£29", flag: "🇸🇦", flagImage: "", slug: "eta-saudi-visa" },
];

export default function HomepageHeroBanner({ data, pageData }: { data: any, pageData?: any }) {
  const heroData = {
    heroEyebrow: data?.heroEyebrow || "",
    title: pageData?.bannerTitle || data?.title || "",
    description: pageData?.bannerDescription || data?.description || "",
    primaryBtnLabel: data?.primaryBtnLabel || "",
    primaryBtnLink: data?.primaryBtnLink || "",
    secondaryBtnLabel: data?.secondaryBtnLabel || "",
    secondaryBtnLink: data?.secondaryBtnLink || "",
    badge1Top: data?.badge1Top || "",
    badge1Sub: data?.badge1Sub || "",
    badge2Top: data?.badge2Top || "",
    badge2Sub: data?.badge2Sub || "",
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
    visaIconUrl: data?.visaIconUrl || "",
  };

  const [quoteForm, setQuoteForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    packageType: "Select your package",
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
          phone: "",
          email: "",
          packageType: "Select your package",
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
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-media min-h-[640px]">
            <Image
              src={heroData.bgImage || "/img/hero.png"}
              alt=""
              fill
              preload
              fetchPriority="high"
              quality={60}
              sizes="100vw"
              style={{
                objectFit: heroData.size === "auto" ? "none" : (heroData.size || "cover"),
                objectPosition: heroData.position || "center center",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(100deg,#0A1447D9_0%,#0A1447B3_38%,#0A144626_68%)]"
            />
            <div className="hero-pattern"></div>
            <div className="hero-content">
              <div className="eyebrowht">{heroData.heroEyebrow}</div>
              <h1 dangerouslySetInnerHTML={{ __html: heroData.title }} />
              <p className="lead">{heroData.description}</p>
              <div className="hero-cta">
                <a className="btn" href={heroData.primaryBtnLink || '/umrah-packages'}>
                  {heroData.primaryBtnLabel || 'View Umrah Packages'}
                </a>
                <Link className="btn ghost-light" href={heroData.secondaryBtnLink || '/contact'}>
                  {heroData.secondaryBtnLabel || 'Speak With an Advisor'}
                </Link>
              </div>
            </div>
            {/* <div className="badges">
              <div className="float-badge badge-1">
                <div className="ico">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2 L14 9 L21 9 L15 13.5 L17 21 L12 16.5 L7 21 L9 13.5 L3 9 L10 9 Z"></path>
                  </svg>
                </div>
                <div>
                  <div className="n">{heroData.badge1Top}</div>
                  <div className="l">{heroData.badge1Sub}</div>
                </div>
              </div>
              <div className="float-badge badge-2">
                <div className="ico">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 21V10l9-6 9 6v11"></path>
                    <path d="M9 21v-7h6v7"></path>
                  </svg>
                </div>
                <div>
                  <div className="n">{heroData.badge2Top}</div>
                  <div className="l">{heroData.badge2Sub}</div>
                </div>
              </div>
            </div> */}

            {/* <div className="max-w-[1080px] mx-auto px-5">
              <div className="relative rounded-3xl shadow-xl bg-primary p-6 md:p-8 max-md:mt-6 -mt-8">
                <h2 className="text-2xl text-white md:text-3xl font-serif tracking-tight text-center mb-6">
                  Get a free Quote
                </h2>
                {quoteStatus && <p className="text-center text-primary font-semibold mb-6">{quoteStatus}</p>}

                <form noValidate className="flex flex-col gap-4" onSubmit={handleQuoteSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <label htmlFor="quote-fullName" className="text-white block text-xs font-bold uppercase tracking-wider mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="quote-fullName"
                        placeholder="Full Name"
                        value={quoteForm.fullName}
                        onChange={(e) => {
                          setQuoteForm({ ...quoteForm, fullName: e.target.value });
                          if (quoteErrors.fullName) setQuoteErrors((prev) => ({ ...prev, fullName: "" }));
                        }}
                        className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-red transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${quoteErrors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                          }`}
                      />
                      {quoteErrors.fullName && <span className="text-red-600 text-xs font-semibold mt-1 block">{quoteErrors.fullName}</span>}
                    </div>

                    <div className="relative">
                      <label htmlFor="quote-phone" className="text-white block text-xs font-bold uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="quote-phone"
                        placeholder="+44(___) ___-____"
                        value={quoteForm.phone}
                        inputMode="numeric"
                        maxLength={11}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 11);

                          setQuoteForm({
                            ...quoteForm,
                            phone: value,
                          });

                          if (quoteErrors.phone) {
                            setQuoteErrors((prev) => ({
                              ...prev,
                              phone: "",
                            }));
                          }
                        }}
                        className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-red transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${quoteErrors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                          }`}
                      />
                      {quoteErrors.phone && <span className="text-red-600 text-xs font-semibold mt-1 block">{quoteErrors.phone}</span>}
                    </div>

                    <div className="relative">
                      <label htmlFor="quote-email" className="text-white block text-xs font-bold uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="quote-email"
                        placeholder="your@email.com"
                        value={quoteForm.email}
                        onChange={(e) => {
                          setQuoteForm({ ...quoteForm, email: e.target.value });
                          if (quoteErrors.email) setQuoteErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        className={`w-full border p-3 rounded-sm bg-slate-50 outline-none transition-colors duration-300 text-slate-900 text-sm font-normal placeholder:text-slate-400 ${quoteErrors.email ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "border-line focus:border-red"
                          }`}
                      />
                      {quoteErrors.email && <span className="text-red-600 text-xs font-semibold mt-1 block">{quoteErrors.email}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="relative">
                      <label htmlFor="quote-package" className="text-white block text-xs font-bold uppercase tracking-wider mb-1.5">
                        Select Your Package
                      </label>
                      <select
                        id="quote-package"
                        value={quoteForm.packageType}
                        onChange={(e) => setQuoteForm({ ...quoteForm, packageType: e.target.value })}
                        className="cursor-pointer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-red transition-colors text-slate-900 text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                      >
                        <option>Select Package</option>
                        <option>Umrah Package</option>
                        <option>Hajj Package</option>
                        <option>Flight Only</option>
                        <option>Saudi Visa</option>
                      </select>
                    </div>


                    <div className="relative">
                      <label htmlFor="quote-pilgrims" className="text-white block text-xs font-bold uppercase tracking-wider mb-1.5">
                        Number of Pilgrims
                      </label>
                      <input
                        type="number"
                        min="1"
                        id="quote-pilgrims"
                        value={quoteForm.adults}
                        onChange={(e) => setQuoteForm({ ...quoteForm, adults: parseInt(e.target.value, 10) || 1 })}
                        className="w-full border border-line p-3 rounded-sm bg-slate-50 outline-none focus:border-red transition-colors text-slate-900 text-sm font-medium"
                      />
                    </div>

                    <div className="">
                      <button
                        type="submit"
                        className="w-full btnff font-extrabold py-3.5 px-6 rounded-sm shadow-md active:scale-[0.99] transition-all duration-300 tracking-wider uppercase text-sm flex items-center justify-center cursor-pointer"
                      >
                      <span>SUBMIT</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div> */}
            <div className="max-w-[1080px]">
              <div className="relative rounded-3xl shadow-xl bg-primary p-6 md:p-8 max-md:mt-6 -mt-8">
                <h2 className="text-2xl text-white md:text-3xl font-serif tracking-tight text-center mb-6">
                  Get a free Quote
                </h2>
                {quoteStatus && <p className="text-center text-primary font-semibold mb-6">{quoteStatus}</p>}

                <form noValidate className="flex flex-col gap-6" onSubmit={handleQuoteSubmit}>
                  {/* 2-Column Grid for Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    
                    {/* 1. Full Name */}
                    <div className="relative">
                      <label htmlFor="quote-fullName" className="text-white block text-xs font-bold uppercase tracking-wider mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="quote-fullName"
                        placeholder="Full Name"
                        value={quoteForm.fullName}
                        onChange={(e) => {
                          setQuoteForm({ ...quoteForm, fullName: e.target.value });
                          if (quoteErrors.fullName) setQuoteErrors((prev) => ({ ...prev, fullName: "" }));
                        }}
                        className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-red transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${
                          quoteErrors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                        }`}
                      />
                      {quoteErrors.fullName && <span className="text-red-600 text-xs font-semibold mt-1 block">{quoteErrors.fullName}</span>}
                    </div>

                    {/* 2. Phone Number */}
                    <div className="relative">
                      <label htmlFor="quote-phone" className="text-white block text-xs font-bold uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="quote-phone"
                        placeholder="+44(___) ___-____"
                        value={quoteForm.phone}
                        inputMode="numeric"
                        maxLength={11}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                          setQuoteForm({ ...quoteForm, phone: value });
                          if (quoteErrors.phone) {
                            setQuoteErrors((prev) => ({ ...prev, phone: "" }));
                          }
                        }}
                        className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-red transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${
                          quoteErrors.phone ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                        }`}
                      />
                      {quoteErrors.phone && <span className="text-red-600 text-xs font-semibold mt-1 block">{quoteErrors.phone}</span>}
                    </div>

                    {/* 3. Email Address */}
                    <div className="relative">
                      <label htmlFor="quote-email" className="text-white block text-xs font-bold uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="quote-email"
                        placeholder="your@email.com"
                        value={quoteForm.email}
                        onChange={(e) => {
                          setQuoteForm({ ...quoteForm, email: e.target.value });
                          if (quoteErrors.email) setQuoteErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        className={`w-full border p-3 rounded-sm bg-slate-50 outline-none transition-colors duration-300 text-slate-900 text-sm font-normal placeholder:text-slate-400 ${
                          quoteErrors.email ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "border-line focus:border-red"
                        }`}
                      />
                      {quoteErrors.email && <span className="text-red-600 text-xs font-semibold mt-1 block">{quoteErrors.email}</span>}
                    </div>

                    {/* 4. Select Package */}
                    <div className="relative">
                      <label htmlFor="quote-package" className="text-white block text-xs font-bold uppercase tracking-wider mb-1.5">
                        Select Your Package
                      </label>
                      <select
                        id="quote-package"
                        value={quoteForm.packageType}
                        onChange={(e) => setQuoteForm({ ...quoteForm, packageType: e.target.value })}
                        className="cursor-pointer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-red transition-colors text-slate-900 text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                      >
                        <option>Select Package</option>
                        <option>Umrah Package</option>
                        <option>Hajj Package</option>
                        <option>Flight Only</option>
                        <option>Saudi Visa</option>
                      </select>
                    </div>

                    {/* 5. Number of Pilgrims (Full Width across both columns) */}
                    <div className="relative md:col-span-2">
                      <label htmlFor="quote-pilgrims" className="text-white block text-xs font-bold uppercase tracking-wider mb-1.5">
                        Number of Pilgrims
                      </label>
                      <input
                        type="number"
                        min="1"
                        id="quote-pilgrims"
                        value={quoteForm.adults}
                        onChange={(e) => setQuoteForm({ ...quoteForm, adults: parseInt(e.target.value, 10) || 1 })}
                        className="w-full border border-line p-3 rounded-sm bg-slate-50 outline-none focus:border-red transition-colors text-slate-900 text-sm font-medium"
                      />
                    </div>

                  </div>

                  {/* 6. Centered Bottom Submit Button */}
                  <div className="w-full max-w-md mx-auto pt-2">
                    <button
                      type="submit"
                      className="w-full btnff font-extrabold py-3.5 px-6 rounded-sm shadow-md active:scale-[0.99] transition-all duration-300 tracking-wider uppercase text-sm flex items-center justify-center cursor-pointer"
                    >
                      <span>SUBMIT</span>
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl md:rounded-[30px] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)] bg-white p-5 sm:p-6 md:p-7 max-md:mt-6 -mt-10 sm:-mt-14 md:-mt-16 lg:-mt-20 border border-slate-100/90 z-20 overflow-hidden">
            {/* Header: Left Kaaba Sketch, Center Title & Subtitle, Right Required Documents */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 md:mb-7">
              {/* Left Column: Architectural Kaaba sketch & journey message */}
              <div className="hidden lg:flex items-center w-1/4 justify-start">
                <KaabaJourneyIllustration
                  journeyTextTop={heroData.journeyTextTop}
                  journeyTextBottom={heroData.journeyTextBottom}
                  journeyIllustrationUrl={heroData.journeyIllustrationUrl}
                />
              </div>

              {/* Center Column: Icon + Umrah Visa heading + Subtitle */}
              <div className="flex flex-col items-center text-center lg:w-2/4">
                <div className="flex items-center gap-2.5">
                  {/* <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#1E3A8A] flex items-center justify-center text-white shadow-sm shrink-0 overflow-hidden">
                    {heroData.visaIconUrl ? (
                      <img src={heroData.visaIconUrl} alt="Visa Icon" className="w-6 h-6 object-contain" />
                    ) : (
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="16" rx="2.5" />
                        <circle cx="8.5" cy="10.5" r="2" />
                        <path d="M6 15c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2" />
                        <line x1="14" y1="9" x2="18" y2="9" />
                        <line x1="14" y1="13" x2="18" y2="13" />
                      </svg>
                    )}
                  </div> */}
                  <h2 className="text-2xl sm:text-3xl md:text-[34px] font-serif text-primary font-normal tracking-tight m-0 leading-tight">
                    {heroData.visaTitle}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 mb-0">
                  {heroData.visaSubtitle}
                </p>
              </div>

              {/* Right Column: Required Documents pill button */}
              <div className="flex items-center justify-center lg:justify-end lg:w-1/4">
                <Link
                  href={heroData.visaDocumentsLink}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-primary px-4 py-2 text-xs md:text-sm font-semibold transition-all border border-slate-200/60 shadow-2xs whitespace-nowrap"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  <span>{heroData.visaDocumentsLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-primary" />
                </Link>
              </div>
            </div>

            {/* Visa Cards: Responsive Grid / Horizontal Scroll */}
            <div className="flex xl:grid xl:grid-cols-7 gap-2.5 lg:gap-3 overflow-x-auto xl:overflow-visible pb-2 xl:pb-0 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {heroData.visaCards.map((visa: any, index: number) => {
                const cardHref = visa.slug?.startsWith('/') || visa.slug?.startsWith('http')
                  ? visa.slug
                  : `/saudi-visa?visa=${encodeURIComponent(visa.slug || "")}`;

                return (
                  <Link
                    key={`${visa.slug || visa.country}-${index}`}
                    href={cardHref}
                    className="group min-w-[170px] sm:min-w-[185px] xl:min-w-0 snap-start flex-1 rounded-2xl border border-slate-100/90 bg-white p-3.5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 no-underline flex flex-col justify-between"
                  >
                    {/* Top: Flag + Country Name & Passport details */}
                    <div className="flex items-center gap-2.5">
                      <div className="shrink-0 w-9 h-6 rounded-[5px] overflow-hidden shadow-xs border border-slate-200/80 flex items-center justify-center bg-slate-50">
                        <CountryFlag country={visa.country} flag={visa.flag} flagImage={visa.flagImage || visa.flagSvg} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold text-slate-900 leading-tight truncate group-hover:text-primary transition-colors">
                          {visa.country}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium leading-tight truncate mt-0.5 min-h-[14px]">
                          {visa.passportLabel || "\u00A0"}
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Crimson Price Badge + Light Circle Arrow */}
                    <div className="flex items-center gap-2 mt-4">
                      <span className="flex-1 py-1.5 px-2 rounded-full bg-red group-hover:bg-red-700 text-white text-center text-xs sm:text-sm font-extrabold tracking-tight shadow-xs transition-colors">
                        {visa.price}
                      </span>
                      <span className="w-7 h-7 rounded-full bg-[#EDF2F7] group-hover:bg-red-700 group-hover:text-white text-primary flex items-center justify-center transition-all shrink-0">
                        <ArrowRight className="w-3.5 h-3.5" />
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
