/**
 * SEO sitemap rules for British Haj Travel.
 *
 * Target keywords: Hajj packages, Umrah packages, Saudi tourist visa.
 * The sitemap is split into topic sitemaps (listed by /sitemap.xml, a sitemap index)
 * so Search Console reports indexing separately for Hajj, Umrah, Visa, Guides and Blog.
 *
 * How a URL is placed:
 *  1. EXCLUDED_PATHS are never listed (duplicates, expired offers, outdated news).
 *  2. PATH_RULES give an exact segment / changefreq / priority for key URLs.
 *  3. Anything else is placed by its data source and slug keywords (see classify()).
 * A changefreq/priority saved on an individual page's SEO settings in the CMS still wins.
 */

// Duplicates and expired offers: excluded from the sitemap and 301-redirected in next.config.
import { SEO_REDIRECTS } from '../../seo-redirects.mjs';

export type SitemapSegment = 'pages' | 'hajj' | 'umrah' | 'visa' | 'guides' | 'blog';
export type SitemapSource = 'sitePages' | 'packages' | 'blogPosts' | 'visaServices' | 'destinations' | 'visaProcessing' | 'static';

export const SITEMAP_SEGMENTS: SitemapSegment[] = ['pages', 'hajj', 'umrah', 'visa', 'guides', 'blog'];

export const segmentFileName = (segment: SitemapSegment) => `sitemap-${segment}.xml`;

type Rule = { segment: SitemapSegment; changefreq: string; priority: string };
const r = (segment: SitemapSegment, changefreq: string, priority: string): Rule => ({ segment, changefreq, priority });

const group = (paths: string[], rule: Rule) => Object.fromEntries(paths.map((p) => [p, rule]));

