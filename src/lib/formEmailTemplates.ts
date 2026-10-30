import { getEditableEmailTemplateHtml, renderSharedEmailTemplateHtml } from './emailTemplate';
import { dedupeRecipientChannels, hasInvalidEmailRecipient } from './emailRecipients';

export type EmailAudience = 'admin' | 'customer';
export type EmailMessageTemplate = { to: string; cc: string; bcc: string; replyTo: string; subject: string; body: string };
export type FormEmailTemplatePair = Record<EmailAudience, EmailMessageTemplate>;
export type FormEmailTemplates = Record<string, FormEmailTemplatePair>;

// These keys are stable identifiers and must match the form's actual submission source.
export const EMAIL_FORM_DEFINITIONS = [
  { key: 'hajjRegistrationForm', name: 'Hajj 2027 Registration Form', fields: 'enquiryNumber fullName email phone postcode airport packageTier passengers days room budget sourcePage' },
  { key: 'baanHoldingHajjForm', name: 'BAAN Holding Hajj Interest Form', fields: 'enquiryNumber fullName email phone postcode airport packageTier passengers days room budget' },
  { key: 'quoteForm', name: 'Get a Free Quote', fields: 'enquiryNumber fullName email phone packageType numberOfPilgrims message' },
  { key: 'packageDetailForm', name: 'Book Umrah Package', fields: 'bookingNumber packageName packageType fullName email phone adults children infants startDate totalPrice message' },
  { key: 'hajjPackageDetailForm', name: 'Book Hajj', fields: 'bookingNumber packageName packageType fullName email phone adults children infants startDate totalPrice message' },
  { key: 'contact', name: 'Contact Form', fields: 'ticketNumber fullName email phone subject website packageType message' },
  { key: 'destinationForm', name: 'Destination Form', fields: 'bookingNumber packageName packageType fullName email phone adults children infants startDate totalPrice message' },
  { key: 'dropUsMessage', name: 'Get In Touch Form', fields: 'ticketNumber fullName email phone packageType website message' },
  { key: 'umrahVisaOrder', name: 'Umrah Visa Order Form', fields: 'enquiryNumber fullName email phone visaTitle travelersCount nationality travelDate message' },
  { key: 'blogSidebarForm', name: 'Plan Your Journey Form', fields: 'bookingNumber packageName packageType fullName email phone adults children infants startDate totalPrice message' },
  { key: 'customizedHajjForm', name: 'Customized Hajj Package Form', fields: 'enquiryNumber fullName email phone category departureAirport departureDate numberOfDays adults children infants airlinePreference makkahHotel madinahHotel hotelStandard roomOccupancy transportation budgetGbp notes services requirements' },
  { key: 'customizedUmrahForm', name: 'Customized Umrah Package Form', fields: 'enquiryNumber fullName email phone category departureAirport departureDate numberOfDays adults children infants airlinePreference makkahHotel madinahHotel hotelStandard roomOccupancy transportation budgetGbp notes services requirements' },
  { key: 'hajjCustomizeForm', name: 'Hajj Page Customize Form', fields: 'enquiryNumber fullName email phone packageType numberOfPilgrims message' },
  { key: 'packageInquiry', name: 'Package Inquiry Form', fields: 'bookingNumber packageName packageType fullName email phone adults children infants startDate totalPrice message' },
  { key: 'visaConsultation', name: 'Visa Consultation Form', fields: 'enquiryNumber fullName email phone visaTitle travelersCount nationality travelDate message' },
  { key: 'flightInquiry', name: 'Flight Booking Form', fields: 'enquiryNumber fullName email phone originCity destinationCity departureDate returnDate tripType passengers flightClass message' },
] as const;

