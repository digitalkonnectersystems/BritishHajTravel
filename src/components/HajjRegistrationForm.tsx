'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { getFormsSettings } from '@/actions/pageActions';
import { submitHajjRegistrationEnquiryAction } from '@/actions/enquiryActions';
import { normalizeUkPhoneInput } from '@/lib/ukPhone';
import { defaultBaanContent } from '@/lib/baanContent';

type FieldKey = 'name' | 'email' | 'phone' | 'postcode' | 'airport' | 'packageTier' | 'passengers' | 'days' | 'room' | 'budget';
type FieldConfig = { id: string; label: string; type: string; placeholder: string; required: boolean };
const defaultFields: Record<FieldKey, FieldConfig> = {
  name: { id: 'name', label: 'Name', type: 'text', placeholder: 'Name', required: true },
  email: { id: 'email', label: 'Email', type: 'email', placeholder: 'Email', required: true },
  phone: { id: 'phone', label: 'Phone', type: 'tel', placeholder: 'xxxx-xxxx xxx', required: true },
  postcode: { id: 'postcode', label: 'Postcode', type: 'text', placeholder: 'Postcode', required: true },
  airport: { id: 'airport', label: 'Airport', type: 'select', placeholder: 'London (LON)', required: true },
  packageTier: { id: 'packageTier', label: 'Hajj Package', type: 'select', placeholder: '5-Star', required: true },
  passengers: { id: 'passengers', label: 'Number of Passengers', type: 'number', placeholder: 'Number of Passengers', required: true },
  days: { id: 'days', label: 'Number of Days', type: 'select', placeholder: '12 Days Packages', required: true },
  room: { id: 'room', label: 'Room Size', type: 'select', placeholder: 'Double Room', required: true },
  budget: { id: 'budget', label: 'Budget per person', type: 'select', placeholder: '5K - 7K', required: true },
};
const choices: Partial<Record<FieldKey, string[]>> = {
  airport: defaultBaanContent.airportOptions,
  packageTier: defaultBaanContent.packageOptions,
  days: defaultBaanContent.durationOptions,
  room: defaultBaanContent.roomOptions,
  budget: defaultBaanContent.budgetOptions,
};
const fieldRows: FieldKey[][] = [
  ['name', 'email', 'phone'],
  ['postcode', 'airport', 'packageTier', 'passengers'],
  ['days', 'room', 'budget'],
];

