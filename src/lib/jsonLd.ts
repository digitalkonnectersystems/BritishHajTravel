export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': 'https://www.britishhajtravel.com/#organization',
    name: 'British Haj Travel Ltd',
    url: 'https://www.britishhajtravel.com/',
    logo: 'https://www.britishhajtravel.com/images_BHT/branding/footer-logo-1788411772195.png',
    description: 'Licensed British travel agency specializing in Hajj 2027, 5-Star Umrah packages, Saudi visas, airline tickets and luxury pilgrim accommodations.',
    telephone: '+447957197390',
    email: 'info@britishhajjtravel.com',
    currenciesAccepted: 'GBP',
    inLanguage: 'en-GB',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '242 Deepdale Road',
      addressLocality: 'Preston',
      addressRegion: 'Lancashire',
      postalCode: 'PR1 6QB',
      addressCountry: 'GB',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United Kingdom',
    },
    priceRange: '£££',
  };
}

export function getPackageJsonLd(pkg: { title: string; description: string; price: string; currency: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Trip',
    name: pkg.title,
    description: pkg.description,
    provider: {
      '@type': 'TravelAgency',
      name: 'British Haj Travel Ltd',
    },
    offers: {
      '@type': 'Offer',
      price: pkg.price,
      priceCurrency: pkg.currency || '£',
      availability: 'https://schema.org/InStock',
    },
  };
}
