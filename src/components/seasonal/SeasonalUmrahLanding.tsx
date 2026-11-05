'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronDown, Mail, MapPin, ShieldCheck } from 'lucide-react';
import UpcomingUmrahPackages from '@/components/UpcomingUmrahPackages';
import RelatedUmrahPackages from '@/components/seasonal/RelatedUmrahPackages';
import { FORM_SUCCESS_MESSAGE } from '@/lib/formSuccess';
import { normalizeUkPhoneInput } from '@/lib/ukPhone';
import { submitPackageBookingEnquiryAction } from '@/lib/publicEnquiryClient';
import type { SeasonalUmrahPageData } from '@/lib/seasonalUmrah';

const sectionTitleClass = 'font-serif text-primary text-[clamp(1.5rem,2.2vw,2.25rem)] leading-[0.98]';
const ctaClass = 'inline-flex min-h-[46px] items-center justify-center gap-2 rounded-md border border-red bg-red px-5 py-3 text-xs font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ed1b24] hover:border-[#ed1b24] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red';
const labelClass = 'grid min-w-0 gap-1 text-[11px] font-bold text-white';
const inputClass = 'min-h-[37px] w-full rounded border border-[#c8d1e0] bg-white px-3 py-2 text-xs font-medium text-[#142345] placeholder:text-slate-400 focus:border-red focus:outline-none focus:ring-2 focus:ring-red/20';

