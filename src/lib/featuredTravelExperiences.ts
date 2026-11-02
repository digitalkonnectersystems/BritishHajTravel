/** CMS seed data only: all public-facing text and links live in site_pages.sections. */
export type FeaturedTravelCard = {
  id: string;
  icon: 'landmark' | 'plane' | 'ship' | 'globe';
  title: string;
  description: string;
  details: string;
  buttonLabel: string;
  buttonHref: string;
  image: string;
  visible: boolean;
};

export type FeaturedTravelSectionData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: FeaturedTravelCard[];
};

export const DEFAULT_FEATURED_TRAVEL_SECTION: FeaturedTravelSectionData = {
  eyebrow: 'DISCOVER MORE',
  title: 'Explore More Ways to Travel',
  subtitle: 'Discover Al Aqsa and Umrah journeys, special flight fares, halal cruises, and worldwide holiday experiences.',
  items: [
    {
      id: 'al-aqsa-umrah', icon: 'landmark', title: 'Al Aqsa & Umrah Journey',
      description: 'Ask us about a combined Masjid Al Aqsa and Umrah journey.',
      details: 'Masjid Al Aqsa\nUmrah pilgrimage\nContact us for itinerary details',
      buttonLabel: 'Enquire Now', buttonHref: '/contact', image: '', visible: true,
    },
    {
      id: 'special-flight-fares', icon: 'plane', title: 'Special Flight Fares',
      description: 'Ask our flight team about fares for these destinations.',
      details: 'Pakistan · India · Bangladesh · Afghanistan\nTürkiye · Dubai · Egypt',
      buttonLabel: 'Enquire About Flights', buttonHref: '/flights', image: '', visible: true,
    },
    {
      id: 'halal-cruise-umrah', icon: 'ship', title: 'Halal Cruise & Umrah',
      description: 'Enquire about cruise and Umrah travel options.',
      details: 'Istanbul to Jeddah\nCruise and Umrah enquiries',
      buttonLabel: 'Ask for Details', buttonHref: '/contact', image: '', visible: true,
    },
    {
      id: 'worldwide-halal-holidays', icon: 'globe', title: 'Worldwide Halal Holidays',
      description: 'Explore holiday ideas and request a tailored itinerary.',
      details: 'Dubai · Sharm El Sheikh\nAntalya · Maldives\nAnd many more destinations',
      buttonLabel: 'Plan Your Holiday', buttonHref: '/contact', image: '', visible: true,
    },
  ],
};

export function safeTravelCardHref(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const href = value.trim();
  // Relative links, https links and telephone/mail links; prevent javascript/data URLs.
  if (/^\/(?!\/)[^\r\n]*$/.test(href)) return href;
  if (/^https:\/\/[^\s]+$/i.test(href)) return href;
  if (/^(tel:|mailto:)[^\s]+$/i.test(href)) return href;
  return null;
}
