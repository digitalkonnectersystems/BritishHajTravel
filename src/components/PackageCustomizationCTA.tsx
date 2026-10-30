'use client';
import { FORM_SUCCESS_MESSAGE } from '@/lib/formSuccess';

import { useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, Hotel, Plane, Settings2, X, Check } from 'lucide-react';
import { submitCustomizedPackageAction, type CustomizedEnquiryInput } from '@/actions/customizedPackageActions';
import { normalizeUkPhoneInput, UK_PHONE_PREFIX, UK_PHONE_MAX_LENGTH, isValidUkPhone } from '@/lib/ukPhone';

const serviceOptions = ['Saudi Visa / Umrah Visa', 'Ziyarat Tours', 'Daily Meals / Catering', 'Tour Guide / Scholar', 'Wheelchair Assistance', 'Haram View Room', 'Haramain High-Speed Train', 'VIP / Private Transport', 'Ihram Kits', 'Flight Tickets'];
const requirementOptions = ['Senior Citizen Care', 'Family & Child Friendly', 'Close to Haram (<500m)', 'Ground Floor / Lift Access', 'Flexible Travel Dates', 'Urgent Booking', 'Budget Friendly', '5-Star Luxury VIP'];
const initialForm = (category: 'hajj' | 'umrah'): CustomizedEnquiryInput => ({
  category, fullName: '', email: '', phone: UK_PHONE_PREFIX, departureAirport: '', departureDate: '',
  numberOfDays: 14, adults: 1, children: 0, infants: 0, airlinePreference: '',
  makkahHotel: '', madinahHotel: '', hotelStandard: '', roomOccupancy: '', transportation: '',
  budgetGbp: '', notes: '', services: [], requirements: [],
});

