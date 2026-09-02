CREATE TABLE `contact_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticket_number` varchar(128) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`website` varchar(255),
	`package_type` varchar(100),
	`message` text,
	`status` varchar(50) DEFAULT 'new',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contact_enquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `contact_enquiries_ticket_number_unique` UNIQUE(`ticket_number`)
);
--> statement-breakpoint
CREATE TABLE `flight_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enquiry_number` varchar(128) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`origin_city` varchar(100) DEFAULT 'Toronto (YYZ)',
	`destination_city` varchar(100) DEFAULT 'Jeddah (JED)',
	`departure_date` varchar(100),
	`return_date` varchar(100),
	`passengers` int DEFAULT 1,
	`status` varchar(50) DEFAULT 'new',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flight_enquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `flight_enquiries_enquiry_number_unique` UNIQUE(`enquiry_number`)
);
--> statement-breakpoint
CREATE TABLE `package_booking_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`booking_number` varchar(128) NOT NULL,
	`package_id` int,
	`package_name` varchar(255),
	`full_name` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`email` varchar(255) NOT NULL,
	`adults` int DEFAULT 1,
	`children` int DEFAULT 0,
	`infants` int DEFAULT 0,
	`start_date` varchar(100),
	`total_price` varchar(50),
	`status` varchar(50) DEFAULT 'new',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `package_booking_enquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `package_booking_enquiries_booking_number_unique` UNIQUE(`booking_number`)
);
--> statement-breakpoint
CREATE TABLE `quote_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enquiry_number` varchar(128) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`email` varchar(255) NOT NULL,
	`package_type` varchar(100) DEFAULT 'Umrah Package',
	`departure_date` varchar(100),
	`adults` int DEFAULT 1,
	`status` varchar(50) DEFAULT 'new',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quote_enquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `quote_enquiries_enquiry_number_unique` UNIQUE(`enquiry_number`)
);
--> statement-breakpoint
CREATE TABLE `site_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`status` enum('published','draft') NOT NULL DEFAULT 'published',
	`show_in_menu` boolean NOT NULL DEFAULT true,
	`parent_page` varchar(128),
	`banner_bg_image` text,
	`banner_position` varchar(50) DEFAULT 'center center',
	`banner_size` varchar(50) DEFAULT 'cover',
	`banner_title` text,
	`banner_description` text,
	`sections` text,
	`rich_text` text,
	`meta_title` varchar(255),
	`meta_description` text,
	`seo_settings` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sitemap_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content_type` varchar(128) NOT NULL,
	`include_in_sitemap` boolean DEFAULT true,
	`change_frequency` varchar(50) DEFAULT 'monthly',
	`priority` decimal(3,1) DEFAULT '0.5',
	`include_images` boolean DEFAULT true,
	`include_last_modified` boolean DEFAULT true,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sitemap_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `sitemap_configs_content_type_unique` UNIQUE(`content_type`)
);
--> statement-breakpoint
CREATE TABLE `sitemap_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(50) NOT NULL,
	`status` varchar(50) NOT NULL,
	`details` json,
	`triggered_by` varchar(128) DEFAULT 'system',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `sitemap_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visa_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enquiry_number` varchar(128) NOT NULL,
	`visa_service_id` int,
	`visa_title` varchar(255),
	`full_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`travelers_count` int DEFAULT 1,
	`nationality` varchar(100) DEFAULT 'Canadian',
	`message` text,
	`status` varchar(50) DEFAULT 'new',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `visa_enquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `visa_enquiries_enquiry_number_unique` UNIQUE(`enquiry_number`)
);
--> statement-breakpoint
ALTER TABLE `blog_posts` MODIFY COLUMN `slug` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` MODIFY COLUMN `enquiry_number` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` MODIFY COLUMN `type` enum('quote_request','package_enquiry','visa_enquiry','general_contact','flight_enquiry') NOT NULL DEFAULT 'quote_request';--> statement-breakpoint
ALTER TABLE `packages` MODIFY COLUMN `slug` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `id` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` MODIFY COLUMN `key` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `visa_services` MODIFY COLUMN `slug` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `published_at` timestamp;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `seo_settings` json;--> statement-breakpoint
ALTER TABLE `packages` ADD `seo_settings` json;--> statement-breakpoint
ALTER TABLE `users` ADD `badge_bg` varchar(32) DEFAULT '#0F766E';--> statement-breakpoint
ALTER TABLE `users` ADD `badge_text_color` varchar(32) DEFAULT '#FFFFFF';--> statement-breakpoint
ALTER TABLE `visa_services` ADD `seo_settings` json;