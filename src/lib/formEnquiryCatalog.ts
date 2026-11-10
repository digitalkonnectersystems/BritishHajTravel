/** Canonical CRM form labels. This module is shared by browser and server code. */
export const ENQUIRY_FORM_CATALOG = [
  { key: 'hajjRegistrationForm', label: 'Hajj 2027 Registration Form' },
  { key: 'contact', label: 'Contact Form' },
  { key: 'quoteForm', label: 'Get a Free Quote' },
  { key: 'packageDetailForm', label: 'Book Umrah Package' },
  { key: 'hajjPackageDetailForm', label: 'Book Hajj' },
  { key: 'dropUsMessage', label: 'Get In Touch Form' },
  { key: 'yosrHajjForm', label: 'YOSR AI Mashaer Hajj Form' },
  { key: 'destinationForm', label: 'Destination Form' },
  { key: 'umrahRegistrationForm', label: 'Umrah Enquiry 2026-27 Form' },
  { key: 'umrahVisaOrder', label: 'Umrah Visa Order Form' },
  { key: 'customizedHajjForm', label: 'Customized Hajj Package Form' },
  { key: 'customizedUmrahForm', label: 'Customized Umrah Package Form' },
  { key: 'hajjCustomizeForm', label: 'Hajj Page Customize Form' },
  { key: 'packageInquiry', label: 'Package Inquiry Form' },
  { key: 'visaConsultation', label: 'Visa Consultation Form' },
  { key: 'baanHoldingHajjForm', label: 'BAAN Holding Hajj Interest Form' },
  { key: 'blogSidebarForm', label: 'Plan Your Journey Form' },
  { key: 'flightInquiry', label: 'Flight Booking Form' },
] as const;
export type EnquiryFormKey = typeof ENQUIRY_FORM_CATALOG[number]['key'];

// The older public forms and saved email audit snapshots use legacy names.
const FORM_ALIASES: Record<string, EnquiryFormKey> = {
  'YOSR Al Mashaer Hajj Form': 'yosrHajjForm',
  'Get a Free Quote Form': 'quoteForm',
  'Homepage Hero Banner — Get a Free Quote Form': 'quoteForm',
  'Package Detail Page Booking Form': 'packageDetailForm',
  'Umrah Package Booking Form': 'packageDetailForm',
  'Hajj Package Booking Form': 'hajjPackageDetailForm',
  'Contact Us Form': 'contact',
  'Contact Inquiry Form': 'contact',
  'Drop Us A Message Form': 'dropUsMessage',
  'Drop Us A Message': 'dropUsMessage',
  'Hajj Customize Form': 'hajjCustomizeForm',
  'Hajj Page — Customize Your Hajj Package Form': 'hajjCustomizeForm',
  'Blog Detail Page': 'blogSidebarForm',
  'Blog Detail Page — Sidebar Booking Form': 'blogSidebarForm',
  'Flights Booking Inquiry Form': 'flightInquiry',
  'Flights Page — Booking Inquiry Form': 'flightInquiry',
  'Umrah Registration Form': 'umrahRegistrationForm',
  'Customized HAJJ Package': 'customizedHajjForm',
  'Customized UMRAH Package': 'customizedUmrahForm',
};
const nameToKey: Record<string, EnquiryFormKey> = Object.fromEntries([
  ...ENQUIRY_FORM_CATALOG.map(form => [form.label.toLowerCase(), form.key]),
  ...Object.entries(FORM_ALIASES).map(([name, key]) => [name.toLowerCase(), key]),
]) as Record<string, EnquiryFormKey>;
export function enquiryFormKey(name: unknown): EnquiryFormKey | null {
  if (typeof name !== 'string' || !name.trim()) return null;
  const value = name.trim();
  return nameToKey[value.toLowerCase()] || ENQUIRY_FORM_CATALOG.find(f => f.key === value)?.key || null;
}
export function enquiryFormLabel(name: unknown): string {
  const key = enquiryFormKey(name);
  return key ? ENQUIRY_FORM_CATALOG.find(f => f.key === key)!.label : String(name || 'Legacy / Unidentified Form');
}
