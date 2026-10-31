'use client';

import { useEffect, useId, useState, type FormEvent } from 'react';
import { getFormsSettings } from '@/actions/pageActions';
import { submitUmrahRegistrationEnquiryAction } from '@/actions/enquiryActions';
import { normalizeUkPhoneInput } from '@/lib/ukPhone';
import { defaultBaanContent } from '@/lib/baanContent';

type FieldKey = 'name' | 'email' | 'phone' | 'airport' | 'packageTier' | 'travelDate' | 'passengers' | 'makkahDays' | 'madinahDays';
type FieldConfig = { id: string; label: string; type: string; placeholder: string; required: boolean };
const defaultFields: Record<FieldKey, FieldConfig> = {
  name: { id: 'name', label: 'Name', type: 'text', placeholder: 'Name', required: true },
  email: { id: 'email', label: 'Email', type: 'email', placeholder: 'Email', required: true },
  phone: { id: 'phone', label: 'Phone', type: 'tel', placeholder: 'xxxx-xxxx xxx', required: true },
  airport: { id: 'airport', label: 'Airport', type: 'select', placeholder: 'London (LON)', required: true },
  packageTier: { id: 'packageTier', label: 'Umrah Package', type: 'select', placeholder: '5-Star', required: true },
  travelDate: { id: 'travelDate', label: 'Estimated Date of Travel', type: 'date', placeholder: 'Select Date', required: true },
  passengers: { id: 'passengers', label: 'Number of Passengers', type: 'number', placeholder: 'Number of Passengers', required: true },
  makkahDays: { id: 'makkahDays', label: 'Number of Days in Makkah', type: 'select', placeholder: '10', required: true },
  madinahDays: { id: 'madinahDays', label: 'Number of Days in Madinah', type: 'select', placeholder: '8', required: true },
};
const dayChoices = Array.from({ length: 30 }, (_, index) => String(index + 1));
const choices: Partial<Record<FieldKey, string[]>> = {
  airport: defaultBaanContent.airportOptions,
  packageTier: defaultBaanContent.packageOptions,
  makkahDays: dayChoices,
  madinahDays: dayChoices,
};
const fieldRows: FieldKey[][] = [
  ['name', 'email', 'phone'],
  ['airport', 'packageTier', 'travelDate'],
  ['passengers', 'makkahDays', 'madinahDays'],
];
const initialValues: Record<FieldKey, string> = {
  name: '', email: '', phone: '+44',
  airport: defaultBaanContent.airportOptions[0] || '',
  packageTier: defaultBaanContent.packageOptions[0] || '',
  travelDate: '', passengers: '', makkahDays: '10', madinahDays: '8',
};

/** Same Umrah form, configuration and email templates wherever a CMS section renders it. */
export default function UmrahRegistrationForm({
  sourcePage,
  heading = 'Umrah Enquiry 2026-27',
}: {
  sourcePage: string;
  heading?: string;
}) {
  const instanceId = useId();
  const [config, setConfig] = useState<Record<FieldKey, FieldConfig>>(defaultFields);
  const [enabled, setEnabled] = useState(true);
  const [buttonText, setButtonText] = useState('Submit');
  const [successText, setSuccessText] = useState('Your Umrah enquiry has been received. We will be in touch.');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [values, setValues] = useState<Record<FieldKey, string>>(initialValues);

  useEffect(() => {
    let active = true;
    getFormsSettings().then(settings => {
      if (!active) return;
      const form = settings.formsData?.umrahRegistrationForm;
      if (form) {
        setEnabled(form.enabled !== false);
        if (typeof form.buttonText === 'string' && form.buttonText.trim()) setButtonText(form.buttonText);
        if (typeof form.successMessage === 'string' && form.successMessage.trim()) setSuccessText(form.successMessage);
      }
      const saved = settings.formFieldsState?.umrahRegistrationForm;
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
    return () => { active = false; };
  }, []);

  const change = (key: FieldKey, value: string) => {
    setValues(current => ({ ...current, [key]: key === 'phone' ? normalizeUkPhoneInput(value) : value }));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const result = await submitUmrahRegistrationEnquiryAction({
        ...values,
        passengers: Number(values.passengers),
        makkahDays: Number(values.makkahDays),
        madinahDays: Number(values.madinahDays),
        sourcePage,
      });
      if (!result.success) {
        setError(result.error || 'Unable to submit your enquiry.');
      } else {
        setSuccess(result.emailWarning ? `${successText} Email delivery may be delayed.` : successText);
        setValues(current => ({ ...current, name: '', email: '', phone: '+44', travelDate: '', passengers: '' }));
      }
    } catch {
      setError('Unable to submit your enquiry. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function field(key: FieldKey) {
    const settings = config[key];
    const id = `umrah-registration-${instanceId}-${key}`;
    const inputClass = 'block w-full h-[44px] border border-[#c5c5c5] rounded-sm bg-white px-3 text-[15px] text-[#162348] focus:outline-none focus:ring-2 focus:ring-[#0877bd] focus:border-[#0877bd]';
    const options = choices[key];
    return <div key={key} className="min-w-0">
      <label htmlFor={id} className="block text-[15px] leading-[21px] font-bold text-[#121212] mb-3">
        {settings.label}{settings.required && <span className="text-red-600"> *</span>}
      </label>
      {options ? (
        <select id={id} name={key} className={inputClass} value={values[key]} required={settings.required}
          onChange={event => change(key, event.target.value)}>
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input id={id} name={key} className={inputClass}
          type={key === 'passengers' ? 'number' : key === 'travelDate' ? 'date' : key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
          autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : key === 'phone' ? 'tel' : undefined}
          placeholder={settings.placeholder} required={settings.required} value={values[key]}
          onChange={event => change(key, event.target.value)}
          maxLength={key === 'phone' ? 13 : key === 'name' ? 255 : undefined}
          min={key === 'passengers' ? 1 : undefined} max={key === 'passengers' ? 99 : undefined}
          pattern={key === 'phone' ? '\\+44[0-9]{10}' : undefined} />
      )}
    </div>;
  }

  if (!enabled) return null;
  return <section aria-label="Umrah enquiry registration" className="bg-white w-full px-4 py-8 md:py-10">
    <div className="max-w-[1110px] mx-auto border border-[#d0d0d0] rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,.18)] bg-white p-5 md:p-6">
      <h2 className="font-bold text-center text-[#ee1717] text-[23px] md:text-[25px] leading-tight mb-8">{heading}</h2>
      <form onSubmit={submit} className="space-y-3" autoComplete="on">
        {fieldRows.map((row, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3">
            {row.map(field)}
          </div>
        ))}
        <div className="pt-3">
          <button type="submit" disabled={busy} className="bg-[#0875b8] text-white font-semibold text-[15px] rounded-sm px-4 py-2.5 hover:bg-[#075d95] disabled:opacity-50">
            {busy ? 'Submitting...' : buttonText}
          </button>
        </div>
        {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
        {success && <p role="status" className="text-green-800 text-sm">{success}</p>}
        <p className="text-xs text-slate-500">This is an Umrah travel enquiry, not a confirmed booking.</p>
      </form>
    </div>
  </section>;
}
