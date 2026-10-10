"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronDown, Mail, MapPin, ShieldCheck } from 'lucide-react';
import UpcomingUmrahPackages from '@/components/UpcomingUmrahPackages';
import RelatedUmrahPackages from '@/components/seasonal/RelatedUmrahPackages';
import { submitPackageBookingEnquiryAction } from '@/actions/enquiryActions';
import type { SeasonalUmrahPageData } from '@/lib/seasonalUmrah';
import styles from './seasonalUmrah.module.css';

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
  const [phone, setPhone] = useState('');
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
          : `Thank you. Enquiry ${result.bookingNumber || ''} was received. Our team will contact you.`);
      } else setStatus(result.error || 'Unable to send your enquiry. Please try again.');
    } catch { setStatus('Unable to send your enquiry. Please try again.'); }
    finally { setBusy(false); }
  }

  const first = data.packages[0];
  return <main className={styles.main}>
    <section className={styles.banner} style={{ backgroundImage: `linear-gradient(93deg, rgba(2,14,67,.96) 10%, rgba(2,14,67,.85) 57%, rgba(2,14,67,.45) 100%),url('${data.bannerImage}')` }}>
      <div className={styles.bannerLayout}>
        <div className={styles.bannerInner}>
          <p className={styles.eyebrow}>BRITISH HAJ TRAVEL · UMRAH PACKAGES</p>
          <h1>{data.title}</h1>
          <p>{data.intro}</p>
          <div className={styles.bannerCtas}>
            <Link href="/umrah-packages/" className={styles.redButton}>EXPLORE PACKAGES <ArrowRight size={16}/></Link>
          </div>
        </div>
        <aside id="booking-form" ref={formRef} className={styles.formAside}>
          <section className={styles.formCard}>
            <h2>Booking Enquiry</h2>
            <p>Ask about future availability.</p>
            <form onSubmit={submit}>
              <label>Your Name *<input autoComplete="name" value={fullName} maxLength={255} required onChange={e=>setFullName(e.target.value)} placeholder="Full name"/></label>
              <label>Your Email *<input autoComplete="email" type="email" value={email} maxLength={254} required onChange={e=>setEmail(e.target.value)} placeholder="Email address"/></label>
              <label>Phone *<input autoComplete="tel" type="tel" value={phone} maxLength={50} required onChange={e=>setPhone(e.target.value)} placeholder="Phone number"/></label>
              <label>Subject<input value={subject} maxLength={200} onChange={e=>setSubject(e.target.value)} placeholder="Optional"/></label>
              <label className={styles.fullSpan}>Package Name *<span className={styles.selectWrap}><select required value={packageSlug} onChange={e=>{setPackageSlug(e.target.value); setStatus('');}} disabled={selectablePackages.length===0}><option value="" disabled>{selectablePackages.length ? 'Select an Umrah package' : 'No Umrah packages currently available'}</option>{selectablePackages.map(p=><option key={p.id} value={p.slug}>{p.title}</option>)}</select><ChevronDown size={15}/></span></label>
              <label className={styles.fullSpan}>Your Message<textarea value={message} onChange={e=>setMessage(e.target.value)} rows={2} maxLength={3000} placeholder="Preferred dates or questions (optional)"/></label>
              <button type="submit" disabled={busy || selectablePackages.length === 0} className={`${styles.submit} ${styles.fullSpan}`}>{busy ? 'SENDING...' : 'SEND ENQUIRY'} <ArrowRight size={16}/></button>
              {status && <p role="status" aria-live="polite" className={`${success?styles.success:styles.error} ${styles.fullSpan}`}>{success?<CheckCircle2 size={18}/>:null}{status}</p>}
              <p className={`${styles.formFinePrint} ${styles.fullSpan}`}>Enquiries are not confirmed bookings.</p>
            </form>
          </section>
        </aside>
      </div>
    </section>

    <section className={styles.notice} aria-label="Historical departure notice">
      <ShieldCheck size={20} aria-hidden="true" />
      <p><strong>2026 departure archive:</strong> These travel dates have passed. Check the original details and ask our team about future departures.</p>
    </section>

    <section id="packages" className={styles.seasonalCards} aria-label="Historic Umrah packages">
      {packages.length > 0 ? (
        <UpcomingUmrahPackages
          data={{ eyebrow: 'HISTORIC DEPARTURES', title: data.title, description: 'Review these previously offered itineraries. Prices and future availability are to be confirmed.' }}
          initialPackages={packages}
          onBookNow={selectPackage}
          hideFooterLink
        />
      ) : (
        <div className={styles.noPackages}>
          <h2>Package records are not configured yet</h2>
          <p>The page requires the supplied database migration to create the historic packages and their database-driven detail pages.</p>
          <Link href="/umrah-packages/" className={styles.redButton}>VIEW UMRAH PACKAGES <ArrowRight size={16}/></Link>
        </div>
      )}
    </section>

    <section className={styles.hotelsSection}>
      <div className={styles.hotelsInner}>
        <div><p className={styles.kicker}>WHERE YOU STAY</p><h2>Hotels in Makkah & Madinah</h2><p>Explore hotel options and confirm availability, walking distance, facilities and room types before choosing your package.</p><Link href="/hotels/" className={styles.redButton}>VIEW ALL HOTELS <ArrowRight size={17}/></Link></div>
        <div className={styles.hotelReferences}>
          <div><MapPin size={25}/><span>MAKKAH</span><strong>{first.makkah}</strong><small>{first.makkahNights} · Bed & breakfast (BB) on original listing</small></div>
          <div><MapPin size={25}/><span>MADINAH</span><strong>{first.madinah}</strong><small>{first.madinahNights} · Bed & breakfast (BB) on original listing</small></div>
        </div>
      </div>
    </section>

    <RelatedUmrahPackages currentPath={data.slug} extraPages={novemberPackages}/>
    <section className={styles.contactStrip}><div><h2>Need help choosing an Umrah package?</h2><p>Our team can help you compare current hotels, dates and package options.</p></div><a href="#booking-form">SEND AN ENQUIRY <Mail size={16}/></a></section>
  </main>;
}
