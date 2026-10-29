import {
  mysqlTable,
  int,
  varchar,
  text,
  boolean,
  timestamp,
  mysqlEnum,
  decimal,
  json,
  index,
  customType,
} from 'drizzle-orm/mysql-core';

const longtext = customType<{ data: string }>({
  dataType() {
    return 'longtext';
  },
});

// 1. Users & Administrator Accounts
export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 128 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['super_admin', 'admin', 'content_editor', 'enquiry_manager', 'seo_manager'])
    .notNull()
    .default('admin'),
  active: boolean('active').notNull().default(true),
  badgeBg: varchar('badge_bg', { length: 32 }).default('#0F766E'),
  badgeTextColor: varchar('badge_text_color', { length: 32 }).default('#FFFFFF'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 2. User Sessions
export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
});

// Database-backed session-signing secret (row id=1, value1).
// This value must NEVER be returned to the client or included in settings CRUD APIs.
export const systemSettings = mysqlTable('system_settings', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 191 }).notNull().unique(),
  value1: text('value1').notNull(),
  value2: text('value2'),
  value3: text('value3'),
  remarks: text('remarks'),
  status: boolean('status').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
});

// 2a. Administrative Activity Audit Log
export const activityLogs = mysqlTable('activity_logs', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 64 }).notNull(),
  userId: int('user_id'),
  ipAddress: varchar('ip_address', { length: 64 }),
  previousEntry: longtext('previous_entry'),
  newEntry: longtext('new_entry'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  statusIdx: index('activity_logs_status_idx').on(table.status),
  userIdx: index('activity_logs_user_id_idx').on(table.userId),
  createdIdx: index('activity_logs_created_at_idx').on(table.createdAt),
}));

