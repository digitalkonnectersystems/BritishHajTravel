'use client';

import { useId, useState, type FormEvent } from 'react';
import { submitFlightEnquirySectionAction } from '@/lib/publicEnquiryClient';
import { normalizeUkPhoneInput } from '@/lib/ukPhone';
import { ChevronDown } from 'lucide-react';

type SectionData = { title?: string; buttonText?: string; flightOptions?: string; maxWidth?: string };
const DEFAULT_OPTIONS = ['Return Flight', 'One Way', 'Flexible'];

export default function FlightEnquirySection({ data = {}, sourcePage }: { data?: SectionData; sourcePage: string }) {
  const id = useId();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '+44', departureDate: '', returnDate: '', flightOption: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const options = [...new Set((data.flightOptions || DEFAULT_OPTIONS.join('\n')).split(/[,\n]/).map(x => x.trim()).filter(Boolean))].slice(0, 30);
  const inputClass = 'mt-2 block h-12 w-full min-w-0 rounded-sm border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-ink outline-none transition focus:border-red focus-visible:ring-2 focus-visible:ring-red/20';
  const labelClass = 'block min-w-0 text-xs md:text-[13px] font-extrabold uppercase tracking-wide text-[#121212]';
  const setField = (key: keyof typeof form, value: string) => setForm(p => ({ ...p, [key]: key === 'phone' ? normalizeUkPhoneInput(value) : value }));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setError(''); setSuccess('');
    if (form.returnDate < form.departureDate) { setError('Return date must be on or after the traveling date.'); return; }
    setSending(true);
    try {
      const result = await submitFlightEnquirySectionAction({ ...form, sourcePage });
      if (!result.success) setError(result.error || 'Unable to submit your flight enquiry.');
      else {
        setSuccess('emailWarning' in result && result.emailWarning ? 'Your flight enquiry was saved. Email delivery may be delayed.' : 'Your flight enquiry has been received.');
        setForm({ fullName: '', email: '', phone: '+44', departureDate: '', returnDate: '', flightOption: '' });
      }
    } catch { setError('Unable to submit your flight enquiry. Please try again.'); }
    finally { setSending(false); }
  }

  return <section aria-labelledby={`${id}-title`} className="max-w-[1400px] mx-auto w-full bg-white px-4 pt-6 md:pt-10">
    <div className="max-w-[1140px] mx-auto" style={{ maxWidth: /^\d{3,4}px$/.test(data.maxWidth || '') ? data.maxWidth : '1140px' }}>
      <h2 id={`${id}-title`} className="mb-4 text-center font-serif text-primary text-[clamp(1.5rem,2.2vw,2.25rem)] leading-[0.98]">{data.title?.trim() || 'Flight Enquiry'}</h2>
      <div className="rounded-2xl border border-[#d0d0d0] bg-white p-5 md:p-7 shadow-[0_2px_8px_rgba(0,0,0,.18)]">
      <form onSubmit={submit} className="space-y-4" autoComplete="on">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <label htmlFor={`${id}-name`} className={labelClass}>Name <span className="text-red-500">*</span>
          <input id={`${id}-name`} className={inputClass} type="text" autoComplete="name" required maxLength={255} placeholder="Name" value={form.fullName} onChange={e => setField('fullName', e.target.value)} />
        </label>
        <label htmlFor={`${id}-email`} className={labelClass}>Email <span className="text-red-500">*</span>
          <input id={`${id}-email`} className={inputClass} type="email" autoComplete="email" required maxLength={254} placeholder="Email" value={form.email} onChange={e => setField('email', e.target.value)} />
        </label>
        <label htmlFor={`${id}-phone`} className={labelClass}>Phone <span className="text-red-500">*</span>
          <input id={`${id}-phone`} className={inputClass} type="tel" autoComplete="tel" required maxLength={13} pattern="\+44[0-9]{10}" placeholder="+447XXXXXXXXX" value={form.phone} onChange={e => setField('phone', e.target.value)} />
        </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <label htmlFor={`${id}-departure`} className={labelClass}>Traveling Date <span className="text-red-500">*</span>
          <input id={`${id}-departure`} className={inputClass} type="date" required min={today} value={form.departureDate} onChange={e => setField('departureDate', e.target.value)} />
        </label>
        <label htmlFor={`${id}-return`} className={labelClass}>Return Date <span className="text-red-500">*</span>
          <input id={`${id}-return`} className={inputClass} type="date" required min={form.departureDate || today} value={form.returnDate} onChange={e => setField('returnDate', e.target.value)} />
        </label>
        <label htmlFor={`${id}-option`} className={labelClass}>Flight Option
          <div className="relative">
          <select id={`${id}-option`} className={`${inputClass} cursor-pointer appearance-none pr-10`} value={form.flightOption} onChange={e => setField('flightOption', e.target.value)}>
            <option value="">Select flight option</option>
            {options.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />
          </div>
        </label>
        <div className="self-end">
          <button type="submit" disabled={sending} className="inline-flex h-12 w-full items-center justify-center rounded-md bg-red px-6 text-center text-sm font-extrabold uppercase tracking-[0.1em] text-white transition hover:bg-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red disabled:opacity-50">{sending ? 'Submitting...' : (data.buttonText?.trim() || 'Submit')}</button>
        </div>
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {success && <p role="status" className="text-sm text-green-800">{success}</p>}
      </form>
      </div>
    </div>
  </section>;
}