export const PATH_RULES: Record<string, Rule> = {
  // ---- Core pages
  '/': r('pages', 'daily', '1.0'),
  '/hotels': r('pages', 'weekly', '0.7'),
  '/makkah-and-madina-hotel': r('pages', 'weekly', '0.7'),
  '/5-star-hotel-makkah-madinah': r('pages', 'weekly', '0.7'),
  '/flights': r('pages', 'weekly', '0.6'),
  '/airline-tickets-booking': r('pages', 'monthly', '0.6'),
  '/certified-travel-agency-in-uk': r('pages', 'monthly', '0.7'),
  '/services': r('pages', 'monthly', '0.6'),
  '/contact': r('pages', 'monthly', '0.6'),
  '/destinations': r('pages', 'monthly', '0.6'),
  '/blogs': r('pages', 'weekly', '0.6'),
  '/travel-agents': r('pages', 'monthly', '0.5'),
  '/halal-tours-worldwide': r('pages', 'monthly', '0.5'),
  '/gallery': r('pages', 'monthly', '0.4'),
  '/privacy-policy': r('pages', 'yearly', '0.2'),

  // ---- Hajj
  '/hajj-packages': r('hajj', 'daily', '1.0'),
  '/hajj-2027': r('hajj', 'weekly', '0.9'),
  '/hajj-2027-registration': r('hajj', 'weekly', '0.9'),
  ...group([
    '/nusuk-hajj-packages', '/nusuk-hajj-2027', '/pakistani-passport-hajj', '/hajj-packages-london',
    '/hajj-packages-preston-affordable-trusted-uk-hajj-2027', '/cheapest-hajj-package', '/hajj-registration',
  ], r('hajj', 'weekly', '0.9')),
  ...group([
    '/nusuk-hajj', '/nusuk-hajj-package', '/nusuk-hajj-agent', '/hajj-package', '/pakistan-passport-hajj-package',
    '/baan-holding-hajj', '/rifad-hajj-packages', '/alrajhi-hajj-packages', '/holiday-in-bakkah',
    '/yosr-al-mashaer-hajj-uk-guide', '/ekram-aldyf',
  ], r('hajj', 'weekly', '0.8')),
  '/hajj-2026-guide-british-pilgrims': r('hajj', 'monthly', '0.6'),
  '/hajj-2026-highlights': r('hajj', 'monthly', '0.5'),

  // ---- Umrah
  '/umrah-packages': r('umrah', 'daily', '1.0'),
  ...group([
    '/ramadan-umrah-packages', '/december-umrah-packages', '/march-umrah-packages', '/august-umrah-packages',
    '/october-umrah-packages', '/cheapest-umrah-packages', '/luxury-umrah-packages-uk', '/umrah-package-from-london',
    '/umrah-package-from-manchester', '/umrah-package-from-birmingham', '/umrah-package-from-glasgow',
    '/umrah-packages-with-flights-from-uk', '/nusuk-umrah-package',
  ], r('umrah', 'weekly', '0.9')),
  ...group([
    '/umrah-package', '/cheaper-umrah-package', '/vip-umrah', '/special-umrah-packages', '/umrah-agent-in-uk',
    '/umrah-packages-specialist-from-uk', '/umrah-packages-offers-including-flights-from-uk', '/umrah-packages-manchester',
    '/cheap-umrah-packages-umrah-package-deals', '/5-star-december-umrah-packages',
    '/december-umrah-packages-with-flights-british-haj-travel', '/ramadhan-umrah-package', '/ramadan-umrah',
    '/ramadan-economy-umrah-packages', '/cheap-ramadan-packages', '/umrah-2026', '/masjid-al-aqsa-packages',
    '/tailor-made-umrah-packages-for-your-convenience', '/the-perfect-packages-for-hajj-and-umrah-from-uk',
    '/umrah-package-from-manchester-2026-begin-your-journey-of-faith-with-british-haj-travel',
  ], r('umrah', 'weekly', '0.8')),

  // ---- Saudi visa
  '/saudi-visa': r('visa', 'weekly', '1.0'),
  ...group([
    '/saudi-tourist-visa', '/saudi-tourist-evisa', '/umrah-visa', '/saudi-umrah-visa', '/umrah-visa-requirements', '/visa',
    '/visa-processing/british-tourist', '/visa-processing/eta-saudi-visa', '/visa-processing/british-passport',
    '/visa-processing/pakistani-passport', '/visa-processing/indian-passport', '/visa-processing/bangladeshi-passport',
    '/visa-processing/afghan-passport',
  ], r('visa', 'weekly', '0.9')),
  ...group([
    '/saudi-tourist-visa-b2', '/umrah-visa-b2', '/pakistani-passport-umrah-visa', '/bangladeshi-passport-umrah-visa',
    '/umrah-visa-complete-guide-to-requirements-application-travel',
    '/visa-procedure-and-tips-if-your-mahram-is-in-a-different-country',
  ], r('visa', 'monthly', '0.7')),

  // ---- Guides
  ...group(['/hajj-guide', '/umrah-guide', '/how-to-perform-umrah', '/how-to-perform-hajj'], r('guides', 'monthly', '0.8')),
  '/nusuk-app-live-crowd-updates': r('guides', 'weekly', '0.8'),
  ...group([
    '/about-umrah', '/diy-umrah', '/guides', '/resources', '/umrah-resource', '/faq', '/faq-hajj', '/insurance', '/health',
    '/health-requirements', '/what-to-pack', '/apps', '/apps-2', '/sim-mobile-networks', '/sim-mobile-network',
    '/accessible-care', '/accesible-care', '/facilities', '/facilities-2', '/transport', '/transport-2', '/zamzam-water',
    '/zamzam-water-2', '/makkah-map', '/makkah-map-2', '/madina-map', '/madinah-map', '/contact-numbers', '/contact-number',
    '/verification-ewallet', '/choosing-package-category', '/package-completion', '/saudi-bio-app',
    '/shifting-non-shifting-package', '/purchasing-a-package', '/packing-list-and-tips-for-hajj-umrah',
    '/best-time-to-book-umrah-packages', '/how-to-perform-umrah-for-women', '/conditions-for-umrah-eligibility',
    '/mahram-rules-for-women-performing-hajj-and-umrah', '/meningitis-vaccination-for-pilgrims', '/ziyarat-holy-sites-to-visit',
  ], r('guides', 'monthly', '0.6')),
};