export default function PackageCustomizationCTA({ journey }: { journey: 'hajj' | 'umrah' }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CustomizedEnquiryInput>(() => initialForm(journey));
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');
  const [saved, setSaved] = useState(false);
  const name = journey === 'hajj' ? 'Hajj' : 'Umrah';
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !sending) setOpen(false); };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = original; document.removeEventListener('keydown', keydown); };
  }, [open, sending]);
  const update = (key: keyof CustomizedEnquiryInput, val: string | number) => {
    setResult(''); setForm(prev => ({ ...prev, [key]: val }));
  };
  const toggle = (key: 'services' | 'requirements', value: string) => setForm(prev => ({
    ...prev, [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
  }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    if (!isValidUkPhone(form.phone)) { setResult('Enter a UK phone number in +44xxxxxxxxxx format.'); return; }
    setSending(true); setResult('');
    try {
      const response = await submitCustomizedPackageAction(form);
      if (response.success) { setSaved(true); setResult(`${FORM_SUCCESS_MESSAGE} Reference: ${response.enquiryNumber}${response.emailWarning ? ` Email notice: ${response.emailWarning}` : ""}`); }
      else setResult(response.error || 'Enquiry could not be submitted.');
    } catch { setResult('Connection error. Please try again.'); }
    finally { setSending(false); }
  };
  const inputClass = 'block w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100';
  return <section className="bg-blue-lt px-4 py-12" aria-label={`Customized ${name} Package`}>
    <div className="mx-auto flex max-w-[1240px] flex-col gap-6 rounded-2xl bg-primary p-6 text-white shadow-sm md:flex-row md:items-center md:justify-between md:p-10">
      <div className="flex-1">
        <div className="flex items-center gap-3"><span className="rounded-full bg-red-50 p-3 text-red-600"><Settings2 size={23} /></span><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-red-600">Design your journey</p><h2 className="font-serif text-2xl font-bold md:text-3xl">Need a Customized {name} Package?</h2></div></div>
        <p className="mt-3 max-w-3xl text-sm leading-6">Choose the number of days, flights, Makkah and Madinah hotels, transportation and additional services. We will arrange a personalized {name} itinerary around your requirements.</p>
        <div className="mt-6 flex flex-wrap gap-5 text-xs font-semibold"><span className="flex items-center gap-2"><CalendarDays size={17} className="text-red-600" />Choose your duration</span><span className="flex items-center gap-2"><Hotel size={17} className="text-red-600" />Select hotels</span><span className="flex items-center gap-2"><Plane size={17} className="text-red-600" />Add flights & transport</span></div>
      </div>
      <div className="flex flex-col items-center gap-3"><span className="rounded-full bg-amber-50 px-4 py-1 text-xs font-bold uppercase text-amber-800">{name} only</span><button type="button" onClick={() => { setForm(initialForm(journey)); setSaved(false); setResult(''); setOpen(true); }} className="rounded-xl bg-red-600 px-7 py-3.5 text-sm font-bold text-white hover:bg-red-500">Customize Your Package →</button></div>
    </div>
    {open && <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6" onMouseDown={e => { if (e.target === e.currentTarget && !sending) setOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-label={`Customized ${name} Package Form`} className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-7"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-700">Design your journey</p><h2 className="font-serif text-2xl font-bold">Customized {name} Package Form</h2><p className="mt-1 text-sm text-slate-500">Choose your preferred flights, hotels and transportation. Your details are saved as an enquiry, not a confirmed booking.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close customized package form" className="rounded-full bg-red-600 p-2 text-white"><X size={18} /></button></div>
        <div className="overflow-y-auto px-5 pb-6 sm:px-7">
          {saved ? <div role="status" className="flex gap-2 rounded-xl bg-emerald-50 p-6 font-semibold text-emerald-800"><Check className="mb-2" />{result}</div> : <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {([['fullName', 'Full Name (as per passport)', 'text', true], ['email', 'Email Address', 'email', true], ['phone', 'Phone / WhatsApp', 'tel', true], ['departureAirport', 'Departure City / Airport', 'text', true], ['departureDate', 'Preferred Departure Date', 'date', false], ['numberOfDays', 'Number of Days', 'number', true], ['adults', 'Adults', 'number', true], ['children', 'Children', 'number', false], ['infants', 'Infants', 'number', false], ['airlinePreference', 'Preferred Airline / Flight', 'text', false], ['makkahHotel', 'Makkah Hotel / Location', 'text', false], ['madinahHotel', 'Madinah Hotel / Location', 'text', false]] as const).map(([key, label, type, required]) => <label key={key} className="block text-xs font-bold">{label} {required && <span className="text-red-600">*</span>}<input className={`${inputClass} mt-1.5`} type={type} required={required} min={type === 'number' ? (key === 'adults' || key === 'numberOfDays' ? 1 : 0) : undefined} max={type === 'number' ? (key === 'numberOfDays' ? 90 : 99) : undefined} maxLength={type === 'tel' ? UK_PHONE_MAX_LENGTH : 255} pattern={type === 'tel' ? '\\+44[0-9]{10}' : undefined} value={String(form[key])} onChange={e => update(key, type === 'number' ? Number(e.target.value) : type === 'tel' ? normalizeUkPhoneInput(e.target.value) : e.target.value)} /></label>)}
            {([['hotelStandard', 'Hotel Standard', ['3 Star', '4 Star', '5 Star', 'Luxury']], ['roomOccupancy', 'Room Occupancy', ['Single', 'Double', 'Triple', 'Quad', 'Family']], ['transportation', 'Transportation', ['Shared Bus', 'Private Car', 'VIP Transfer', 'Train']]] as const).map(([key, label, options]) => <label key={key} className="block text-xs font-bold">{label}<select className={`${inputClass} mt-1.5`} value={String(form[key] || '')} onChange={e => update(key, e.target.value)}><option value="">Select {label.toLowerCase()}</option>{options.map(opt => <option key={opt}>{opt}</option>)}</select></label>)}
            {([['services', 'Other Services Needed', serviceOptions], ['requirements', 'Any Other Requirements', requirementOptions]] as const).map(([key, label, options]) => <fieldset key={key} className="sm:col-span-2"><legend className="text-xs font-bold">{label}</legend><div className="mt-2 flex flex-wrap gap-2">{options.map(opt => <button key={opt} type="button" aria-pressed={form[key].includes(opt)} onClick={() => toggle(key, opt)} className={`rounded-full border px-3 py-1.5 text-xs ${form[key].includes(opt) ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>{form[key].includes(opt) ? '✓' : '+'} {opt}</button>)}</div></fieldset>)}
            <label className="block text-xs font-bold">Approximate Budget (GBP)<input className={`${inputClass} mt-1.5`} type="number" min="1" step="0.01" value={form.budgetGbp || ''} onChange={e => update('budgetGbp', e.target.value)} placeholder="Total budget in £" /></label>
            <label className="block text-xs font-bold sm:col-span-2">Additional Notes<textarea className={`${inputClass} mt-1.5`} maxLength={4000} rows={3} value={form.notes || ''} onChange={e => update('notes', e.target.value)} /></label>
            {result && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{result}</p>}
            <button className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-emerald-950 disabled:opacity-60 sm:col-span-2" disabled={sending} type="submit">{sending ? 'Submitting...' : `Send Customized ${name} Enquiry`}</button>
          </form>}
        </div>
      </div>
    </div>}
  </section>;
}
