'use client';

import { useId, useState, type FormEvent } from 'react';
import { submitPlanYourOwnPackageSectionAction } from '@/actions/enquiryActions';
import { normalizeUkPhoneInput } from '@/lib/ukPhone';

type SectionData = { title?: string; buttonText?: string; dayOptions?: string; maxWidth?: string };
const DEFAULT_DAYS = ['7', '10', '14', '21', '28'];

export default function PlanYourOwnPackageSection({ data = {}, sourcePage }: { data?: SectionData; sourcePage: string }) {
  const instanceId = useId();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '+44', days: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const options = (data.dayOptions || DEFAULT_DAYS.join(', ')).split(/[,\n]/).map(x => x.trim().replace(/\s*days?$/i, '')).filter(x => /^\d{1,2}$/.test(x) && Number(x) >= 1 && Number(x) <= 90);
  const days = [...new Set(options.length ? options : DEFAULT_DAYS)];
  const title = data.title?.trim() || 'Plan your own Package';
  const buttonText = data.buttonText?.trim() || 'SEND';

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true); setError(''); setSuccess('');
    try {
      const response = await submitPlanYourOwnPackageSectionAction({ ...form, days: Number(form.days), sourcePage });
      if (!response.success) setError(response.error || 'Could not submit your request.');
      else {
        setSuccess('emailWarning' in response && response.emailWarning ? 'Your package request was saved. Email delivery may be delayed.' : 'Your package request has been received.');
        setForm({ fullName: '', email: '', phone: '+44', days: '' });
      }
    } catch {
      setError('Could not submit your request. Please try again.');
    } finally {
      setSending(false);
    }
  }

  const inputClass = 'mt-1.5 block w-full min-w-0 h-[48px] border border-[#ededed] bg-[#f5f5f5] px-4 text-[15px] text-slate-900 outline-none focus:border-[#e30000] focus:ring-1 focus:ring-[#e30000]';
  const labelClass = 'block min-w-0 text-[15px] font-normal text-[#343434]';
  return <section aria-labelledby={`${instanceId}-title`} className="w-full bg-white px-3 py-6 sm:px-4 sm:py-7 min-[1025px]:py-10">
    <div className="mx-auto w-full" style={{ maxWidth: /^\d{3,4}px$/.test(data.maxWidth || '') ? data.maxWidth : '1440px' }}>
      <h2 id={`${instanceId}-title`} className="mb-5 text-[28px] md:text-[38px] font-normal leading-tight text-[#333]">{title}</h2>
      <div className="border border-[#c7c7c7] bg-white p-3 sm:p-4 min-[1025px]:p-5 shadow-[0_1px_5px_rgba(0,0,0,0.12)]">
        <form onSubmit={submit} className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2 min-[1025px]:grid-cols-3" autoComplete="on">
          <label className={labelClass} htmlFor={`${instanceId}-name`}>Your Name <span className="text-red-600">*</span>
            <input id={`${instanceId}-name`} name="fullName" type="text" autoComplete="name" required maxLength={255} className={inputClass} value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} />
          </label>
          <label className={labelClass} htmlFor={`${instanceId}-email`}>Your Email <span className="text-red-600">*</span>
            <input id={`${instanceId}-email`} name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </label>
          <label className={labelClass} htmlFor={`${instanceId}-phone`}>Phone <span className="text-red-600">*</span>
            <input id={`${instanceId}-phone`} name="phone" type="tel" autoComplete="tel" required maxLength={13} pattern="\+44[0-9]{10}" className={inputClass} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: normalizeUkPhoneInput(e.target.value) }))} />
          </label>
          <label className={labelClass} htmlFor={`${instanceId}-days`}>Number of Days <span className="text-red-600">*</span>
            <select id={`${instanceId}-days`} name="days" required value={form.days} onChange={e => setForm(p => ({ ...p, days: e.target.value }))} className={`${inputClass} cursor-pointer`}>
              <option value="">-- Select Number of Days --</option>
              {days.map(day => <option key={day} value={day}>{day} Days</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={sending} className="h-[50px] w-full bg-[#ff0808] px-5 text-[17px] font-semibold text-white transition-colors hover:bg-[#cc0000] disabled:opacity-60">{sending ? 'SENDING...' : buttonText}</button>
          </div>
          <div aria-hidden="true" className="hidden md:block" />
          {error && <p role="alert" className="md:col-span-2 min-[1025px]:col-span-3 text-sm text-red-700">{error}</p>}
          {success && <p role="status" className="md:col-span-2 min-[1025px]:col-span-3 text-sm text-green-800">{success}</p>}
        </form>
      </div>
    </div>
  </section>;
}
