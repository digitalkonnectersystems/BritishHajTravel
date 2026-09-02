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
        \`currency\` varchar(10) DEFAULT 'CAD',
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
        \`created_at\` timestamp DEFAULT (now()),
        CONSTRAINT \`visa_services_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`visa_services_slug_unique\` UNIQUE(\`slug\`)
      );`,

      `CREATE TABLE IF NOT EXISTS \`enquiries\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`enquiry_number\` varchar(128) NOT NULL,
        \`type\` enum('quote_request','package_enquiry','visa_enquiry','general_contact') NOT NULL DEFAULT 'quote_request',
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
    ];

    console.log('Executing table creation SQL statements...');
    for (const sql of tableStatements) {
      await connection.query(sql);
    }

    const alterStatements = [
      "ALTER TABLE `users` ADD COLUMN `badge_bg` varchar(32) DEFAULT '#0F766E';",
      "ALTER TABLE `users` ADD COLUMN `badge_text_color` varchar(32) DEFAULT '#FFFFFF';",
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
    const seedEmail = (process.env.INITIAL_ADMIN_EMAIL || 'hassan@kingtravelcan.com').trim().toLowerCase();
    const seedPwd = process.env.INITIAL_ADMIN_PASSWORD || 'KingTravel2026!';
    const seedHash = hashPassword(seedPwd);

    await db.insert(users)
      .values({
        name: 'Hassan',
        email: seedEmail,
        passwordHash: seedHash,
        role: 'super_admin',
        active: true,
        badgeBg: '#64F900',
        badgeTextColor: '#000000',
      })
      .onDuplicateKeyUpdate({ set: { passwordHash: seedHash } });

    // Run data seeder
    await seedDatabase();
    console.log('Migration & Seeding completed cleanly!');
  } catch (err) {
    console.error('Error during migration & seeding:', err);
  }
}

runMigrationAndSeed().then(() => process.exit(0));
