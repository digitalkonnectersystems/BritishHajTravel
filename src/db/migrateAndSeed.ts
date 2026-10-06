import mysql from 'mysql2/promise';
import { db } from './index';
import { users } from './schema';
import { seedDatabase } from './seed';
import { hashPassword } from '@/lib/password';

async function runMigrationAndSeed() {
  console.log('Connecting to MySQL and ensuring database tables exist...');

  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'bht_travel_db';

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    console.log(`Creating database \`${database}\` if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.query(`USE \`${database}\`;`);

    const tableStatements = [
      `CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`email\` varchar(128) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`role\` enum('super_admin','admin','content_editor','enquiry_manager','seo_manager') NOT NULL DEFAULT 'admin',
        \`active\` boolean NOT NULL DEFAULT true,
        \`badge_bg\` varchar(32) DEFAULT '#0F766E',
        \`badge_text_color\` varchar(32) DEFAULT '#FFFFFF',
        \`created_at\` timestamp DEFAULT (now()),
        \`updated_at\` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`users_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`users_email_unique\` UNIQUE(\`email\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`sessions\` (
        \`id\` varchar(128) NOT NULL,
        \`user_id\` int NOT NULL,
        \`expires_at\` timestamp NOT NULL,
        CONSTRAINT \`sessions_id\` PRIMARY KEY(\`id\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`packages\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`type\` enum('umrah','hajj') NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`slug\` varchar(128) NOT NULL,
        \`short_description\` text,
        \`full_description\` text,
        \`featured_image\` text,
        \`month\` varchar(100),
        \`year\` int DEFAULT 2026,
        \`duration_days\` int DEFAULT 14,
        \`departure_city\` varchar(100) DEFAULT 'Toronto',
        \`destination\` varchar(100) DEFAULT 'Makkah & Madinah',
        \`starting_price\` decimal(10,2) NOT NULL,
        \`currency\` varchar(10) DEFAULT '£',
        \`star_rating\` varchar(20) DEFAULT '5 Star',
        \`status\` enum('available','sold_out','coming_soon','draft') NOT NULL DEFAULT 'available',
        \`is_featured\` boolean NOT NULL DEFAULT false,
        \`inclusions\` text,
        \`exclusions\` text,
        \`created_at\` timestamp DEFAULT (now()),
        \`updated_at\` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`packages_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`packages_slug_unique\` UNIQUE(\`slug\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`visa_services\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`slug\` varchar(128) NOT NULL,
        \`short_description\` text,
        \`full_description\` text,
        \`processing_time\` varchar(100) DEFAULT '3-5 Business Days',
        \`requirements\` text,
        \`image_url\` text,
        \`is_published\` boolean NOT NULL DEFAULT true,
        \`display_order\` int DEFAULT 0,
        \`seo_settings\` longtext NULL,
        \`created_at\` timestamp DEFAULT (now()),
        CONSTRAINT \`visa_services_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`visa_services_slug_unique\` UNIQUE(\`slug\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`enquiries\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`enquiry_number\` varchar(128) NOT NULL,
        \`type\` enum('quote_request','package_enquiry','visa_enquiry','general_contact','flight_enquiry') NOT NULL DEFAULT 'quote_request',
        \`full_name\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`phone\` varchar(50) NOT NULL,
        \`whatsapp\` varchar(50),
        \`city\` varchar(100),
        \`province\` varchar(100),
        \`package_id\` int,
        \`visa_service_id\` int,
        \`preferred_package_type\` varchar(100),
        \`departure_month\` varchar(50),
        \`adults\` int DEFAULT 1,
        \`children\` int DEFAULT 0,
        \`infants\` int DEFAULT 0,
        \`occupancy\` varchar(50),
        \`message\` text,
        \`status\` enum('new','contacted','qualified','quotation_sent','followup_required','booked','closed','spam') NOT NULL DEFAULT 'new',
        \`internal_notes\` text,
        \`assigned_staff\` varchar(255),
        \`source_form\` varchar(255),
        \`email_to\` text,
        \`email_cc\` text,
        \`email_bcc\` text,
        \`email_subject\` varchar(500),
        \`email_html\` text,
        \`email_delivery_status\` varchar(32),
        \`created_at\` timestamp DEFAULT (now()),
        \`updated_at\` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`enquiries_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`enquiries_enquiry_number_unique\` UNIQUE(\`enquiry_number\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`site_settings\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`key\` varchar(128) NOT NULL,
        \`value\` text NOT NULL,
        \`updated_at\` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`site_settings_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`site_settings_key_unique\` UNIQUE(\`key\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`destinations\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`slug\` varchar(128) NOT NULL,
        \`description\` text,
        \`section_title\` varchar(255) DEFAULT 'Packages for this destination',
        \`banner_images\` json,
        \`package_ids\` json,
        \`packages_data\` json,
        \`package_data\` json,
        \`status\` enum('published','draft') NOT NULL DEFAULT 'published',
        \`display_order\` int NOT NULL DEFAULT 0,
        \`seo_settings\` longtext NULL,
        \`created_at\` timestamp DEFAULT (now()),
        \`updated_at\` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`destinations_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`destinations_slug_unique\` UNIQUE(\`slug\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`email_delivery_logs\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`form_id\` varchar(255) NOT NULL,
        \`status\` enum('Delivered','Failed') NOT NULL,
        \`sent_to\` varchar(255) NOT NULL,
        \`details\` text,
        \`created_at\` timestamp DEFAULT (now()),
        CONSTRAINT \`email_delivery_logs_id\` PRIMARY KEY(\`id\`)
      );`,


      `CREATE TABLE IF NOT EXISTS \`activity_logs\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`status\` varchar(64) NOT NULL,
        \`user_id\` int NULL,
        \`ip_address\` varchar(64) NULL,
        \`previous_entry\` longtext NULL,
        \`new_entry\` longtext NULL,
        \`created_at\` timestamp DEFAULT (now()),
        \`updated_at\` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` timestamp NULL,
        CONSTRAINT \`activity_logs_id\` PRIMARY KEY(\`id\`),
        INDEX \`activity_logs_status_idx\` (\`status\`),
        INDEX \`activity_logs_user_id_idx\` (\`user_id\`),
        INDEX \`activity_logs_created_at_idx\` (\`created_at\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`sitemap_configs\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`content_type\` varchar(128) NOT NULL,
        \`include_in_sitemap\` boolean DEFAULT true,
        \`change_frequency\` varchar(50) DEFAULT 'monthly',
        \`priority\` decimal(3,1) DEFAULT 0.5,
        \`include_images\` boolean DEFAULT true,
        \`include_last_modified\` boolean DEFAULT true,
        \`updated_at\` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`sitemap_configs_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`sitemap_configs_content_type_unique\` UNIQUE(\`content_type\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`sitemap_logs\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`action\` varchar(50) NOT NULL,
        \`status\` varchar(50) NOT NULL,
        \`details\` longtext NULL,
        \`triggered_by\` varchar(128) DEFAULT 'system',
        \`created_at\` timestamp DEFAULT (now()),
        CONSTRAINT \`sitemap_logs_id\` PRIMARY KEY(\`id\`)
      );`,
    ];

    console.log('Executing table creation SQL statements...');
    for (const sql of tableStatements) {
      await connection.query(sql);
    }

    const alterStatements = [
      "ALTER TABLE `users` ADD COLUMN `badge_bg` varchar(32) DEFAULT '#0F766E';",
      "ALTER TABLE `users` ADD COLUMN `badge_text_color` varchar(32) DEFAULT '#FFFFFF';",
      "ALTER TABLE `site_pages` ADD COLUMN `guide_category` varchar(20) NULL;",
      "ALTER TABLE `site_pages` ADD COLUMN `guide_card_data` text NULL;",
      "ALTER TABLE `visa_services` ADD COLUMN `seo_settings` longtext NULL;",
      "ALTER TABLE `enquiries` MODIFY COLUMN `type` enum('quote_request','package_enquiry','visa_enquiry','general_contact','flight_enquiry') NOT NULL DEFAULT 'quote_request';",
    ];
    for (const alterSql of alterStatements) {
      try {
        await connection.query(alterSql);
      } catch (alterErr) {
        // Ignore if column already exists
      }
    }

    await connection.end();
    console.log('All MySQL tables created successfully!');

    // Seed default admin user
    console.log('Ensuring default admin user exists...');
    const seedEmail = (process.env.INITIAL_ADMIN_EMAIL || '').trim().toLowerCase();
    const seedPwd = process.env.INITIAL_ADMIN_PASSWORD || '';
    if (seedEmail && seedPwd) {
      const seedHash = hashPassword(seedPwd);
      await db.insert(users)
        .values({
          name: 'Super Admin',
          email: seedEmail,
          passwordHash: seedHash,
          role: 'super_admin',
          active: true,
          badgeBg: '#64F900',
          badgeTextColor: '#000000',
        })
        .onDuplicateKeyUpdate({ set: { passwordHash: seedHash } });
    } else {
      console.warn('Skipping default admin seed: set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD to seed an account.');
    }

    // Run data seeder
    await seedDatabase();
    console.log('Migration & Seeding completed cleanly!');
  } catch (err) {
    console.error('Error during migration & seeding:', err);
  }
}

runMigrationAndSeed().then(() => process.exit(0));
