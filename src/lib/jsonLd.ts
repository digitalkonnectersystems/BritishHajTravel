export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'British Hajj Travel LTD',
    url: 'https://britishhajjtravel.com',
    logo: 'https://britishhajjtravel.com/img/logo.png',
    description: 'Licensed British travel agency specializing in Hajj 2027, 5-Star Umrah packages, Saudi visas, airline tickets and luxury pilgrim accommodations.',
    telephone: '+1-905-624-8344',
    email: 'info@britishhajjtravel.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '3050 Confederation Pkwy, Unit 301',
      addressLocality: 'Mississauga',
      addressRegion: 'ON',
      postalCode: 'L5B 3Z6',
      addressCountry: 'CA',
    },
    areaServed: ['Mississauga', 'Milton', 'Toronto', 'Ontario', 'UK'],
    priceRange: '$$$',
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
      name: 'British Hajj Travel LTD',
    },
    offers: {
      '@type': 'Offer',
      price: pkg.price,
      priceCurrency: pkg.currency || '£',
      availability: 'https://schema.org/InStock',
    },
  };
}