// Additional existing forms remain supported without removing their working routes.
const ALIASES: Record<string, string> = {
  'Hajj 2027 Registration Form': 'hajjRegistrationForm',
  'BAAN Holding Hajj Interest Form': 'baanHoldingHajjForm',
  'Hajj Customize Form': 'hajjCustomizeForm',
  'Hajj Page — Customize Your Hajj Package Form': 'hajjCustomizeForm',
  'Package Inquiry Form': 'packageInquiry',
  'Pilgrimage Package — Custom Inquiry Form': 'packageInquiry',
  'Visa Consultation Form': 'visaConsultation',
  'Visa Services — Consultation Form': 'visaConsultation',
  'Flight Booking Form': 'flightInquiry',
  'Flights Booking Inquiry Form': 'flightInquiry',
  'Flights Page — Booking Inquiry Form': 'flightInquiry',
  'Get a Free Quote Form': 'quoteForm',
  'Homepage Hero Banner — Get a Free Quote Form': 'quoteForm',
  'Umrah Package Booking Form': 'packageDetailForm',
  'Package Detail Page Booking Form': 'packageDetailForm',
  'Package Detail Booking Form': 'packageDetailForm',
  'Umrah Package Detail Page — Booking Form': 'packageDetailForm',
  'Umrah Package Booking — Popup Modal Form': 'packageDetailForm',
  'Umrah Package Booking Form (Detail Page & Popup Modal)': 'packageDetailForm',
  'Hajj Package Booking Form': 'hajjPackageDetailForm',
  'Hajj Package Detail Page — Booking Form': 'hajjPackageDetailForm',
  'Hajj Package Booking — Popup Modal Form': 'hajjPackageDetailForm',
  'Hajj Package Booking Form (Detail Page & Popup Modal)': 'hajjPackageDetailForm',
  'Contact Us Form': 'contact',
  'Contact Inquiry Form': 'contact',
  'Contact Page — Enquiry Form': 'contact',
  'Destination Booking Form': 'destinationForm',
  'Destination Form': 'destinationForm',
  'Get In Touch Form': 'dropUsMessage',
  'Drop Us A Message Form': 'dropUsMessage',
  'Drop Us A Message': 'dropUsMessage',
  'General — Drop Us A Message Form': 'dropUsMessage',
  'Umrah Visa Order Form': 'umrahVisaOrder',
  'Blog Detail Page': 'blogSidebarForm',
  'Blog Detail Page — Sidebar Booking Form': 'blogSidebarForm',
  'Plan Your Journey Form': 'blogSidebarForm',
  'Customized Hajj Package Form': 'customizedHajjForm',
  'Customized Umrah Package Form': 'customizedUmrahForm',
};
export function emailFormKey(formName: string): string {
  return ALIASES[formName] || EMAIL_FORM_DEFINITIONS.find(form => form.name === formName || form.key === formName)?.key || formName;
}
export function emailFormName(key: string): string {
  return EMAIL_FORM_DEFINITIONS.find(form => form.key === key)?.name || key;
}

const ADMIN_DEFAULT_BODY = getEditableEmailTemplateHtml().replace('Hello {{SUBMITTER_NAME}},', 'New enquiry from {{SUBMITTER_NAME}}.');
const CUSTOMER_DEFAULT_BODY = getEditableEmailTemplateHtml()
  .replace('Hello {{SUBMITTER_NAME}},', 'Hello {{SUBMITTER_NAME}}, thank you for contacting us.')
  .replace('The following information was submitted through', 'We have received your request through');

