/** Historic departures transcribed from the previous British Haj Travel website.
 * No prices, flights, visa, insurance or transport inclusions are invented.
 * Package images are extracted from client-supplied screenshots, and can be
 * replaced later by high resolution originals.
 */
export type HistoricUmrahPackage = {
  key: string;
  title: string;
  range: string;
  duration: string;
  photo: string;
  makkah: string;
  madinah: string;
  makkahNights: string;
  madinahNights: string;
  board: string;
  roomStatus: string;
  facilities: { label: string; value: string }[];
};
export type SeasonalUmrahPageData = {
  slug: string;
  title: string;
  intro: string;
  bannerImage: string;
  packages: HistoricUmrahPackage[];
};
const emptyInclusions = [
  'Meals', 'Visa', 'Transport', 'Flights', 'Insurance', 'Ziyarat',
].map(label => ({ label, value: 'Not specified on original listing' }));

export const seasonalUmrahPages: Record<'march' | 'august', SeasonalUmrahPageData> = {
  march: {
    slug: '/march-umrah-packages',
    title: 'March Umrah Packages 2026',
    intro: 'Explore the March 2026 Umrah itineraries previously offered by British Haj Travel, including hotel arrangements and room options.',
    bannerImage: '/seasonal-umrah/march-hotel-2.jpg',
    packages: [
      {
        key: 'ramadhan-march-2026',
        title: 'RAMADHAN UMRAH PACKAGE 2026',
        range: '05 March to 20 March 2026',
        duration: '05 March to 20 March',
        photo: '/seasonal-umrah/march-hotel-1.jpg',
        makkah: 'Safwa Tower',
        madinah: 'Al Haram Hotel',
        makkahNights: '5 nights',
        madinahNights: '5 nights',
        board: 'BB',
        roomStatus: 'Available on original listing; current availability unconfirmed',
        facilities: emptyInclusions,
      },
      {
        key: 'late-march-2026',
        title: 'Umrah Package in March 2026',
        range: '30 March to 12 April 2026',
        duration: '10 Nights (as listed)',
        photo: '/seasonal-umrah/march-hotel-2.jpg',
        makkah: 'Hayat Regency or Movenpick in Clock Tower',
        madinah: 'Worth Peninsula or Al Haram Hotel',
        makkahNights: '5 nights',
        madinahNights: '5 nights',
        board: 'BB',
        roomStatus: 'Available on original listing; current availability unconfirmed',
        facilities: emptyInclusions,
      },
    ],
  },
  august: {
    slug: '/august-umrah-packages',
    title: 'August Umrah Packages 2026',
    intro: 'Review the August 2026 Umrah itinerary from the previous website, including the hotels and occupancy options.',
    bannerImage: '/seasonal-umrah/august-hotel.jpg',
    packages: [
      {
        key: 'august-2026',
        title: 'Umrah Package in August 2026',
        range: '05 August to 17 August 2026',
        duration: '10 Nights (as listed)',
        photo: '/seasonal-umrah/august-hotel.jpg',
        makkah: 'Hayat Regency or Movenpick in Clock Tower',
        madinah: 'Worth Peninsula or Al Haram Hotel',
        makkahNights: '5 nights',
        madinahNights: '5 nights',
        board: 'BB',
        roomStatus: 'TBC',
        facilities: emptyInclusions,
      },
    ],
  },
};

/** Only URLs requested by the client or already present in the supplied website. */
export const relatedUmrahPages = [
  { label: 'Ramadan Umrah 2027', href: '/ramadan-umrah-packages', detail: 'Ramadan Umrah options' },
  { label: 'March Umrah Packages 2026', href: '/march-umrah-packages', detail: 'Explore historic March departures' },
  { label: 'August Umrah Packages 2026', href: '/august-umrah-packages', detail: 'Explore historic August departures' },
  { label: 'October Umrah Packages 2026', href: '/october-umrah-packages', detail: 'October departures' },
  { label: 'December Umrah Packages 2026', href: '/december-umrah-packages', detail: 'December departures' },
  { label: 'Nusuk Umrah Guide', href: '/umrah-guide', detail: 'Plan and prepare' },
  { label: 'All Umrah Packages', href: '/umrah-packages', detail: 'Browse current options' },
];
