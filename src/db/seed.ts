import { db } from './index';
import * as schema from './schema';

export async function seedDatabase() {
  console.log('Seeding King Travel Can Ltd database...');

  try {
    // 1. Seed Site Settings
    const defaultSettings = [
      { key: 'site_name', value: 'King Travel Can Ltd' },
      { key: 'phone', value: '+1 (905) 624-8344' },
      { key: 'whatsapp_general', value: '19056248344' },
      { key: 'email', value: 'info@kingtravel.ca' },
      { key: 'address_mississauga', value: '3050 Confederation Pkwy, Unit 301, Mississauga, ON L5B 3Z6, UK' },
      { key: 'announcement_enabled', value: 'true' },
      { key: 'announcement_text', value: 'Hajj 2027 Priority Registration Now Open! Limited seats available.' },
      { key: 'announcement_link', value: '/hajj/priority-list' },
    ];

    for (const setting of defaultSettings) {
      await db.insert(schema.siteSettings)
        .values(setting)
        .onDuplicateKeyUpdate({ set: { value: setting.value } });
    }

    // 2. Seed Umrah & Hajj Packages
    const initialPackages = [
      {
        title: 'Customize Umrah Package 2026',
        slug: 'customized-umrah-package-2026',
        type: 'umrah' as const,
        month: 'Flexible 2026 (10, 15 Days)',
        startingPrice: '1995.00',
        starRating: '5 Star',
        status: 'available' as const,
        featuredImage: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80',
        inclusions: JSON.stringify([
          'Return Flights from Toronto (YYZ)',
          '5-Star Hotels in Makkah & Madinah',
          'Saudi Tourist / Umrah Visa Assistance',
          'Luxury Air-Conditioned Transfers',
          'Guided Ziyarat in Makkah & Madinah',
          '24/7 Canadian Ground Support Staff',
        ]),
      },
      {
        title: 'August 5-Star Umrah Package 2026',
        slug: 'august-5-star-umrah-package-2026',
        type: 'umrah' as const,
        month: 'August 2026 (12 Nights)',
        startingPrice: '2695.00',
        starRating: '5 Star',
        status: 'available' as const,
        featuredImage: 'https://images.unsplash.com/photo-1553755088-ef1973c7b4a1?auto=format&fit=crop&w=700&q=80',
        inclusions: JSON.stringify([
          'Swissotel Makkah (5★ - 0m from Haram)',
          'Dar Al Iman InterContinental Madinah (5★ - 0m from Prophet\'s Mosque)',
          'Direct Saudi Airlines / Turkish Airlines Flights',
          'High-Speed Haramain Train Transfers',
          'Complimentary Ihram Kit & Zamzam Water',
          'Group Imam Leadership & Religious Seminars',
        ]),
      },
      {
        title: 'September 5-Star Umrah Package 2026',
        slug: 'september-5-star-umrah-package-2026',
        type: 'umrah' as const,
        month: 'September 2026 (14 Nights)',
        startingPrice: '2795.00',
        starRating: '5 Star',
        status: 'available' as const,
        featuredImage: 'https://images.unsplash.com/photo-1577295605163-132e25c3c914?auto=format&fit=crop&w=900&q=80',
        inclusions: JSON.stringify([
          'Pullman Zamzam Makkah (5★ - Abraj Al Bait)',
          'Pullman Zamzam Madina (5★ - Central Area)',
          'Complete Visa Endorsement & Health Insurance',
          'VIP Private GMC Airport & Intercity Transport',
          'Historical Ziyarat Tours (Uhud, Quba, Badar)',
          'Multilingual Canadian Tour Operations Manager',
        ]),
      },
      {
        title: 'October 5-Star Umrah Package 2026',
        slug: 'october-5-star-umrah-package-2026',
        type: 'umrah' as const,
        month: 'October 2026 (14 Nights)',
        startingPrice: '2995.00',
        starRating: '5 Star',
        status: 'available' as const,
        featuredImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80',
        inclusions: JSON.stringify([
          'Raffles Makkah Palace (5★ Luxury Suites)',
          'Oberoi Madinah (5★ Deluxe Court View)',
          'Full Breakfast Buffet Included Daily',
          'Nusuk Rawdah Permitting Assistance',
          '5-Star VIP Ground Coordination',
          'Luggage Handling & Airport Meet & Greet',
        ]),
      },
    ];

    for (const pkg of initialPackages) {
      await db.insert(schema.packages)
        .values(pkg)
        .onDuplicateKeyUpdate({ set: { startingPrice: pkg.startingPrice, month: pkg.month } });
    }

    // 3. Seed Saudi Visa Services
    const visas = [
      {
        title: 'Tourist Visa',
        slug: 'tourist-visa',
        shortDescription: 'Only passport required. Explore the beauty and culture of Saudi Arabia effortlessly.',
        fullDescription: 'The Saudi Tourist eVisa allows Canadian citizens and residents to visit Saudi Arabia for leisure, family visits, or performing Umrah. Multiple entry visa valid for 1 year with stays up to 90 days.',
        processingTime: '24-48 Hours',
        requirements: JSON.stringify(['Valid Passport (min. 6 months validity)', 'Passport Size Photo (White Background)', 'Canadian PR / Citizenship Proof']),
        imageUrl: '/img/saudi-visa-1.webp',
        isPublished: true,
        displayOrder: 1,
      },
      {
        title: 'Umrah Visa',
        slug: 'umrah-visa',
        shortDescription: 'Requires passport and PR Card or proof of residence. Official Umrah visa processing with ground service options.',
        fullDescription: 'Dedicated Umrah visa issued specifically for spiritual pilgrimage to Makkah and Madinah with full Nusuk authorization and medical insurance included.',
        processingTime: '2-4 Business Days',
        requirements: JSON.stringify(['Passport Copy', 'Canadian Status Document', 'Vaccination Records', 'Confirmed Flight Itinerary']),
        imageUrl: '/img/saudi-visa-2.webp',
        isPublished: true,
        displayOrder: 2,
      },
      {
        title: 'Family Visit Visa',
        slug: 'family-visit-visa',
        shortDescription: 'Complete list of requirements sent via email. Reunite with your family in Saudi Arabia quickly.',
        fullDescription: 'Facilitating family reunification in the Kingdom of Saudi Arabia. We handle complete documentation, MOFA verification, and submission.',
        processingTime: '3-5 Business Days',
        requirements: JSON.stringify(['Sponsor Iqama & Invitation Letter', 'Proof of Kinship/Relationship', 'Applicant Passport']),
        imageUrl: '/img/saudi-visa-3.jpg',
        isPublished: true,
        displayOrder: 3,
      },
      {
        title: 'Resident Iqama Visa',
        slug: 'resident-iqama-visa',
        shortDescription: 'Simplify your residency process with expert guidance from King Travel.',
        fullDescription: 'Comprehensive assistance for Canadian residents holding Saudi employment or family residency permits (Iqama endorsement and stamping).',
        processingTime: '5-7 Business Days',
        requirements: JSON.stringify(['Official MOFA Stamped Visa Block', 'Medical Examination Report', 'Police Clearance Certificate']),
        imageUrl: '/img/saudi-visa-4.webp',
        isPublished: true,
        displayOrder: 4,
      },
      {
        title: 'Business Visit Visa',
        slug: 'business-visit-visa',
        shortDescription: 'Expand your business horizons in Saudi Arabia with authorized commercial visa processing.',
        fullDescription: 'Fast-track business visas for corporate representatives, investors, and consultants travelling to Saudi Arabia for commercial meetings or exhibitions.',
        processingTime: '2-3 Business Days',
        requirements: JSON.stringify(['Saudi Chamber Invitation Letter', 'Canadian Employer Support Letter', 'Valid Passport']),
        imageUrl: '/img/saudi-visa-5.webp',
        isPublished: true,
        displayOrder: 5,
      },
      {
        title: 'Work Visa Assistance',
        slug: 'work-visa-assistance',
        shortDescription: 'Begin your career in Saudi Arabia with professional visa stamping and document verification.',
        fullDescription: 'Full service work visa endorsement including degree attestation assistance, medical authorization, and embassy submission.',
        processingTime: '5-10 Business Days',
        requirements: JSON.stringify(['Attested Educational Diplomas', 'Signed Employment Contract', 'Medical Fitness Certificate']),
        imageUrl: '/img/saudi-visa-6.jpg',
        isPublished: true,
        displayOrder: 6,
      },
    ];

    for (const visa of visas) {
      await db.insert(schema.visaServices)
        .values(visa)
        .onDuplicateKeyUpdate({ set: { shortDescription: visa.shortDescription } });
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
