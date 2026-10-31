'use client';

import { useId, useState, type FormEvent } from 'react';
import { submitFlightEnquirySectionAction } from '@/actions/enquiryActions';
import { normalizeUkPhoneInput } from '@/lib/ukPhone';

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
  const inputClass = 'mt-3 block h-[55px] w-full min-w-0 rounded-[3px] border border-[#bcbcbc] bg-white px-4 text-[16px] text-[#282828] outline-none focus:border-[#071447] focus:ring-1 focus:ring-[#071447]';
  const labelClass = 'block min-w-0 text-[16px] font-bold text-[#151515]';
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

  return <section aria-labelledby={`${id}-title`} className="w-full bg-white px-3 py-6 sm:px-4 sm:py-8 min-[1025px]:py-12">
    <div className="mx-auto w-full min-w-0 rounded-[16px] border border-[#c5c5c5] bg-white p-4 sm:rounded-[22px] sm:p-5 min-[1025px]:rounded-[25px] min-[1025px]:p-8" style={{ maxWidth: /^\d{3,4}px$/.test(data.maxWidth || '') ? data.maxWidth : '1440px' }}>
      <h2 id={`${id}-title`} className="mb-8 text-center text-[27px] font-bold leading-tight text-[#ff0808] md:mb-12 md:text-[33px]">{data.title?.trim() || 'Flight Enquiry'}</h2>
      <form onSubmit={submit} className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 min-[1025px]:grid-cols-3" autoComplete="on">
        <label htmlFor={`${id}-name`} className={labelClass}>Name <span className="text-red-500">*</span>
          <input id={`${id}-name`} className={inputClass} type="text" autoComplete="name" required maxLength={255} placeholder="Name" value={form.fullName} onChange={e => setField('fullName', e.target.value)} />
        </label>
        <label htmlFor={`${id}-email`} className={labelClass}>Email <span className="text-red-500">*</span>
          <input id={`${id}-email`} className={inputClass} type="email" autoComplete="email" required maxLength={254} placeholder="Email" value={form.email} onChange={e => setField('email', e.target.value)} />
        </label>
        <label htmlFor={`${id}-phone`} className={labelClass}>Phone <span className="text-red-500">*</span>
          <input id={`${id}-phone`} className={inputClass} type="tel" autoComplete="tel" required maxLength={13} pattern="\+44[0-9]{10}" placeholder="+447XXXXXXXXX" value={form.phone} onChange={e => setField('phone', e.target.value)} />
        </label>
        <label htmlFor={`${id}-departure`} className={labelClass}>Traveling Date <span className="text-red-500">*</span>
          <input id={`${id}-departure`} className={inputClass} type="date" required min={today} value={form.departureDate} onChange={e => setField('departureDate', e.target.value)} />
        </label>
        <label htmlFor={`${id}-return`} className={labelClass}>Return Date <span className="text-red-500">*</span>
          <input id={`${id}-return`} className={inputClass} type="date" required min={form.departureDate || today} value={form.returnDate} onChange={e => setField('returnDate', e.target.value)} />
        </label>
        <label htmlFor={`${id}-option`} className={labelClass}>Flight Option
          <select id={`${id}-option`} className={inputClass} value={form.flightOption} onChange={e => setField('flightOption', e.target.value)}>
            <option value="">Select flight option</option>
            {options.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <button type="submit" disabled={sending} className="min-h-[55px] w-full rounded-[3px] bg-[#071447] px-5 text-[19px] font-medium text-white transition-colors hover:bg-[#172a69] disabled:opacity-60 md:col-span-2 min-[1025px]:col-span-3">{sending ? 'Submitting...' : (data.buttonText?.trim() || 'Submit')}</button>
        {error && <p role="alert" className="text-sm text-red-700 md:col-span-2 min-[1025px]:col-span-3">{error}</p>}
        {success && <p role="status" className="text-sm text-green-800 md:col-span-2 min-[1025px]:col-span-3">{success}</p>}
      </form>
    </div>
  </section>;
}