/** Archive page: the three historic offers are database rows, NOT fabricated prices. */
export default function SeasonalUmrahLanding({
  data,
  packages,
  availablePackages,
  novemberPackages = [],
}: {
  data: SeasonalUmrahPageData;
  packages: any[];
  availablePackages: any[];
  novemberPackages?: { label: string; href: string }[];
}) {
  // Keep the historic display cards separate from the live, selectable Umrah packages.
  // The public package query excludes sold_out and draft; retain that safeguard here.
  const selectablePackages = availablePackages.filter(
    (pkg) => pkg.type === 'umrah' && pkg.status !== 'sold_out' && pkg.status !== 'draft'
  );
  const [packageSlug, setPackageSlug] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+44');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLElement>(null);

  function selectPackage(pkg: any) {
    // Sold-out archive cards are never added to the booking dropdown.
    const isSelectable = selectablePackages.some((item) => item.slug === pkg?.slug);
    setPackageSlug(isSelectable ? pkg.slug : '');
    setStatus(isSelectable ? '' : 'Choose a currently available Umrah package from the list.');
    setSuccess(false);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  useEffect(() => {
    if (!success) return;
    const timeout = setTimeout(() => setSuccess(false), 120000);
    return () => clearTimeout(timeout);
  }, [success]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const chosen = selectablePackages.find((p) => p.slug === packageSlug);
    if (!chosen) { setStatus('Select a package.'); return; }
    setBusy(true); setStatus(''); setSuccess(false);
    try {
      const result = await submitPackageBookingEnquiryAction({
        packageId: chosen.id,
        packageName: chosen.title,
        packageType: 'umrah',
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: [
          subject.trim() ? `Subject: ${subject.trim()}` : '',
          `Page: ${data.title}. Selected Umrah package: ${chosen.title}. This is an enquiry, not a confirmed booking.`,
          message.trim(),
        ].filter(Boolean).join('\n\n'),
        sourceFormName: 'Umrah Package Booking Form',
      });
      if (result.success) {
        setSuccess(true); setMessage(''); setSubject('');
        setStatus(result.emailWarning
          ? `Enquiry ${result.bookingNumber || ''} was saved, but email delivery could not be confirmed.`
          : `${FORM_SUCCESS_MESSAGE} Reference: ${result.bookingNumber || ''}`);
      } else setStatus(result.error || 'Unable to send your enquiry. Please try again.');
    } catch { setStatus('Unable to send your enquiry. Please try again.'); }
    finally { setBusy(false); }
  }

  const first = data.packages[0];

  return (
    <main className="bg-white text-primary">
      <section
        className="flex min-h-[345px] items-center bg-cover bg-center text-white"
        style={{ backgroundImage: `linear-gradient(93deg, rgba(2,14,67,.96) 10%, rgba(2,14,67,.85) 57%, rgba(2,14,67,.45) 100%),url('${data.bannerImage}')` }}
      >
        <div className="mx-auto grid w-full max-w-[1400px] items-center gap-8 px-4 py-10 sm:px-6 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(380px,455px)] lg:gap-9">
          <div className="min-w-0 py-4 md:py-7">
            <p className="eyebrow !text-[#ff5b62]">BRITISH HAJ TRAVEL · UMRAH PACKAGES</p>
            <h1 className="font-serif text-white text-[clamp(1.5rem,2.2vw,2.25rem)] leading-[0.98]">{data.title}</h1>
            <p className="mt-5 max-w-[710px] text-sm leading-[1.8] text-[#e5eaf9] sm:text-base">{data.intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/umrah-packages/" className={ctaClass}>EXPLORE PACKAGES <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>

          <aside id="booking-form" ref={formRef} className="w-full max-w-[520px] scroll-mt-[100px] justify-self-center lg:max-w-none">
            <section className="overflow-hidden rounded-xl bg-[#252c89] text-white shadow-[0_10px_45px_rgba(0,0,0,0.19)]">
              <h2 className="bg-[#ed1b24] px-5 py-3.5 font-serif text-xl leading-tight text-white">Booking Enquiry</h2>
              <p className="px-5 pt-2 text-[11px] leading-[1.4] text-[#e5e8ff]">Ask about future availability.</p>
              <form onSubmit={submit} className="grid grid-cols-1 gap-x-2.5 gap-y-2.5 px-[18px] pb-4 pt-3 min-[440px]:grid-cols-2">
                <label className={labelClass}>Your Name *
                  <input className={inputClass} autoComplete="name" value={fullName} maxLength={255} required onChange={e => setFullName(e.target.value)} placeholder="Full name" />
                </label>
                <label className={labelClass}>Your Email *
                  <input className={inputClass} autoComplete="email" type="email" value={email} maxLength={254} required onChange={e => setEmail(e.target.value)} placeholder="Email address" />
                </label>
                <label className={labelClass}>Phone *
                  <input className={inputClass} autoComplete="tel" type="tel" value={phone} maxLength={13} required onChange={e => setPhone(normalizeUkPhoneInput(e.target.value))} pattern="\+44[0-9]{10}" placeholder="+44xxxxxxxxxx" />
                </label>
                <label className={labelClass}>Subject
                  <input className={inputClass} value={subject} maxLength={200} onChange={e => setSubject(e.target.value)} placeholder="Optional" />
                </label>
                <label className={`${labelClass} min-[440px]:col-span-2`}>Package Name *
                  <span className="relative block">
                    <select className={`${inputClass} appearance-none pr-9`} required value={packageSlug} onChange={e => { setPackageSlug(e.target.value); setStatus(''); }} disabled={selectablePackages.length === 0}>
                      <option value="" disabled>{selectablePackages.length ? 'Select an Umrah package' : 'No Umrah packages currently available'}</option>
                      {selectablePackages.map(p => <option key={p.id} value={p.slug}>{p.title}</option>)}
                    </select>
                    <ChevronDown size={15} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary" />
                  </span>
                </label>
                <label className={`${labelClass} min-[440px]:col-span-2`}>Your Message
                  <textarea className={`${inputClass} min-h-[58px] max-h-[130px] resize-y`} value={message} onChange={e => setMessage(e.target.value)} rows={2} maxLength={3000} placeholder="Preferred dates or questions (optional)" />
                </label>
                <button type="submit" disabled={busy || selectablePackages.length === 0} className="flex min-h-[39px] items-center justify-center gap-2 bg-[#ed1b24] p-2.5 text-xs font-extrabold text-white transition-colors hover:bg-red disabled:cursor-not-allowed disabled:opacity-60 min-[440px]:col-span-2">
                  {busy ? 'Submitting...' : 'SEND ENQUIRY'} <ArrowRight size={16} aria-hidden="true" />
                </button>
                {status && (
                  <p role="status" aria-live="polite" className={`flex items-start gap-2 rounded p-2.5 text-xs leading-normal min-[440px]:col-span-2 ${success ? 'bg-green-100 text-green-900' : 'bg-[#fff3f2] text-[#871515]'}`}>
                    {success ? <CheckCircle2 size={18} aria-hidden="true" className="shrink-0" /> : null}{status}
                  </p>
                )}
                <p className="text-[10px]! leading-[1.4] text-[#d9dcf7] min-[440px]:col-span-2">Enquiries are not confirmed bookings.</p>
              </form>
            </section>
          </aside>
        </div>
      </section>

      <section className="mx-4 mt-7 flex max-w-[1220px] items-start gap-3 rounded-lg border-l-4 border-red bg-[#fff6f5] p-4 text-[13px] leading-[1.65] text-[#373f55] sm:mx-6 sm:px-5 xl:mx-auto" aria-label="Historical departure notice">
        <ShieldCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-red" />
        <p><strong>2026 departure archive:</strong> These travel dates have passed. Check the original details and ask our team about future departures.</p>
      </section>

      <section id="packages" className="scroll-mt-[95px]" aria-label="Historic Umrah packages">
        {packages.length > 0 ? (
          <UpcomingUmrahPackages
            data={{ eyebrow: 'HISTORIC DEPARTURES', title: data.title, description: 'Review these previously offered itineraries. Prices and future availability are to be confirmed.' }}
            initialPackages={packages}
            onBookNow={selectPackage}
            hideFooterLink
          />
        ) : (
          <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-4 px-5 py-12 md:py-16">
            <p className="eyebrow">HISTORIC DEPARTURES</p>
            <h2 className={sectionTitleClass}>Package records are not configured yet</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">The page requires the supplied database migration to create the historic packages and their database-driven detail pages.</p>
            <Link href="/umrah-packages/" className={ctaClass}>VIEW UMRAH PACKAGES <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        )}
      </section>

      <section className="bg-blue-lt py-10 md:py-16">
        <div className="mx-auto grid max-w-[1400px] items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
          <div className="min-w-0">
            <p className="eyebrow">WHERE YOU STAY</p>
            <h2 className={sectionTitleClass}>Hotels in Makkah &amp; Madinah</h2>
            <p className="mb-6 mt-5 max-w-[470px] text-sm leading-[1.8] text-slate-600 sm:text-[15px]">Explore hotel options and confirm availability, walking distance, facilities and room types before choosing your package.</p>
            <Link href="/hotels/" className={ctaClass}>VIEW ALL HOTELS <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          {first && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <MapPin size={25} aria-hidden="true" className="text-red" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">MAKKAH</span>
                <strong className="font-serif text-lg leading-snug text-primary">{first.makkah}</strong>
                <small className="text-xs leading-relaxed text-slate-600">{first.makkahNights} · Bed &amp; breakfast (BB) on original listing</small>
              </div>
              <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <MapPin size={25} aria-hidden="true" className="text-red" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">MADINAH</span>
                <strong className="font-serif text-lg leading-snug text-primary">{first.madinah}</strong>
                <small className="text-xs leading-relaxed text-slate-600">{first.madinahNights} · Bed &amp; breakfast (BB) on original listing</small>
              </div>
            </div>
          )}
        </div>
      </section>

      <RelatedUmrahPackages currentPath={data.slug} extraPages={novemberPackages} />

      <section className="bg-primary py-8 text-white sm:py-10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-5 px-4 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-serif text-[clamp(1.5rem,2.2vw,2.25rem)] leading-[0.98] text-white">Need help choosing an Umrah package?</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#e3e9fb]">Our team can help you compare current hotels, dates and package options.</p>
          </div>
          <a href="#booking-form" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-red px-5 py-3.5 text-xs font-extrabold text-white transition-colors hover:bg-[#ed1b24]">SEND AN ENQUIRY <Mail size={16} aria-hidden="true" /></a>
        </div>
      </section>
    </main>
  );
}
