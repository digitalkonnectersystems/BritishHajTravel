/**
 * Permanent SEO redirects: duplicate pages and expired dated offers.
 * Used by next.config.mjs redirects() (runs before any page renders) and
 * by src/lib/sitemapRules.ts (these sources are never listed in the sitemap).
 *
 * Why here and not in Admin > Redirects: admin redirect rules only fire when a
 * path has no page, and every source below still has a live page.
 */
export const SEO_REDIRECTS = [
  // Duplicate / near-duplicate pages
  { source: '/umrah-package-from-manchester-2026-begin-your-journey-of-faith-with-british-haj-travel-2', destination: '/umrah-package-from-manchester-2026-begin-your-journey-of-faith-with-british-haj-travel' },
  { source: '/pakistani-passport-umrah-visa-2', destination: '/pakistani-passport-umrah-visa' },
  { source: '/cheaper-umrah-package-2', destination: '/cheaper-umrah-package' },
  { source: '/nusuk-umrah-package-2', destination: '/nusuk-umrah-package' },
  { source: '/umrah-package-from-glasgow-2', destination: '/umrah-package-from-glasgow' },
  { source: '/umrah-package-2', destination: '/umrah-package' },
  { source: '/importance-of-umrah-according-to-islamic-traditions-2', destination: '/importance-of-umrah' },
  { source: '/how-to-perform-umrah-2', destination: '/how-to-perform-umrah' },
  { source: '/will-you-be-suffering-from-selfies-this-eid-2', destination: '/blogs' },
  { source: '/umrah-visa-bangladeshi-passport', destination: '/bangladeshi-passport-umrah-visa' },
  { source: '/5-star-hotel-in-makkah-and-madinah', destination: '/5-star-hotel-makkah-madinah' },
  { source: '/duaas-supplications-during-umrah', destination: '/duas-supplications-during-umrah' },

  // Expired years / old offers
  { source: '/golden-hajj-package-2022', destination: '/hajj-packages' },
  { source: '/golden-umrah-2022', destination: '/umrah-packages' },
  { source: '/umrah-package-2016', destination: '/umrah-packages' },
  { source: '/cheap-umrah-packages-2019', destination: '/cheapest-umrah-packages' },
  { source: '/umrah-in-rabi-al-awwal-2025', destination: '/umrah-packages' },
  { source: '/umrah-package-from-london-2025', destination: '/umrah-package-from-london' },
  { source: '/umrah-package-from-birmingham-2025', destination: '/umrah-package-from-birmingham' },
  { source: '/umrah-package-from-manchester-2025', destination: '/umrah-package-from-manchester' },
  { source: '/when-will-be-hajj-2016', destination: '/hajj-2027' },
  { source: '/when-is-hajj-2015-a-day-by-day-guide-to-holy-islamic-pilgrimage', destination: '/hajj-2027' },
  { source: '/2015-umrah-and-hajj-advices', destination: '/hajj-guide' },
  { source: '/launches-5-star-hajj-packages-for-pilgrims-in-the-uk', destination: '/hajj-packages' },
];
