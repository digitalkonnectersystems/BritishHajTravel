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

/**
 * 308 redirects for dead links (pages that return 404).
 * Found by crawling every sitemap page on 23 Nov 2026, plus the Search Console 404 report.
 * Most are old WordPress package URLs still linked from blog posts.
 * Exact paths come first; the category patterns at the end catch any other old package URL.
 */
export const DEAD_LINK_REDIRECTS = [
  { source: '/hajj-agent-in-uk', destination: '/nusuk-hajj-agent' },
  { source: '/about-us', destination: '/about' },
  { source: '/win-free-umrah', destination: '/umrah-packages' },
  { source: '/ramadan', destination: '/ramadan-umrah-packages' },
  { source: '/audi-umrah-visa', destination: '/saudi-umrah-visa' },
  { source: '/cheapest-umrah-packages-2018', destination: '/cheapest-umrah-packages' },
  { source: '/islam-first-to-teach-toleranc', destination: '/islam-first-to-teach-tolerance' },
  { source: '/products', destination: '/services' },
  { source: '/a-piece-about-hajj-experience', destination: '/a-piece-about-hajj-experience-2' },
  { source: '/package/hajj-packages/vip-hajj', destination: '/package/vip-hajj-2027' },
  { source: '/package/hajj-packages/golden-hajj', destination: '/package/5-star-hajj-package-2027' },
  { source: '/package/hajj-packages/silver-hajj', destination: '/hajj-packages' },
  { source: '/package/umrah-packages/vip-umrah-14-nights', destination: '/vip-umrah' },
  { source: '/package/umrah-packages/umrah-package', destination: '/umrah-package' },
  { source: '/package/umrah-packages/golden-umrah-package', destination: '/umrah-packages' },
  { source: '/package/umrah-packages/deluxe-umrah-package', destination: '/umrah-packages' },
  { source: '/package/umrah-packages/ramadan-umrah-package-14-night', destination: '/ramadan-umrah-packages' },
  { source: '/package/umrah-packages/ramadan-umrah-package-16-night', destination: '/ramadan-umrah-packages' },
  { source: '/package/umrah-packages/ramadan-umrah-package-21-night', destination: '/ramadan-umrah-packages' },
  { source: '/package/ramadan-umrah/ramadan-umrah-package-14-night', destination: '/ramadan-umrah-packages' },
  // Any other old WordPress package URL (/package/<category>/<slug>)
  { source: '/package/hajj-packages/:slug', destination: '/hajj-packages' },
  { source: '/package/umrah-packages/:slug', destination: '/umrah-packages' },
  { source: '/package/ramadan-umrah/:slug', destination: '/ramadan-umrah-packages' },
];
