"use client";

import { useState } from "react";
import { submitContactEnquiryAction } from "@/actions/enquiryActions";
import SubmissionSuccessModal from "@/components/SubmissionSuccessModal";

interface ContactSectionData {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  successMessage?: string;
  tollFree?: string;
  tollFreeNewTab?: boolean;
  localNum1?: string;
  localNum1NewTab?: boolean;
  localNum2?: string;
  landlines?: Array<{ number?: string; label?: string; openInNewTab?: boolean }>;
  waReservation?: string;
  waReservationLabel?: string;
  waReservationNewTab?: boolean;
  waVisa?: string;
  waVisaLabel?: string;
  waVisaNewTab?: boolean;
  whatsappList?: Array<{ number?: string; label?: string; openInNewTab?: boolean }>;
  email?: string;
  emailNewTab?: boolean;
  officeHours?: string;
  headOffice?: string;
  headOfficeMapUrl?: string;
  headOfficeNewTab?: boolean;
  branchOffice?: string;
  branchOfficeMapUrl?: string;
  branchOfficeNewTab?: boolean;
}

export default function ContactFormSection({ data }: { data: ContactSectionData }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    packageType: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalRef, setModalRef] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Please fill out this field.";
    if (!form.email.trim()) {
      newErrors.email = "Please fill out this field.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.packageType || form.packageType === "Select Package") newErrors.packageType = "Please select a package.";
    if (!form.message.trim()) newErrors.message = "Please fill out this field.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStatus("Sending...");
    try {
      const res = await submitContactEnquiryAction({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        packageType: form.packageType,
        message: form.message,
      });

      if (res.success) {
        const msg = data.successMessage || res.message || "Thank you! Your message has been received. Our team will contact you shortly.";
        setModalMsg(msg);
        if (res.ticketNumber) setModalRef(res.ticketNumber);
        setModalOpen(true);
        setStatus(null);
        setForm({ fullName: "", email: "", phone: "", packageType: "", message: "" });
      } else {
        setStatus(res.error || "Submission failed.");
      }
    } catch {
      setStatus("Failed to send message.");
    }
  };

  // Resolve Landlines list (repeater or legacy fallback)
  const resolvedLandlines: Array<{ number: string; label?: string; openInNewTab?: boolean }> = (data?.landlines && Array.isArray(data.landlines) && data.landlines.length > 0)
    ? data.landlines.filter(l => l && l.number?.trim()).map(l => ({ number: l.number!.trim(), label: l.label, openInNewTab: l.openInNewTab }))
    : [
      ...(data?.tollFree ? [{ number: data.tollFree, label: 'Toll Free / Main', openInNewTab: data.tollFreeNewTab ?? true }] : [{ number: "+1 905-624-8555", openInNewTab: true }]),
      ...(data?.localNum1 ? [{ number: data.localNum1, label: 'Local Line 2', openInNewTab: data.localNum1NewTab ?? true }] : [{ number: "+1 905-624-8344", openInNewTab: true }]),
    ];

  // Resolve WhatsApp list (repeater or legacy fallback)
  const resolvedWhatsApp: Array<{ number: string; label?: string; openInNewTab?: boolean }> = (data?.whatsappList && Array.isArray(data.whatsappList) && data.whatsappList.length > 0)
    ? data.whatsappList.filter(w => w && w.number?.trim()).map(w => ({ number: w.number!.trim(), label: w.label, openInNewTab: w.openInNewTab }))
    : [
      ...(data?.waReservation ? [{ number: data.waReservation, label: data.waReservationLabel || "Reservation", openInNewTab: data.waReservationNewTab ?? true }] : [{ number: "+1 647-982-8555", label: "Reservation", openInNewTab: true }]),
      ...(data?.waVisa ? [{ number: data.waVisa, label: data.waVisaLabel || "Saudi Visa", openInNewTab: data.waVisaNewTab ?? true }] : [{ number: "+1 800-844-5464", label: "Saudi Visa", openInNewTab: true }]),
    ];

  return (
    <section className="py-12 md:py-16 bg-sage">
      <div className="max-w-[1400px] mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Column: Contact Details */}
          <div className="contact-info">
            <div className="mb-10">
              <span className="eyebrow">
                {data.eyebrow || "GET IN TOUCH"}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-ink font-normal mb-3">
                {data.title || "Drop Us A Message"}
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-14">
                <div>
                  <h4 className="">LANDLINES:</h4>
                  <div className="flex flex-col gap-1">
                    {resolvedLandlines.map((item, idx) => (
                      <div key={idx} className="whitespace-nowrap">
                        <a
                          href={`tel:${item.number.replace(/\s+/g, '')}`}
                          target={item.openInNewTab ?? true ? "_blank" : "_self"}
                          rel={item.openInNewTab ?? true ? "noopener noreferrer" : undefined}
                          className="hover:text-emerald-800 transition-colors inline-block"
                        >
                          {item.number}
                        </a>
                        {item.label && (
                          <span className="text-xs font-normal text-slate-500 whitespace-nowrap"> - {item.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="">WHATSAPP:</h4>
                  <div className="flex flex-col gap-1">
                    {resolvedWhatsApp.map((item, idx) => (
                      <div key={idx} className="whitespace-nowrap">
                        <a
                          href={`https://wa.me/${item.number.replace(/[^0-9]/g, '')}`}
                          target={item.openInNewTab ?? true ? "_blank" : "_self"}
                          rel={item.openInNewTab ?? true ? "noopener noreferrer" : undefined}
                          className="hover:text-emerald-800 transition-colors inline-block"
                        >
                          {item.number}
                        </a>
                        {item.label && (
                          <span className="text-xs font-normal text-slate-500 whitespace-nowrap"> - {item.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <h4 className="">EMAIL</h4>
                <div className="">
                  <a
                    href={`mailto:${data.email || "info@kingtravelcan.com"}`}
                    target={data.emailNewTab ?? true ? "_blank" : "_self"}
                    rel={data.emailNewTab ?? true ? "noopener noreferrer" : undefined}
                    className="hover:text-emerald-800 transition-colors"
                  >
                    {data.email || "info@kingtravelcan.com"}
                  </a>
                </div>
              </div>

              {/* Office Hours */}
              {/* <div>
                <h4 className="">OFFICE HOURS</h4>
                <div className="">
                  {data.officeHours || "Mon–Sat, 9am – 7pm EST"}
                </div>
              </div> */}

              {/* Head Office */}
              <div>
                <h4 className="">HEAD OFFICE</h4>
                {(data.headOfficeMapUrl || "https://maps.app.goo.gl/1BRUoBxtt4wWw58t6") ? (
                  <a
                    href={data.headOfficeMapUrl || "https://maps.app.goo.gl/1BRUoBxtt4wWw58t6"}
                    target={data.headOfficeNewTab ?? true ? "_blank" : "_self"}
                    rel={data.headOfficeNewTab ?? true ? "noopener noreferrer" : undefined}
                    className="leading-relaxed block hover:text-emerald-800 transition-colors no-underline text-inherit"
                    dangerouslySetInnerHTML={{ __html: (data.headOffice || "1325 Eglinton Ave E Suite Number 218,\nMississauga, ON L4W 4L9, Canada").replace(/\n/g, '<br />') }}
                  />
                ) : (
                  <div
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: (data.headOffice || "1325 Eglinton Ave E Suite Number 218,\nMississauga, ON L4W 4L9, Canada").replace(/\n/g, '<br />') }}
                  />
                )}
              </div>

              {/* Branch Office */}
              <div>
                <h4 className="">BRANCH OFFICE</h4>
                {(data.branchOfficeMapUrl || "https://maps.app.goo.gl/U6B4fci2Jas4sh6S6") ? (
                  <a
                    href={data.branchOfficeMapUrl || "https://maps.app.goo.gl/U6B4fci2Jas4sh6S6"}
                    target={data.branchOfficeNewTab ?? true ? "_blank" : "_self"}
                    rel={data.branchOfficeNewTab ?? true ? "noopener noreferrer" : undefined}
                    className="leading-relaxed block hover:text-emerald-800 transition-colors no-underline text-inherit"
                    dangerouslySetInnerHTML={{ __html: (data.branchOffice || "22 Ontario St S,\nMilton, ON L9T 2M6, Canada").replace(/\n/g, '<br />') }}
                  />
                ) : (
                  <div
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: (data.branchOffice || "22 Ontario St S,\nMilton, ON L9T 2M6, Canada").replace(/\n/g, '<br />') }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-100 relative">
            {status && (
              <p className="text-center text-emerald-800 font-semibold mb-6 text-sm">{status}</p>
            )}
            <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    id="fullName"
                    placeholder="Full Name *"
                    value={form.fullName}
                    onChange={(e) => {
                      setForm({ ...form, fullName: e.target.value });
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                    className={`w-full border !border-line p-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium ${errors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                      }`}
                  />
                  {errors.fullName && <span className="text-red-600 text-xs font-semibold mt-1 block">{errors.fullName}</span>}
                </div>

                <div className="relative">
                  <input
                    type="email"
                    id="emailAddress"
                    placeholder="Email Address *"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className={`w-full border border-line p-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium ${errors.email ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                      }`}
                  />
                  {errors.email && <span className="text-red-600 text-xs font-semibold mt-1 block">{errors.email}</span>}
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    id="phoneNumber"
                    placeholder="Phone Number"
                    maxLength={11}
                    value={form.phone}
                    onChange={(e) => {
                      let val = e.target.value;
                      const startsWithPlus = val.startsWith("+");
                      const digits = val.replace(/[^0-9]/g, "");
                      val = (startsWithPlus ? "+" : "") + digits;
                      if (val.length > 11) val = val.slice(0, 11);
                      setForm({ ...form, phone: val });
                    }}
                    className="w-full border border-line p-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium focus:border-emerald-800"
                  />
                </div>

                <div className="relative">
                  <select
                    id="packageType"
                    aria-label="Select package type"
                    aria-invalid={Boolean(errors.packageType)}
                    aria-describedby={errors.packageType ? "packageType-error" : undefined}
                    value={form.packageType}
                    onChange={(e) => {
                      setForm({ ...form, packageType: e.target.value });
                      if (errors.packageType) setErrors((prev) => ({ ...prev, packageType: "" }));
                    }}
                    className={`cursor-pointer w-full border border-line p-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${form.packageType ? "text-[#111111]" : "text-slate-400"
                      } ${errors.packageType ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"}`}
                  >
                    <option value="" disabled hidden>Select Package *</option>
                    <option value="Umrah Package" className="text-[#111111]">Umrah Package</option>
                    <option value="Hajj Package" className="text-[#111111]">Hajj Package</option>
                    <option value="Flight Only" className="text-[#111111]">Flight Only</option>
                    <option value="Saudi Visa" className="text-[#111111]">Saudi Visa</option>
                    <option value="Other" className="text-[#111111]">Other</option>
                  </select>
                  {errors.packageType && <span id="packageType-error" className="text-red-600 text-xs font-semibold mt-1 block">{errors.packageType}</span>}
                </div>
              </div>

              <div className="relative mt-2">
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Message *"
                  value={form.message}
                  onChange={(e) => {
                    setForm({ ...form, message: e.target.value });
                    if (errors.message) {
                      setErrors((prev) => ({ ...prev, message: "" }));
                    }
                  }}
                  className={`w-full border border-line p-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium ${errors.message ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                    }`}
                />
                {errors.message && <span className="text-red-600 text-xs font-semibold mt-1 block">{errors.message}</span>}
              </div>

              <div>
                <button
                  type="submit"
                  className="group w-full bg-gold hover:bg-gold-lt text-ink font-bold py-4 px-8 rounded-md shadow-md hover:shadow-md active:scale-[0.99] transition-all duration-200 tracking-wider uppercase text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>SEND ENQUIRY</span>
                  <i className="fa-solid fa-paper-plane text-xs group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <SubmissionSuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
        referenceNumber={modalRef}
      />
    </section>
  );
}
