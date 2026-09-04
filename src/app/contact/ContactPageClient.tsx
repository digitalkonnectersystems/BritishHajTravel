"use client";

import { useState } from "react";
import PageBanner from "@/components/PageBanner";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import { submitContactEnquiryAction } from "@/actions/enquiryActions";
import SubmissionSuccessModal from "@/components/SubmissionSuccessModal";

function ContactInfoCardsSection({ data }: { data?: any }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-5 relative z-20 -mt-20 md:-mt-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Locations */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100/80 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gold-soft text-gold flex items-center justify-center text-xl mb-4">
            <i className="fa-solid fa-location-dot"></i>
          </div>
          <h3 className="text-md font-extrabold uppercase tracking-widest text-primary mb-4">
            {data?.card1Title || "OUR LOCATIONS"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-center sm:text-left border-t border-slate-100 pt-4 mt-auto">
            {/* Head Office */}
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[12px] font-extrabold text-primary uppercase tracking-wide mb-1">HEAD OFFICE</span>
              <a
                className="text-xs font-medium leading-relaxed text-ink hover:text-gold transition no-underline"
                href="https://maps.app.goo.gl/1BRUoBxtt4wWw58t6"
                target="_blank"
                rel="noopener noreferrer"
              >
                {data?.headAddress || "1325 Eglinton Ave E Suite Number 218, Mississauga, ON L4W 4L9, UK"}
              </a>
            </div>

            {/* Branch Office */}
            <div className="flex flex-col items-center sm:items-start border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
              <span className="text-[12px] font-extrabold text-primary uppercase tracking-wide mb-1">BRANCH OFFICE</span>
              <a
                className="text-xs font-medium leading-relaxed text-ink hover:text-gold transition no-underline"
                href="https://maps.app.goo.gl/U6B4fci2Jas4sh6S6"
                target="_blank"
                rel="noopener noreferrer"
              >
                {data?.branchAddress || "22 Ontario St S, Milton, ON L9T 2M6, UK"}
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: Phone Support */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100/80 flex flex-col items-center text-center justify-between">
          <div className="flex flex-col items-center w-full">
            <div className="w-12 h-12 rounded-2xl bg-gold-soft text-gold flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-phone"></i>
            </div>
            <h3 className="text-md font-extrabold uppercase tracking-widest text-primary mb-4">
              {data?.card2Title || "24/7 SUPPORT"}
            </h3>
            <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4 w-full">
              {(() => {
                const supportList: any[] = (data?.supportItems && Array.isArray(data.supportItems) && data.supportItems.length > 0)
                  ? data.supportItems
                  : [
                    { phone: data?.phone1 || '+1 800-844-5464', label: '', text: data?.phone1 || '+1 800-844-5464', url: `tel:${(data?.phone1 || '+18008445464').replace(/\s+/g, '')}`, openInNewTab: false },
                    { phone: data?.phone2 || '+1 905-624-8555', label: '', text: data?.phone2 || '+1 905-624-8555', url: `tel:${(data?.phone2 || '+19056248555').replace(/\s+/g, '')}`, openInNewTab: false },
                    { phone: data?.phone3 || '+1 905-624-8344', label: '', text: data?.phone3 || '+1 905-624-8344', url: `tel:${(data?.phone3 || '+19056248344').replace(/\s+/g, '')}`, openInNewTab: false },
                  ];

                return supportList
                  .filter((item: any) => item && (item.phone || item.text || item.url))
                  .map((item: any, idx: number) => {
                    const phoneDisplay = item.phone || item.text || '';
                    const labelDisplay = item.label ? ` - ${item.label}` : '';
                    const actionUrl = item.url || (phoneDisplay.includes('@') ? `mailto:${phoneDisplay.trim()}` : `tel:${phoneDisplay.replace(/[^0-9+]/g, '')}`);

                    return (
                      <a
                        key={idx}
                        className="text-sm hover:text-gold transition font-semibold no-underline flex items-center justify-center gap-1.5 flex-wrap"
                        href={actionUrl}
                        target={item.openInNewTab ? "_blank" : undefined}
                        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                      >
                        <span className="text-ink hover:text-gold font-sans text-sm">{phoneDisplay} -</span>
                        {item.label && (
                          <span className="text-ink-light font-medium text-xs inline-flex items-center">
                            {item.label}
                          </span>
                        )}
                      </a>
                    );
                  });
              })()}
            </div>
          </div>
        </div>

        {/* Card 3: Email & Socials */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100/80 flex flex-col items-center text-center justify-between">
          <div className="flex flex-col items-center w-full mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-soft text-gold flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-envelope"></i>
            </div>
            <h3 className="text-md font-extrabold uppercase tracking-widest text-primary mb-2">
              {data?.card3Title || "EMAIL US"}
            </h3>
            <a href={`mailto:${data?.email || "info@kingtravelcan.com"}`} className="text-sm text-ink hover:text-gold transition break-all font-semibold no-underline">
              {data?.email || "info@kingtravelcan.com"}
            </a>
          </div>

          <div className="w-full border-t border-slate-100 pt-3 flex flex-col items-center">
            <h4 className="text-md font-extrabold uppercase tracking-widest text-primary mb-2.5">FOLLOW US</h4>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(() => {
                const socialList: any[] = (data?.socialLinks && Array.isArray(data.socialLinks) && data.socialLinks.length > 0)
                  ? data.socialLinks
                  : [
                    { name: 'Facebook', url: data?.facebookUrl || 'https://www.facebook.com/kingtravelcan', icon: '/img/fb.svg', openInNewTab: true },
                    { name: 'Instagram', url: data?.instagramUrl || 'https://www.instagram.com/kingtravelcan/', icon: '/img/insta.svg', openInNewTab: true },
                    { name: 'LinkedIn', url: data?.linkedinUrl || 'https://ca.linkedin.com/company/kingtravelcan', icon: '/img/in.svg', openInNewTab: true },
                    { name: 'TikTok', url: data?.tiktokUrl || 'https://www.tiktok.com/@kingtravelcan', icon: '/img/tik.svg', openInNewTab: true },
                    { name: 'Twitter X', url: data?.twitterUrl || 'https://twitter.com/kingtravelcan', icon: '/img/x.svg', openInNewTab: true },
                    { name: 'Pinterest', url: data?.pinterestUrl || 'https://pinterest.com/kingtravelcan', icon: '/img/pinterest.svg', openInNewTab: true },
                  ];

                return socialList
                  .filter((item: any) => item && (item.url || item.icon))
                  .map((item: any, sIdx: number) => (
                    <a
                      key={sIdx}
                      href={item.url || '#'}
                      target={item.openInNewTab ? "_blank" : "_self"}
                      rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                      title={item.name || 'Social Link'}
                      className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center no-underline p-1.5 group shadow-xs"
                    >
                      {item.icon ? (
                        <img
                          src={item.icon}
                          alt={item.name || 'Social Icon'}
                          className="w-full h-full object-contain filter"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-700 group-hover:text-white transition-colors">
                          {item.name?.slice(0, 2) || '🔗'}
                        </span>
                      )}
                    </a>
                  ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactFormSection({ data, initialFormConfig }: { data?: any; initialFormConfig?: any }) {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const formConfig = initialFormConfig || null;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [ticketRef, setTicketRef] = useState('');


  const isDisabled = formConfig && formConfig.enabled === false;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;

    const newErrors: Record<string, string> = {};
    if (!contactForm.name.trim()) newErrors.name = "Please fill out this field.";
    if (!contactForm.email.trim()) {
      newErrors.email = "Please fill out this field.";
    } else if (!/\S+@\S+\.\S+/.test(contactForm.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!contactForm.message.trim()) newErrors.message = "Please fill out this field.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setContactStatus("Sending message to database...");
    try {
      const resData = await submitContactEnquiryAction({
        fullName: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        website: contactForm.website,
        message: contactForm.message,
      });

      if (resData.success) {
        const finalMsg = formConfig?.successMessage || resData.message || "Thank you! Your message has been received. Our team will contact you shortly.";
        setSuccessMsg(finalMsg);
        if (resData.ticketNumber) setTicketRef(resData.ticketNumber);
        setModalOpen(true);
        setContactStatus(null);
        setContactForm({
          name: "",
          email: "",
          phone: "",
          website: "",
          message: "",
        });
      } else {
        setContactStatus(resData.error || "Submission failed.");
      }
    } catch {
      setContactStatus("Failed to send message.");
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl bg-white">
      {isDisabled && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 text-center bg-slate-950/75 backdrop-blur-md border border-gold/40 rounded-3xl shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-2xl mb-4 text-gold">
            ⚠️
          </div>
          <h3 className="text-lg font-extrabold text-gold tracking-wide mb-2">
            Form Temporarily Unavailable
          </h3>
          <p className="text-xs text-amber-100/90 max-w-md font-medium leading-relaxed">
            We apologize for the inconvenience. This form is currently unavailable for submissions. Please contact our team directly via phone or email for immediate assistance.
          </p>
        </div>
      )}

      <div className={`p-6 md:p-8 flex flex-col justify-between transition-all duration-300 ${isDisabled ? "filter blur-[3px] opacity-40 pointer-events-none select-none" : ""}`}>
        <div>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              {formConfig?.title ? formConfig.title : <>Drop Us A <span className="text-primary">Message</span></>}
            </h2>
            <p className="text-gray-500 text-sm mt-2">{formConfig?.subtitle || data?.subtitle || "Fill out the form below and we'll get back to you shortly."}</p>
          </div>

          {contactStatus && <p className="text-center text-gold font-semibold mb-6">{contactStatus}</p>}

          <form noValidate className="flex flex-col gap-4" onSubmit={handleContactSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  placeholder=" "
                  value={contactForm.name}
                  onChange={(e) => {
                    setContactForm({ ...contactForm, name: e.target.value });
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={`peer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.name ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-gold"}`}
                />
                <label
                  htmlFor="name"
                  className={`absolute left-3 top-3 text-sm transition-all duration-300 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:left-0 peer-focus:text-xs font-semibold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs ${errors.name ? "text-red-600 peer-focus:text-red-600" : "text-slate-400 peer-focus:text-gold"}`}
                >
                  Name
                </label>
                {errors.name && <span className="text-red-600 text-xs font-semibold mt-1 block">{errors.name}</span>}
              </div>

              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder=" "
                  value={contactForm.email}
                  onChange={(e) => {
                    setContactForm({ ...contactForm, email: e.target.value });
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={`peer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.email ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-gold"}`}
                />
                <label
                  htmlFor="email"
                  className={`absolute left-3 top-3 text-sm transition-all duration-300 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:left-0 peer-focus:text-xs font-semibold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs ${errors.email ? "text-red-600 peer-focus:text-red-600" : "text-slate-400 peer-focus:text-gold"}`}
                >
                  Email Address
                </label>
                {errors.email && <span className="text-red-600 text-xs font-semibold mt-1 block">{errors.email}</span>}
              </div>

              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  placeholder=" "
                  maxLength={11}
                  value={contactForm.phone}
                  onChange={(e) => {
                    let val = e.target.value;
                    const startsWithPlus = val.startsWith("+");
                    const digits = val.replace(/[^0-9]/g, "");
                    val = (startsWithPlus ? "+" : "") + digits;
                    if (val.length > 11) val = val.slice(0, 11);
                    setContactForm({ ...contactForm, phone: val });
                  }}
                  className={`peer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.phone ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-gold"}`}
                />
                <label
                  htmlFor="phone"
                  className={`absolute left-3 top-3 text-sm transition-all duration-300 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:left-0 peer-focus:text-xs font-semibold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs ${errors.phone ? "text-red-600 peer-focus:text-red-600" : "text-slate-400 peer-focus:text-gold"}`}
                >
                  Phone Number
                </label>
              </div>

              <div className="relative">
                <input
                  type="url"
                  id="website"
                  placeholder=" "
                  value={contactForm.website}
                  onChange={(e) => setContactForm({ ...contactForm, website: e.target.value })}
                  className={`peer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat focus:border-gold`}
                />
                <label
                  htmlFor="subject"
                  className={`absolute left-3 top-3 text-sm transition-all duration-300 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:left-0 peer-focus:text-xs font-semibold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs text-slate-400 peer-focus:text-gold`}
                >
                  Subject
                </label>
              </div>
            </div>

            <div className="relative">
              <textarea
                id="message"
                rows={6}
                placeholder=" "
                value={contactForm.message}
                onChange={(e) => {
                  setContactForm({ ...contactForm, message: e.target.value });

                  if (errors.message) {
                    setErrors((prev) => ({
                      ...prev,
                      message: "",
                    }));
                  }
                }}
                className={`peer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.message ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-gold min-h-[230px]"}`}
              />

              <label
                htmlFor="message"
                className={`absolute left-3 top-3 text-sm transition-all duration-300 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:left-0 peer-focus:text-xs font-semibold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs ${errors.message ? "text-red-600 peer-focus:text-red-600" : "text-slate-400 peer-focus:text-gold"}`}
              >
                How can we help you?
              </label>

              {errors.message && (
                <span className="text-red-600 text-xs font-semibold mt-1 block">
                  {errors.message}
                </span>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="group w-full bg-gold hover:bg-gold-lt hover:text-white text-white font-bold py-4 px-8 rounded-md shadow-md hover:shadow-md active:scale-[0.99] transition-all duration-200 tracking-wider uppercase text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>SEND MESSAGE</span>
                <i className="fa-solid fa-paper-plane text-xs group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
      <SubmissionSuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={successMsg}
        referenceNumber={ticketRef}
      />
    </div>
  );
}

function ContactMapsSection({ data }: { data?: any }) {
  const headTitle = data?.headTitle || "Head Office";
  const headAddress = data?.headAddress || "1325 Eglinton Ave E Suite Number 218, Mississauga, ON L4W 4L9, UK";
  const headMap = data?.headMapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.1637775952674!2d-79.62528662340336!3d43.63487945347209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b3897316b3bdb%3A0xc6758691a49d5a8e!2sKing%20Travel%20Can%20Ltd%20-%20Mississauga!5e0!3m2!1sen!2sca!4v1710000000000!5m2!1sen!2sca";

  const branchTitle = data?.branchTitle || "Branch Office";
  const branchAddress = data?.branchAddress || "22 Ontario St S, Milton, ON L9T 2M6, UK";
  const branchMap = data?.branchMapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2893.6521568283307!2d-79.87981462340915!3d43.5177187791263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b6fa0d880eae9%3A0xc57548acb421436c!2s22%20Ontario%20St%20S%2C%20Milton%2C%20ON%20L9T%202M6%2C%20UK!5e0!3m2!1sen!2sca!4v1710000000001!5m2!1sen!2sca";

  return (
    <div className="flex flex-col gap-6 h-full justify-between">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 p-4 flex-1 flex flex-col min-h-[250px]">
        <div className="mb-3 pl-2">
          <h3 className="text-md font-extrabold uppercase tracking-widest text-primary flex items-center gap-2">
            <i className="fa-solid fa-building text-gold"></i> {headTitle}
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-0.5">{headAddress}</p>
        </div>
        <iframe
          src={headMap}
          className="w-full h-full min-h-[200px] rounded-2xl border-none flex-1"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 p-4 flex-1 flex flex-col min-h-[250px]">
        <div className="mb-3 pl-2">
          <h3 className="text-md font-extrabold uppercase tracking-widest text-primary flex items-center gap-2">
            <i className="fa-solid fa-building text-gold"></i> {branchTitle}
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-0.5">{branchAddress}</p>
        </div>
        <iframe
          src={branchMap}
          className="w-full h-full min-h-[200px] rounded-2xl border-none flex-1"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}

export default function ContactPageClient({ initialPageData, initialFormConfig }: { initialPageData?: any; initialFormConfig?: any }) {
  const pageData = initialPageData || null;
  let sections: any[] = [];
  if (pageData?.sections) {
    try {
      const parsed = typeof pageData.sections === "string" ? JSON.parse(pageData.sections) : pageData.sections;
      if (Array.isArray(parsed)) sections = parsed;
    } catch (e) {
      console.error("Error parsing contact page sections:", e);
    }
  }

  const hasForm = sections.some((s: any) => s.type === "Contact Form" || s.type === "Contact Form + Maps");
  const hasMaps = sections.some((s: any) => s.type === "Contact Maps" || s.type === "Google Maps" || s.type === "Contact Form + Maps");
  const formSec = sections.find((s: any) => s.type === "Contact Form" || s.type === "Contact Form + Maps");

  return (
    <main className="bg-sage min-h-screen">
      {/* ================= DYNAMIC HERO BANNER ================= */}
      <PageBanner
        title={pageData?.bannerTitle || pageData?.title || "We'd <span>Love</span> To Hear From You"}
        description={pageData?.bannerDescription || "Have a question or want to work together? Choose the most convenient way to reach us."}
        bgImage={pageData?.bannerBgImage}
        position={pageData?.bannerPosition}
        size={pageData?.bannerSize}
      />

      {/* ================= ALWAYS RELIABLE SECTIONS ================= */}
      <ContactInfoCardsSection data={sections.find(s => s.type === "Contact Info Cards" || s.type === "Contact Bar")?.data} />

      <section className="max-w-7xl py-12 mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <ContactFormSection data={formSec?.data} initialFormConfig={initialFormConfig} />
          <ContactMapsSection data={sections.find((s: any) => s.type === "Contact Maps" || s.type === "Google Maps" || s.type === "Contact Form + Maps")?.data} />
        </div>
      </section>

      {(() => {
        const handledTypes = ["Contact Info Cards", "Contact Bar", "Contact Form", "Contact Maps", "Google Maps", "Contact Form + Maps"];
        const unhandled = sections.filter((s: any) => !handledTypes.includes(s.type));
        if (unhandled.length > 0) {
          return <PageSectionsRenderer sections={unhandled} pageData={pageData} />;
        }
        return null;
      })()}
    </main>
  );
}