/** Outdated news stories: kept live (they may have backlinks) but not listed. Review in Search Console. */
const OUTDATED_NEWS = [
  '/385191-pilgrims-arrive-in-madinah', '/tent-city-ready-to-welcome-the-guests-of-allah', '/british-muslims-gear-up-for-haj',
  '/ksa-ready-for-ramadan-influx-of-umrah-pilgrims', '/plan-in-place-to-deal-with-last-10-days-of-ramadan',
  '/worshippers-relish-iftar-experience-in-prophets-mosque', '/services-for-umrah-haj-boosted',
  '/makkah-ready-with-comprehensive-plan-for-ramadan', '/sun-to-help-determine-accurate-kaaba-direction-today',
  '/scholars-discuss-ways-to-develop-pilgrim-services', '/makkah-museums-attract-visitors',
  '/mina-stampede-street-to-be-a-direct-road-to-jamarat', '/shortage-of-domestic-aides-as-ramadan-approaches',
  '/saudi-council-urges-more-space-at-hajj-stampede-site', '/more-than-4-6m-umrah-visas-issued-in-5-months',
  '/now-umrah-visas-can-be-converted-into-tourist-visas', '/haram-to-be-clear-of-mataf-bridge-by-may-27',
  '/haj-to-fall-in-hot-summer-months-for-next-10-years', '/haramain-rail-test-runs-positive',
  '/al-khayyat-charitable-center-provides-dialysis-facilities-to-umrah-and-haj-pilgrims', '/jeddah-airport-busy-with-umrah-pilgrims',
  '/34-travel-agencies-compete-to-provide-services-to-madinah-visitors', '/haj-inspectors-go-fully-electronic',
  '/umrah-plus-to-be-launched-soon', '/hajis-saved-from-baggage-check-in-formalities', '/pilgrim-quota-cut-temporary-says-minister',
  '/number-of-umrah-visas-to-treble-in-2016', '/train-for-pilgrims-makkah-madinah-travel-by-end-of-2016',
  '/madinah-airports-haj-lounge-opens-today', '/mataf-bridge-removal-from-feb-9', '/saudi-authorities-approve-electronic-umrah-system',
  '/1-25m-umrah-pilgrims-a-month-from-next-year', '/saudi-high-speed-railway-to-dramatically-improve-haj-umrah-travel',
  '/mataf-bridge-to-be-removed-after-3-months', '/over-5-8-million-umrah-visas-issued-this-year',
  '/umrah-stay-cannot-exceed-15-days-says-haj-ministry', '/new-umrah-seasons-begins', '/saudi-arabia-issued-over-5-8-million-umrah-visas',
  '/umrah-pilgrims-start-arriving-from-nov-13', '/umrah-visas-validity-limited-to-two-weeks',
  '/come-november-umrah-pilgrims-can-don-tourist-hats', '/umrah-applicants-biometrics-before-travel',
  '/umrah-season-begins-on-november-23', '/moving-3-million-people-a-day-during-hajj',
  '/madinah-airport-start-test-run-operations-on-sunday', '/signs-madinah-public-transport-contract',
  '/french-firm-deal-for-madinah-public-transport-expansion', '/madinah-airport-test-run-in-april',
  '/makkah-residence-mixed-use-complex-project-set-in-2016',
  '/a-hospital-official-predicts-number-of-mers-effected-patients-to-increase-in-future',
  '/arilines-charge-up-to-sr60-per-extra-kilogram', '/flight-delay-airlines-to-pay-massive-fines',
  '/umrah-pilgrims-flock-to-madinahs-historical-sites', '/millions-of-pilgrims-gathered-in-saudi-arabia-at-hajj',
  '/selfies-affecting-holy-kaaba', '/the-haj-selfie-a-sign-of-the-times-or-should-phones-be-left-at-home',
  '/hajj-selfies-can-also-be-riyaa',
  '/infamous-hajj-selfie-is-one-more-thing-transforming-mecca-and-not-everyone-is-happy-about-it',
  '/will-you-be-suffering-from-selfies-this-eid', '/selfie-fever-on-muslim-pilgrimage-criticised-islamic-scholars',
  '/say-no-to-hajj-selfie', '/hajj-selfie-fever', '/squatting-during-hajj-when-will-it-end', '/is-haj-becoming-for-the-rich-only',
];

export const EXCLUDED_PATHS = new Set<string>([
  ...SEO_REDIRECTS.map((x: { source: string }) => x.source.toLowerCase()),
  ...OUTDATED_NEWS,
]);

/** Public routes that must be listed even if no CMS record produces them. */
export const STATIC_PATHS = ['/flights'];

const DEFAULTS: Record<SitemapSegment, { changefreq: string; priority: string }> = {
  pages: { changefreq: 'monthly', priority: '0.5' },
  hajj: { changefreq: 'weekly', priority: '0.8' },
  umrah: { changefreq: 'weekly', priority: '0.8' },
  visa: { changefreq: 'weekly', priority: '0.8' },
  guides: { changefreq: 'monthly', priority: '0.6' },
  blog: { changefreq: 'yearly', priority: '0.4' },
};

const has = (path: string, re: RegExp) => re.test(path);

/** Decide segment + defaults for a normalised, lower-case path. */
export function classify(path: string, source: SitemapSource): Rule {
  const exact = PATH_RULES[path];
  if (exact) return exact;

  let segment: SitemapSegment;
  if (source === 'visaProcessing' || source === 'visaServices' || has(path, /(^|[-/])(visa|evisa|eta)([-/]|$)/)) {
    segment = 'visa';
  } else if (source === 'packages' || source === 'destinations' || path.startsWith('/package/') || path.startsWith('/destinations/')) {
    segment = has(path, /umrah|ramadan|ramadhan|aqsa|dubai|india/) ? 'umrah' : 'hajj';
  } else if (source === 'blogPosts') {
    segment = 'blog';
  } else if (has(path, /umrah|ramadan/) && has(path, /package|deal|offer/)) {
    segment = 'umrah';
  } else if (has(path, /hajj|haj(-|$)/) && has(path, /package|registration|nusuk/)) {
    segment = 'hajj';
  } else {
    segment = 'pages';
  }
  return { segment, ...DEFAULTS[segment] };
}