function defaultAudience(audience: EmailAudience, legacy: { to?: string; cc?: string; bcc?: string; replyTo?: string } = {}): EmailMessageTemplate {
  return audience === 'admin'
    ? { to: legacy.to || '', cc: legacy.cc || '', bcc: legacy.bcc || '', replyTo: legacy.replyTo || '[Customer Email]', subject: 'New [Form Name] | [Customer Name]', body: ADMIN_DEFAULT_BODY }
    : { to: '[Customer Email]', cc: '', bcc: '', replyTo: '', subject: 'We received your [Form Name] request', body: CUSTOMER_DEFAULT_BODY };
}
export function createDefaultFormEmailTemplates(legacyRules: unknown = [], legacyReplyTo = ''): FormEmailTemplates {
  const rules = Array.isArray(legacyRules) ? legacyRules : [];
  return Object.fromEntries(EMAIL_FORM_DEFINITIONS.map(form => {
    const rule = rules.find((item: any) => Array.isArray(item?.forms) && item.forms.includes(form.key)) as any;
    return [form.key, { admin: defaultAudience('admin', { to: rule?.sendTo, cc: rule?.cc, bcc: rule?.bcc, replyTo: legacyReplyTo }), customer: defaultAudience('customer') }];
  })) as FormEmailTemplates;
}
export function mergeFormEmailTemplates(input: unknown, legacyRules: unknown = [], legacyReplyTo = ''): FormEmailTemplates {
  const defaults = createDefaultFormEmailTemplates(legacyRules, legacyReplyTo);
  const saved = input && typeof input === 'object' ? input as Record<string, any> : {};
  return Object.fromEntries(Object.entries(defaults).map(([key, pair]) => [key, {
    admin: { ...pair.admin, ...(saved[key]?.admin || {}) },
    customer: { ...pair.customer, ...(saved[key]?.customer || {}) },
  }])) as FormEmailTemplates;
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function toFieldString(value: unknown): string {
  return Array.isArray(value) ? value.join(', ') : value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
}
function lookupToken(token: string, formName: string, data: Record<string, unknown>): string | undefined {
  const normalized = token.toLowerCase().replace(/[\s_-]/g, '');
  if (normalized === 'formname') return formName;
  if (normalized === 'submissiondate') return new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' });
  if (normalized === 'customeremail') return toFieldString(data.email ?? data.emailAddress ?? data.userEmail);
  if (normalized === 'customerphone') return toFieldString(data.phone ?? data.mobile);
  if (normalized === 'customername') return toFieldString(data.fullName ?? data.name ?? data.passengerName ?? data.pilgrimName);
  if (normalized === 'reference') return toFieldString(data.enquiryNumber ?? data.bookingNumber ?? data.ticketNumber);
  for (const [key, value] of Object.entries(data)) {
    if (key.toLowerCase().replace(/[\s_-]/g, '') === normalized) return toFieldString(value);
  }
  return undefined;
}
// Placeholder names are case-insensitive. Unknown placeholders stay visible to spot mistakes.
export function renderEmailTokens(value: string, formName: string, data: Record<string, unknown>, html = false): string {
  return String(value || '').replace(/\[([A-Za-z][A-Za-z0-9 _-]{0,80})\]/g, (original, token: string) => {
    const resolved = lookupToken(token, formName, data);
    return resolved === undefined ? original : html ? escapeHtml(resolved) : resolved;
  });
}
export function renderFormEmailBody(body: string, formName: string, data: Record<string, unknown>, audience: EmailAudience): string {
  // Legacy {{...}} tokens are still usable, but no token is mandatory in custom HTML.
  let base = String(body || '');
  // Render each legacy token independently, even when an admin replaces
  // {{FORM_NAME}} with [Form Name] or removes the field table from the design.
  if (/\{\{(?:FORM_NAME|SUBMISSION_ROWS|SUBMISSION_DATE|SUBMITTER_NAME|EMAIL_AUDIENCE)\}\}/.test(base)) {
    const marker = '___BHT_EMAIL_ROWS_SEPARATOR___';
    const parts = renderSharedEmailTemplateHtml(`{{FORM_NAME}}${marker}{{SUBMISSION_ROWS}}`, formName, data, audience === 'customer')?.split(marker);
    const fieldsHtml = parts?.[1] || '';
    base = base
      .replaceAll('{{FORM_NAME}}', escapeHtml(formName))
      .replaceAll('{{SUBMISSION_ROWS}}', fieldsHtml)
      .replaceAll('{{SUBMISSION_DATE}}', escapeHtml(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })))
      .replaceAll('{{SUBMITTER_NAME}}', escapeHtml(data.fullName || data.name || data.customerName || data.pilgrimName || 'Customer'))
      .replaceAll('{{EMAIL_AUDIENCE}}', audience === 'customer' ? 'Customer Confirmation' : 'Admin Notification');
  }
  return renderEmailTokens(base, formName, data, true);
}
export function renderFormEmailSubject(subject: string, formName: string, data: Record<string, unknown>): string {
  return renderEmailTokens(subject || '[Form Name]', formName, data).replace(/[\r\n]+/g, ' ').trim().slice(0, 240);
}
export function resolvedEmailRecipients(entry: EmailMessageTemplate, formName: string, data: Record<string, unknown>) {
  const replace = (raw: string) => renderEmailTokens(raw || '', formName, data);
  return dedupeRecipientChannels(replace(entry.to), replace(entry.cc), replace(entry.bcc));
}
export function validateFormEmailTemplates(input: FormEmailTemplates): string | null {
  for (const form of EMAIL_FORM_DEFINITIONS) for (const audience of ['admin', 'customer'] as const) {
    const entry = input[form.key]?.[audience];
    if (!entry) return `Missing ${audience} email configuration for ${form.name}.`;
    for (const key of ['to', 'cc', 'bcc', 'replyTo', 'subject', 'body'] as const) {
      if (typeof entry[key] !== 'string') return `Invalid ${key} for ${form.name} (${audience}).`;
    }
    if (entry.body.length > 250000) return `${form.name} ${audience} email body exceeds 250 KB.`;
    if (entry.subject.length > 240) return `${form.name} ${audience} subject exceeds 240 characters.`;
    for (const key of ['to', 'cc', 'bcc', 'replyTo'] as const) {
      // A customer email placeholder is allowed anywhere recipients are entered.
      const candidate = entry[key].replace(/\[Customer Email\]/gi, 'customer@example.com');
      if (candidate && hasInvalidEmailRecipient(candidate)) return `Invalid ${key.toUpperCase()} address for ${form.name} (${audience}).`;
    }
  }
  return null;
}
export const FORM_EMAIL_SAMPLES: Record<string, Record<string, unknown>> = {
  hajjRegistrationForm: { enquiryNumber: 'HJ-123', fullName: 'Ahmed Khan', email: 'ahmed@example.com', phone: '+447957197390', postcode: 'PR1 1AA', airport: 'London (LON)', packageTier: '5-Star', passengers: 2, days: '12 Days Packages', room: 'Double Room', budget: '5K - 7K', sourcePage: '/hajj-packages/' },
  baanHoldingHajjForm: { enquiryNumber: 'BH-123', fullName: 'Ahmed Khan', email: 'ahmed@example.com', phone: '+447957197390', postcode: 'PR1 1AA', airport: 'London (LON)', packageTier: '5-Star', passengers: 2, days: '12 Days Packages', room: 'Double Room', budget: '5K - 7K' },
  hajjCustomizeForm: { enquiryNumber: 'QT-122', fullName: 'Fatima', email: 'fatima@example.com', phone: '+447957197390', packageType: 'Hajj', numberOfPilgrims: 2 },
  packageInquiry: { bookingNumber: 'BK-131', fullName: 'Ali', email: 'ali@example.com', phone: '+447957197390', packageName: 'Umrah 2027' },
  visaConsultation: { enquiryNumber: 'VS-111', fullName: 'Zainab', email: 'zainab@example.com', phone: '+447957197390', travelersCount: 2 },
  flightInquiry: { enquiryNumber: 'FL-111', fullName: 'Omar', email: 'omar@example.com', phone: '+447957197390', departureCity: 'London', destinationCity: 'Jeddah' },
  quoteForm: { enquiryNumber: 'QT-123', fullName: 'Ahmed Khan', email: 'ahmed@example.com', phone: '+441234567890', packageType: 'Umrah', numberOfPilgrims: 2, message: 'December departure' },
  packageDetailForm: { bookingNumber: 'BK-123', fullName: 'Fatima Ali', email: 'fatima@example.com', phone: '+441234567890', packageName: 'Umrah Package', adults: 2, startDate: '2027-01-15' },
  hajjPackageDetailForm: { bookingNumber: 'BK-124', fullName: 'Omar Ali', email: 'omar@example.com', phone: '+441234567890', packageName: 'Hajj Package', adults: 2 },
  contact: { ticketNumber: 'TKT-123', fullName: 'Sarah Ahmed', email: 'sarah@example.com', phone: '+441234567890', message: 'Please call me' },
  destinationForm: { bookingNumber: 'BK-125', fullName: 'Zain Ali', email: 'zain@example.com', phone: '+441234567890', packageName: 'Umrah + Dubai', adults: 2 },
  dropUsMessage: { ticketNumber: 'TKT-124', fullName: 'Aisha Khan', email: 'aisha@example.com', phone: '+441234567890', message: 'I need details' },
  umrahVisaOrder: { enquiryNumber: 'VS-123', fullName: 'Zara Khan', email: 'zara@example.com', phone: '+441234567890', visaTitle: 'Umrah Visa', travelersCount: 2 },
  blogSidebarForm: { bookingNumber: 'BK-126', fullName: 'Bilal Shah', email: 'bilal@example.com', phone: '+441234567890', packageName: 'Umrah', adults: 2 },
  customizedHajjForm: { enquiryNumber: 'CUS-123', fullName: 'Hassan Ali', email: 'hassan@example.com', phone: '+441234567890', category: 'hajj', departureAirport: 'London', numberOfDays: 14, adults: 2, services: ['VIP Transport'], requirements: ['Close to Haram'] },
  customizedUmrahForm: { enquiryNumber: 'CUS-124', fullName: 'Maryam Khan', email: 'maryam@example.com', phone: '+441234567890', category: 'umrah', departureAirport: 'Manchester', numberOfDays: 10, adults: 2, services: ['Ziyarat Tours'], requirements: [] },
};
export function formEmailPlaceholders(formKey: string): string[] {
  const fields = EMAIL_FORM_DEFINITIONS.find(form => form.key === formKey)?.fields.split(' ') || [];
  return ['[Form Name]', '[Submission Date]', '[Reference]', '[Customer Name]', '[Customer Email]', '[Customer Phone]', ...fields.map(field => `[${field}]`)];
}
