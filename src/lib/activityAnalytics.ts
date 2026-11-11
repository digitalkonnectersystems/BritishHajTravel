/** Reporting periods are complete days in Asia/Karachi (UTC+05:00, no DST). */
export const ACTIVITY_PERIODS = [
  { value: '7d', label: '7 days', days: 7 },
  { value: '14d', label: '14 days', days: 14 },
  { value: '30d', label: '30 days', days: 30 },
  { value: '3m', label: '3 months', days: 90 },
  { value: '6m', label: '6 months', days: 180 },
  { value: '1y', label: '1 year', days: 365 },
] as const;
export type ActivityPeriod = typeof ACTIVITY_PERIODS[number]['value'];
export type ActivityGroup = 'frontend' | 'backend' | 'system';
export type ActivityCategory = { key: string; label: string; group: ActivityGroup; color: string; description: string };
export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  { key: 'frontend.forms', label: 'All Forms Enquiries', group: 'frontend', color: '#2563eb', description: 'All public forms, including customized Hajj/Umrah, without double-counting' },
  { key: 'frontend.404', label: 'New 404 Paths', group: 'frontend', color: '#f97316', description: 'New unique missing URL paths, not all repeat visits' },
  { key: 'backend.auth', label: 'Admin Login / Logout', group: 'backend', color: '#0d9488', description: 'Recorded authentication events' },
  { key: 'backend.pages', label: 'CMS Pages / Builder', group: 'backend', color: '#7c3aed', description: 'Page edits, content and section operations' },
  { key: 'backend.packages', label: 'Packages', group: 'backend', color: '#d97706', description: 'Hajj and Umrah packages and categories' },
  { key: 'backend.blogs', label: 'Blogs', group: 'backend', color: '#db2777', description: 'Blog content and updates' },
  { key: 'backend.guides', label: 'Guides / Hajj Grids', group: 'backend', color: '#4f46e5', description: 'Guides and Hajj guide grid operations' },
  { key: 'backend.destinations', label: 'Destinations', group: 'backend', color: '#0284c7', description: 'Destination changes' },
  { key: 'backend.hotels', label: 'Hotels', group: 'backend', color: '#0891b2', description: 'Hotel and category management' },
  { key: 'backend.visas', label: 'Visa Services / Processing', group: 'backend', color: '#16a34a', description: 'Visa services and processing pages' },
  { key: 'backend.media', label: 'Media Library', group: 'backend', color: '#9333ea', description: 'Media uploads and management' },
  { key: 'backend.seo', label: 'SEO Center', group: 'backend', color: '#ea580c', description: 'SEO updates and metadata changes' },
  { key: 'backend.redirects', label: 'Redirects / 404 Admin', group: 'backend', color: '#dc2626', description: 'Redirect edits and 404 resolutions' },
  { key: 'backend.enquiries', label: 'Enquiry Management', group: 'backend', color: '#e11d48', description: 'Admin enquiry status and assignment changes' },
  { key: 'backend.menus', label: 'Menus', group: 'backend', color: '#059669', description: 'Navigation changes' },
  { key: 'backend.users', label: 'Users / Roles', group: 'backend', color: '#2563eb', description: 'Account and permission changes' },
  { key: 'backend.settings', label: 'Website Settings', group: 'backend', color: '#64748b', description: 'Configuration and other settings changes' },
  { key: 'backend.baan', label: 'BAAN Holding Hajj', group: 'backend', color: '#a16207', description: 'BAAN page management' },
  { key: 'backend.other', label: 'Other Admin Actions', group: 'backend', color: '#475569', description: 'Other recorded administrator actions' },
  { key: 'system.errors', label: 'Backend Errors', group: 'system', color: '#991b1b', description: 'Persisted error-severity diagnostics' },
  { key: 'system.email', label: 'Email Deliveries / Failures', group: 'system', color: '#0f766e', description: 'Email delivery attempts with recorded results' },
  { key: 'system.sitemap', label: 'Sitemap Operations', group: 'system', color: '#7c2d12', description: 'Persisted sitemap generation/submission results' },
];

const KARACHI_OFFSET_MS = 5 * 60 * 60 * 1000;
const isoDate = (date: Date) => date.toISOString().slice(0, 10);
export function pakistanToday(now = new Date()) { return isoDate(new Date(now.getTime() + KARACHI_OFFSET_MS)); }
export function pakistanYesterday(now = new Date()) {
  return isoDate(new Date(Date.parse(`${pakistanToday(now)}T00:00:00.000Z`) - 86400000));
}
export function dateUtc(date: string) { return new Date(Date.parse(`${date}T00:00:00.000Z`) - KARACHI_OFFSET_MS); }
export function addDays(date: string, delta: number) {
  return isoDate(new Date(Date.parse(`${date}T00:00:00.000Z`) + delta * 86400000));
}
export function reportBounds(period: ActivityPeriod, now = new Date()) {
  const selected = ACTIVITY_PERIODS.find(p => p.value === period);
  if (!selected) throw new Error('Unsupported reporting period');
  const last = pakistanYesterday(now);
  const first = addDays(last, 1 - selected.days);
  return {
    first, last, start: dateUtc(first), endExclusive: dateUtc(addDays(last, 1)),
    days: Array.from({ length: selected.days }, (_, index) => addDays(first, index)),
  };
}
export function validateActivityExportDates(from: string, to: string, now = new Date()) {
  const valid = /^\d{4}-\d{2}-\d{2}$/;
  const realDate = (s: string) => valid.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && isoDate(new Date(`${s}T00:00:00Z`)) === s;
  if (!realDate(from) || !realDate(to)) throw new Error('Select valid From and To dates');
  if (from > to) throw new Error('From date must be on or before To date');
  if (to > pakistanYesterday(now)) throw new Error('Current and future dates cannot be exported. Latest date is yesterday (Asia/Karachi).');
  const numberDays = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000 + 1;
  if (numberDays > 366) throw new Error('Choose a period of at most 366 days');
  return { start: dateUtc(from), endExclusive: dateUtc(addDays(to, 1)), days: numberDays };
}
/** Exclude visitor submission audit duplicates; source submissions have their own series. */
export function classifyActivity(type: string, action: string): string | null {
  const name = String(action || '').toLowerCase();
  const kind = String(type || '').toLowerCase();
  if (/received form enquiry|form enquiry received|customized package saved/.test(name)) return null;
  if (/log(?:ged)?\s*(in|out)|sign[ -]?(in|out)/.test(name)) return 'backend.auth';
  if (/redirect|404|not found/.test(name)) return 'backend.redirects';
  if (/\bseo\b|meta(data)?\b|canonical/.test(name) || kind === 'seo') return 'backend.seo';
  switch (kind) {
    case 'pages': return 'backend.pages';
    case 'users': case 'auth': return 'backend.users';
    case 'packages': return 'backend.packages';
    case 'blogs': return 'backend.blogs';
    case 'guides': case 'hajj_guide': return 'backend.guides';
    case 'destinations': return 'backend.destinations';
    case 'hotels': return 'backend.hotels';
    case 'visas': case 'visa_processing': return 'backend.visas';
    case 'media': return 'backend.media';
    case 'enquiries': return 'backend.enquiries';
    case 'menus': return 'backend.menus';
    case 'baan': return 'backend.baan';
    case 'settings': return 'backend.settings';
    default: return 'backend.other';
  }
}