// 2a. Package Categories (admin-managed grouping for Umrah/Hajj packages)
export const packageCategories = mysqlTable('package_categories', {
  id: int('id').autoincrement().primaryKey(),
  type: mysqlEnum('type', ['umrah', 'hajj']).notNull().default('umrah'),
  name: varchar('name', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  displayOrder: int('display_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 3. Packages (Hajj & Umrah)
export const packages = mysqlTable('packages', {
  id: int('id').autoincrement().primaryKey(),
  type: mysqlEnum('type', ['umrah', 'hajj']).notNull(),
  categoryId: int('category_id').references(() => packageCategories.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  shortDescription: text('short_description'),
  fullDescription: text('full_description'),
  featuredImage: text('featured_image'),
  month: varchar('month', { length: 100 }),
  year: int('year').default(2026),
  durationDays: int('duration_days').default(14),
  departureCity: varchar('departure_city', { length: 100 }).default('London'),
  destination: varchar('destination', { length: 100 }).default('Makkah & Madinah'),
  startingPrice: decimal('starting_price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('£'),
  starRating: varchar('star_rating', { length: 20 }).default('5 Star'),
  status: mysqlEnum('status', ['available', 'sold_out', 'coming_soon', 'draft'])
    .notNull()
    .default('available'),
  isFeatured: boolean('is_featured').notNull().default(false),
  inclusions: text('inclusions'),
  exclusions: text('exclusions'),
  cardData: json('card_data'),
  detailPageData: json('detail_page_data'),
  packagesGallery: json('packages_gallery'),
  seoSettings: json('seo_settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 3a. Destination landing pages and their selected package cards
export const destinations = mysqlTable('destinations', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  description: text('description'),
  sectionTitle: varchar('section_title', { length: 255 }).default('Packages for this destination'),
  bannerImages: json('banner_images'),
  packageIds: json('package_ids'),
  packagesData: json('packages_data'),
  packageData: json('package_data'),
  status: mysqlEnum('status', ['published', 'draft']).notNull().default('published'),
  displayOrder: int('display_order').notNull().default(0),
  seoSettings: json('seo_settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 4. Package Multi-Tier Pricing
export const packagePrices = mysqlTable('package_prices', {
  id: int('id').autoincrement().primaryKey(),
  packageId: int('package_id')
    .notNull()
    .references(() => packages.id, { onDelete: 'cascade' }),
  occupancyType: mysqlEnum('occupancy_type', [
    'quad',
    'triple',
    'double',
    'single',
    'child_with_bed',
    'child_no_bed',
    'infant',
  ]).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  notes: varchar('notes', { length: 255 }),
});

// 5. Package Hotels
export const packageHotels = mysqlTable('package_hotels', {
  id: int('id').autoincrement().primaryKey(),
  packageId: int('package_id')
    .notNull()
    .references(() => packages.id, { onDelete: 'cascade' }),
  hotelName: varchar('hotel_name', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  starRating: varchar('star_rating', { length: 20 }).default('5 Star'),
  nights: int('nights').default(5),
  distanceFromHaram: varchar('distance_from_haram', { length: 255 }),
  imageUrl: text('image_url'),
});

// 6. Visa Services
export const visaServices = mysqlTable('visa_services', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  shortDescription: text('short_description'),
  fullDescription: text('full_description'),
  processingTime: varchar('processing_time', { length: 100 }).default('3-5 Business Days'),
  requirements: text('requirements'),
  imageUrl: text('image_url'),
  isPublished: boolean('is_published').notNull().default(true),
  displayOrder: int('display_order').default(0),
  seoSettings: json('seo_settings'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Lead Management & Enquiries CRM
export const enquiries = mysqlTable('enquiries', {
  id: int('id').autoincrement().primaryKey(),
  enquiryNumber: varchar('enquiry_number', { length: 128 }).notNull().unique(),
  type: mysqlEnum('type', ['quote_request', 'package_enquiry', 'visa_enquiry', 'general_contact', 'flight_enquiry'])
    .notNull()
    .default('quote_request'),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  whatsapp: varchar('whatsapp', { length: 50 }),
  city: varchar('city', { length: 100 }),
  province: varchar('province', { length: 100 }),
  packageId: int('package_id').references(() => packages.id, { onDelete: 'set null' }),
  visaServiceId: int('visa_service_id').references(() => visaServices.id, { onDelete: 'set null' }),
  preferredPackageType: varchar('preferred_package_type', { length: 100 }),
  departureMonth: varchar('departure_month', { length: 50 }),
  adults: int('adults').default(1),
  children: int('children').default(0),
  infants: int('infants').default(0),
  occupancy: varchar('occupancy', { length: 50 }),
  message: text('message'),
  status: mysqlEnum('status', [
    'new',
    'contacted',
    'qualified',
    'quotation_sent',
    'followup_required',
    'booked',
    'closed',
    'spam',
  ])
    .notNull()
    .default('new'),
  internalNotes: text('internal_notes'),
  assignedStaff: varchar('assigned_staff', { length: 255 }),
  sourceForm: varchar('source_form', { length: 255 }),
  emailTo: text('email_to'),
  emailCc: text('email_cc'),
  emailBcc: text('email_bcc'),
  emailSubject: varchar('email_subject', { length: 500 }),
  emailHtml: longtext('email_html'),
  emailDeliveryStatus: varchar('email_delivery_status', { length: 32 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 7a. Dedicated Table: Get a Free Quote Form
export const quoteEnquiries = mysqlTable('quote_enquiries', {
  id: int('id').autoincrement().primaryKey(),
  enquiryNumber: varchar('enquiry_number', { length: 128 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  packageType: varchar('package_type', { length: 100 }).default('Umrah Package'),
  numberOfPilgrims: int('number_of_pilgrims').default(1),
  status: varchar('status', { length: 50 }).default('new'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 7b. Dedicated Table: Package Detail Sidebar Booking Form
export const packageBookingEnquiries = mysqlTable('package_booking_enquiries', {
  id: int('id').autoincrement().primaryKey(),
  bookingNumber: varchar('booking_number', { length: 128 }).notNull().unique(),
  packageId: int('package_id'),
  packageName: varchar('package_name', { length: 255 }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  adults: int('adults').default(1),
  children: int('children').default(0),
  infants: int('infants').default(0),
  startDate: varchar('start_date', { length: 100 }),
  totalPrice: varchar('total_price', { length: 50 }),
  status: varchar('status', { length: 50 }).default('new'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 7c. Dedicated Table: Contact Us & Get In Touch Forms
export const contactEnquiries = mysqlTable('contact_enquiries', {
  id: int('id').autoincrement().primaryKey(),
  ticketNumber: varchar('ticket_number', { length: 128 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  website: varchar('website', { length: 255 }),
  packageType: varchar('package_type', { length: 100 }),
  message: text('message'),
  status: varchar('status', { length: 50 }).default('new'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 7d. Dedicated Table: Saudi Visa Consultations Form
export const visaEnquiries = mysqlTable('visa_enquiries', {
  id: int('id').autoincrement().primaryKey(),
  enquiryNumber: varchar('enquiry_number', { length: 128 }).notNull().unique(),
  visaServiceId: int('visa_service_id'),
  visaTitle: varchar('visa_title', { length: 255 }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  travelersCount: int('travelers_count').default(1),
  nationality: varchar('nationality', { length: 100 }).default('British'),
  message: text('message'),
  status: varchar('status', { length: 50 }).default('new'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 7e. Dedicated Table: Flight Inquiries Form
export const flightEnquiries = mysqlTable('flight_enquiries', {
  id: int('id').autoincrement().primaryKey(),
  enquiryNumber: varchar('enquiry_number', { length: 128 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  originCity: varchar('origin_city', { length: 100 }).default('London (LHR)'),
  destinationCity: varchar('destination_city', { length: 100 }).default('Jeddah (JED)'),
  departureDate: varchar('departure_date', { length: 100 }),
  returnDate: varchar('return_date', { length: 100 }),
  tripType: varchar('trip_type', { length: 50 }).default('Round Trip'),
  passengers: int('passengers').default(1),
  flightClass: varchar('flight_class', { length: 50 }).default('Economy'),
  message: text('message'),
  status: varchar('status', { length: 50 }).default('new'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 8. Blog Posts & Articles
export const blogPosts = mysqlTable('blog_posts', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 128 }).unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredImage: text('featured_image'),
  category: varchar('category', { length: 100 }).default('Pilgrimage Guide'),
  authorName: varchar('author_name', { length: 100 }).default('British Hajj Travel Editorial'),
  isPublished: boolean('is_published').notNull().default(true),
  publishedAt: timestamp('published_at'),
  seoSettings: json('seo_settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 9. Site Settings
export const siteSettings = mysqlTable('site_settings', {
  id: int('id').autoincrement().primaryKey(),
  key: varchar('key', { length: 128 }).notNull().unique(),
  value: longtext('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 10. Dynamic Pages (CMS)
export const sitePages = mysqlTable('site_pages', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  status: mysqlEnum('status', ['published', 'draft']).notNull().default('published'),
  showInMenu: boolean('show_in_menu').notNull().default(true),
  parentPage: varchar('parent_page', { length: 128 }),
  guideCategory: varchar('guide_category', { length: 20 }),
  guideCardData: text('guide_card_data'),
  bannerBgImage: text('banner_bg_image'),
  bannerPosition: varchar('banner_position', { length: 50 }).default('center center'),
  bannerSize: varchar('banner_size', { length: 50 }).default('cover'),
  bannerTitle: text('banner_title'),
  bannerDescription: text('banner_description'),
  sections: longtext('sections'),
  richText: longtext('rich_text'),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  seoSettings: json('seo_settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Separate CMS for each homepage visa-processing card; identical columns to site_pages.
export const visaProcessing = mysqlTable('visa_processing', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  status: mysqlEnum('status', ['published', 'draft']).notNull().default('published'),
  showInMenu: boolean('show_in_menu').notNull().default(true),
  parentPage: varchar('parent_page', { length: 128 }),
  guideCategory: varchar('guide_category', { length: 20 }),
  guideCardData: text('guide_card_data'),
  bannerBgImage: text('banner_bg_image'),
  bannerPosition: varchar('banner_position', { length: 50 }).default('center center'),
  bannerSize: varchar('banner_size', { length: 50 }).default('cover'),
  bannerTitle: text('banner_title'),
  bannerDescription: text('banner_description'),
  sections: longtext('sections'),
  richText: longtext('rich_text'),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  seoSettings: json('seo_settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});


// 10a. Hotel Directory
export const hotelCategories = mysqlTable('hotel_categories', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  displayOrder: int('display_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const hotels = mysqlTable('hotels', {
  id: int('id').autoincrement().primaryKey(),
  categoryId: int('category_id')
    .notNull()
    .references(() => hotelCategories.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  city: varchar('city', { length: 120 }).notNull(),
  imageUrl: text('image_url'),
  rating: decimal('rating', { precision: 2, scale: 1 }).default('5.0'),
  description: text('description'),
  priceLabel: varchar('price_label', { length: 100 }).default('TBC'),
  pricePeriod: varchar('price_period', { length: 50 }).default('per Night'),
  websiteUrl: text('website_url').notNull(),
  displayOrder: int('display_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  categoryOrderIdx: index('hotels_category_order_idx').on(table.categoryId, table.displayOrder),
}));

// 11. Sitemap Configs
export const sitemapConfigs = mysqlTable('sitemap_configs', {
  id: int('id').autoincrement().primaryKey(),
  contentType: varchar('content_type', { length: 128 }).notNull().unique(), // 'global', 'sitePages', 'packages', etc.
  includeInSitemap: boolean('include_in_sitemap').default(true),
  changeFrequency: varchar('change_frequency', { length: 50 }).default('monthly'),
  priority: decimal('priority', { precision: 3, scale: 1 }).default('0.5'),
  includeImages: boolean('include_images').default(true),
  includeLastModified: boolean('include_last_modified').default(true),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// 12. Sitemap Logs
export const sitemapLogs = mysqlTable('sitemap_logs', {
  id: int('id').autoincrement().primaryKey(),
  action: varchar('action', { length: 50 }).notNull(), // 'generate', 'submit'
  status: varchar('status', { length: 50 }).notNull(), // 'success', 'error', 'warning'
  details: json('details'), // JSON holding file size, total urls, warnings, errors
  triggeredBy: varchar('triggered_by', { length: 128 }).default('system'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 13. Email Delivery Logs
export const emailDeliveryLogs = mysqlTable('email_delivery_logs', {
  id: int('id').autoincrement().primaryKey(),
  formId: varchar('form_id', { length: 255 }).notNull(),
  status: mysqlEnum('status', ['Delivered', 'Failed']).notNull(),
  sentTo: varchar('sent_to', { length: 255 }).notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});
// Normalized Hajj/Umrah customization enquiries (no JSON payloads).
export const customizedPackageEnquiries = mysqlTable('customized_package_enquiries', {
  id: int('id').autoincrement().primaryKey(),
  enquiryNumber: varchar('enquiry_number', { length: 64 }).notNull().unique(),
  category: mysqlEnum('category', ['hajj', 'umrah']).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 254 }).notNull(),
  phone: varchar('phone', { length: 13 }).notNull(),
  departureAirport: varchar('departure_airport', { length: 160 }).notNull(),
  departureDate: timestamp('departure_date'),
  numberOfDays: int('number_of_days').notNull(),
  adults: int('adults').notNull().default(1),
  children: int('children').notNull().default(0),
  infants: int('infants').notNull().default(0),
  airlinePreference: varchar('airline_preference', { length: 255 }),
  makkahHotel: varchar('makkah_hotel', { length: 255 }),
  madinahHotel: varchar('madinah_hotel', { length: 255 }),
  hotelStandard: varchar('hotel_standard', { length: 70 }),
  roomOccupancy: varchar('room_occupancy', { length: 70 }),
  transportation: varchar('transportation', { length: 120 }),
  budgetGbp: decimal('budget_gbp', { precision: 12, scale: 2 }),
  notes: text('notes'),
  status: mysqlEnum('status', ['new', 'contacted', 'qualified', 'closed', 'spam']).notNull().default('new'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({ categoryIdx: index('customized_enquiries_category_idx').on(table.category, table.status) }));

export const customizedEnquiryFeatures = mysqlTable('customized_enquiry_features', {
  id: int('id').autoincrement().primaryKey(),
  enquiryId: int('enquiry_id').notNull().references(() => customizedPackageEnquiries.id, { onDelete: 'cascade' }),
  featureType: mysqlEnum('feature_type', ['service', 'requirement']).notNull(),
  featureName: varchar('feature_name', { length: 140 }).notNull(),
  status: varchar('status', { length: 24 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({ enquiryIdx: index('customized_features_enquiry_idx').on(table.enquiryId) }));

export const redirectRules = mysqlTable('redirect_rules', {
  id: int('id').autoincrement().primaryKey(),
  sourcePath: varchar('source_path', { length: 500 }).notNull().unique(),
  destinationPath: varchar('destination_path', { length: 500 }).notNull(),
  httpCode: int('http_code').notNull().default(308),
  status: mysqlEnum('status', ['active','disabled']).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
});
export const notFoundHits = mysqlTable('not_found_hits', {
  id: int('id').autoincrement().primaryKey(),
  requestPath: varchar('request_path', { length: 500 }).notNull().unique(),
  hits: int('hits').notNull().default(1),
  lastSeen: timestamp('last_seen').defaultNow(),
  status: varchar('status', {length: 30}).notNull().default('unresolved'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
});
export const backendLogs = mysqlTable('backend_logs', {
  id: int('id').autoincrement().primaryKey(),
  severity: mysqlEnum('severity', ['info', 'warning', 'error']).notNull(),
  category: varchar('category', { length: 70 }).notNull(),
  message: text('message').notNull(),
  source: varchar('source', { length: 191 }),
  status: varchar('status', { length: 30 }).notNull().default('open'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
}, table => ({createdIdx:index('backend_logs_created_idx').on(table.createdAt)}));

export const mediaFiles = mysqlTable('media_files', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', {length:255}).notNull(),
  relativePath: varchar('relative_path', {length:700}).notNull().unique(),
  contentHash: varchar('content_hash', {length:64}),
  mimeType: varchar('mime_type', {length:120}).notNull(),
  sizeBytes: int('size_bytes').notNull().default(0),
  storage: mysqlEnum('storage', ['local','public','blob','remote']).notNull().default('local'),
  status: mysqlEnum('status', ['active','trash']).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  deletedAt: timestamp('deleted_at'),
}, table => ({
  statusIdx: index('media_files_status_idx').on(table.status),
  hashIdx: index('media_files_hash_idx').on(table.contentHash),
}));
