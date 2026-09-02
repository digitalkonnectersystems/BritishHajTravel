"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { submitQuoteEnquiryAction } from "@/actions/enquiryActions";
import SubmissionSuccessModal from "@/components/SubmissionSuccessModal";

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
              className="absolute inset-0 bg-[linear-gradient(100deg,rgba(10,20,18,.92)_0%,rgba(10,20,18,.72)_38%,rgba(10,20,18,.15)_68%)]"
            />
            <div className="hero-pattern"></div>
            <div className="hero-content">
              <div className="eyebrow">{heroData.heroEyebrow}</div>
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
            <div className="badges">
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
            </div>
          </div>
        </div>

        <div className="max-w-[1080px] mx-auto px-5">
          <div className="relative rounded-3xl shadow-xl bg-sage p-6 md:p-8 max-md:mt-6 -mt-8">
            <h2 className="text-2xl md:text-3xl font-serif tracking-tight text-center mb-6">
              Get a free Quote
            </h2>
            {quoteStatus && <p className="text-center text-emerald-800 font-semibold mb-6">{quoteStatus}</p>}

            <form noValidate className="flex flex-col gap-4" onSubmit={handleQuoteSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <label htmlFor="quote-fullName" className="block text-xs font-bold uppercase tracking-wider mb-1.5">
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
                    className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${quoteErrors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                      }`}
                  />
                  {quoteErrors.fullName && <span className="text-red-600 text-xs font-semibold mt-1 block">{quoteErrors.fullName}</span>}
                </div>

                <div className="relative">
                  <label htmlFor="quote-phone" className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="quote-phone"
                    placeholder="+1(___) ___-____"
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
                    className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${quoteErrors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                      }`}
                  />
                  {quoteErrors.phone && <span className="text-red-600 text-xs font-semibold mt-1 block">{quoteErrors.phone}</span>}
                </div>

                <div className="relative">
                  <label htmlFor="quote-email" className="block text-xs font-bold uppercase tracking-wider mb-1.5">
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
                    className={`w-full border p-3 rounded-sm bg-slate-50 outline-none transition-colors duration-300 text-slate-900 text-sm font-normal placeholder:text-slate-400 ${quoteErrors.email ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "border-line focus:border-gold"
                      }`}
                  />
                  {quoteErrors.email && <span className="text-red-600 text-xs font-semibold mt-1 block">{quoteErrors.email}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="relative">
                  <label htmlFor="quote-package" className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Select Your Package
                  </label>
                  <select
                    id="quote-package"
                    value={quoteForm.packageType}
                    onChange={(e) => setQuoteForm({ ...quoteForm, packageType: e.target.value })}
                    className="cursor-pointer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-slate-900 text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                  >
                    <option>Select Package</option>
                    <option>Umrah Package</option>
                    <option>Hajj Package</option>
                    <option>Flight Only</option>
                    <option>Saudi Visa</option>
                  </select>
                </div>


                <div className="relative">
                  <label htmlFor="quote-pilgrims" className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Number of Pilgrims
                  </label>
                  <input
                    type="number"
                    min="1"
                    id="quote-pilgrims"
                    value={quoteForm.adults}
                    onChange={(e) => setQuoteForm({ ...quoteForm, adults: parseInt(e.target.value, 10) || 1 })}
                    className="w-full border border-line p-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-slate-900 text-sm font-medium"
                  />
                </div>

                <div className="">
                  <button
                    type="submit"
                    className="w-full bg-gold text-ink font-extrabold py-3.5 px-6 rounded-sm shadow-md hover:bg-gold-lt active:scale-[0.99] transition-all duration-300 tracking-wider uppercase text-sm flex items-center justify-center cursor-pointer"
                  >
                    <span>SUBMIT</span>
                  </button>
                </div>
              </div>
            </form>
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