export default function HajjRegistrationForm({sourcePage, branded = false}: { sourcePage: string; branded?: boolean }) {
  const [config, setConfig] = useState<Record<FieldKey, FieldConfig>>(defaultFields);
  const [enabled, setEnabled] = useState(true);
  const [buttonText, setButtonText] = useState('Submit');
  const [successText, setSuccessText] = useState('Your Hajj registration enquiry has been received.');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [values, setValues] = useState<Record<FieldKey, string>>({
    name: '', email: '', phone: '+44', postcode: '', airport: defaultBaanContent.airportOptions[0],
    packageTier: defaultBaanContent.packageOptions[0], passengers: '', days: defaultBaanContent.durationOptions[0],
    room: defaultBaanContent.roomOptions[0], budget: defaultBaanContent.budgetOptions[0],
  });

  useEffect(() => {
    let live = true;
    getFormsSettings().then(settings => {
      if (!live) return;
      const form = settings.formsData?.hajjRegistrationForm;
      if (form) {
        setEnabled(form.enabled !== false);
        if (typeof form.buttonText === 'string' && form.buttonText.trim()) setButtonText(form.buttonText);
        if (typeof form.successMessage === 'string' && form.successMessage.trim()) setSuccessText(form.successMessage);
      }
      const saved = settings.formFieldsState?.hajjRegistrationForm;
      if (Array.isArray(saved)) {
        setConfig(current => {
          const next = { ...current };
          for (const key of Object.keys(defaultFields) as FieldKey[]) {
            const configured = saved.find((field: any) => field?.id === key);
            if (!configured) continue;
            next[key] = {
              ...current[key],
              label: typeof configured.label === 'string' ? configured.label : current[key].label,
              placeholder: typeof configured.placeholder === 'string' ? configured.placeholder : current[key].placeholder,
              required: configured.required !== false,
            };
          }
          return next;
        });
      }
    }).catch(() => {});
    return () => { live = false; };
  }, []);

  if (!enabled) return null;

  const change = (key: FieldKey, value: string) => {
    setValues(prev => ({ ...prev, [key]: key === 'phone' ? normalizeUkPhoneInput(value) : value }));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      const result = await submitHajjRegistrationEnquiryAction({
        ...values,
        passengers: Number(values.passengers),
        sourcePage,
      });
      if (!result.success) {
        setError(result.error || 'Unable to submit your enquiry.');
      } else {
        setSuccess(result.emailWarning ? `${successText} Email delivery may be delayed.` : successText);
        setValues(old => ({ ...old, name: '', email: '', phone: '+44', postcode: '', passengers: '' }));
      }
    } catch {
      setError('Unable to submit your enquiry. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function field(key: FieldKey) {
    const f = config[key];
    const id = `hajj-registration-${sourcePage.replace(/\W/g, '-')}-${key}`;
    const standard = 'block w-full h-[44px] border border-[#c5c5c5] rounded-sm bg-white px-3 text-[15px] text-[#162348] focus:outline-none focus:ring-2 focus:ring-[#072366] focus:border-[#072366]';
    const opts = choices[key];
    return <div key={key} className="min-w-0">
      <label htmlFor={id} className="block text-[15px] leading-[21px] font-bold text-[#121212] mb-3">
        {f.label}{f.required && <span className="text-red-600"> *</span>}
      </label>
      {opts ? <select id={id} name={key} className={standard} value={values[key]} required={f.required} onChange={event => change(key, event.target.value)}>
        {opts.map(value => <option key={value} value={value}>{value}</option>)}
      </select> : <input id={id} name={key} className={standard} type={key === 'passengers' ? 'number' : key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
        autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : key === 'phone' ? 'tel' : key === 'postcode' ? 'postal-code' : undefined}
        placeholder={f.placeholder} required={f.required} value={values[key]} onChange={event => change(key, event.target.value)}
        maxLength={key === 'phone' ? 13 : key === 'postcode' ? 30 : key === 'name' ? 255 : undefined}
        min={key === 'passengers' ? 1 : undefined} max={key === 'passengers' ? 100 : undefined}
        pattern={key === 'phone' ? '\\+44[0-9]{10}' : undefined} />}
    </div>;
  }

  return <section aria-label="Hajj 2027 registration enquiry" className="bg-white w-full px-4 py-9 md:py-12">
    <div className="max-w-[1140px] mx-auto">
      {!branded && <h2 className="font-semibold text-center text-[#062a65] text-[28px] md:text-[32px] leading-tight mb-8">Register for Hajj 2027</h2>}
      <div className="bg-white border border-[#d0d0d0] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,.18)] p-5 md:p-7">
        {branded && <div className="text-center mb-6 flex flex-wrap items-center justify-center gap-2">
          <img src="https://britishhajtravel.com/wp-content/uploads/2019/02/bht-logo.png" alt="British Haj Travel Ltd" className="object-contain max-w-[160px] h-auto" />
          <span className="font-bold text-xl md:text-2xl text-[#ee1b2b]">Register for Hajj 2027</span>
        </div>}
        <form onSubmit={submit} className="space-y-3" autoComplete="on">
          {fieldRows.map((row, index) => <div key={index} className={`grid grid-cols-1 sm:grid-cols-2 ${row.length===4?'lg:grid-cols-4':'lg:grid-cols-3'} gap-x-5 gap-y-3`}>{row.map(field)}</div>)}
          <div className="pt-3"><button type="submit" disabled={busy} className="bg-[#030d48] text-white font-medium text-[15px] rounded-sm px-4 py-2.5 hover:bg-[#152b74] disabled:opacity-50">{busy ? 'Submitting...' : buttonText}</button></div>
          {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
          {success && <p role="status" className="text-green-800 text-sm">{success}</p>}
          <p className="text-xs text-slate-500">This is a registration enquiry, not a confirmed booking or Nusuk registration.</p>
        </form>
      </div>
    </div>
  </section>;
}
