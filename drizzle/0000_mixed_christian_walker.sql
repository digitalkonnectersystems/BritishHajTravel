CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`featured_image` text,
	`category` varchar(100) DEFAULT 'Pilgrimage Guide',
	`author_name` varchar(100) DEFAULT 'King Travel Editorial',
	`is_published` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enquiry_number` varchar(50) NOT NULL,
	`type` enum('quote_request','package_enquiry','visa_enquiry','general_contact') NOT NULL DEFAULT 'quote_request',
	`full_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`whatsapp` varchar(50),
	`city` varchar(100),
	`province` varchar(100),
	`package_id` int,
	`visa_service_id` int,
	`preferred_package_type` varchar(100),
	`departure_month` varchar(50),
	`adults` int DEFAULT 1,
	`children` int DEFAULT 0,
	`infants` int DEFAULT 0,
	`occupancy` varchar(50),
	`message` text,
	`status` enum('new','contacted','qualified','quotation_sent','followup_required','booked','closed','spam') NOT NULL DEFAULT 'new',
	`internal_notes` text,
	`assigned_staff` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `enquiries_enquiry_number_unique` UNIQUE(`enquiry_number`)
);
--> statement-breakpoint
CREATE TABLE `package_hotels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`package_id` int NOT NULL,
	`hotel_name` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`star_rating` varchar(20) DEFAULT '5 Star',
	`nights` int DEFAULT 5,
	`distance_from_haram` varchar(255),
	`image_url` text,
	CONSTRAINT `package_hotels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `package_prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`package_id` int NOT NULL,
	`occupancy_type` enum('quad','triple','double','single','child_with_bed','child_no_bed','infant') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`notes` varchar(255),
	CONSTRAINT `package_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('umrah','hajj') NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`short_description` text,
	`full_description` text,
	`featured_image` text,
	`month` varchar(100),
	`year` int DEFAULT 2026,
	`duration_days` int DEFAULT 14,
	`departure_city` varchar(100) DEFAULT 'Toronto',
	`destination` varchar(100) DEFAULT 'Makkah & Madinah',
	`starting_price` decimal(10,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'CAD',
	`star_rating` varchar(20) DEFAULT '5 Star',
	`status` enum('available','sold_out','coming_soon','draft') NOT NULL DEFAULT 'available',
	`is_featured` boolean NOT NULL DEFAULT false,
	`inclusions` json,
	`exclusions` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `packages_id` PRIMARY KEY(`id`),
	CONSTRAINT `packages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('super_admin','admin','content_editor','enquiry_manager','seo_manager') NOT NULL DEFAULT 'admin',
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `visa_services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`short_description` text,
	`full_description` text,
	`processing_time` varchar(100) DEFAULT '3-5 Business Days',
	`requirements` json,
	`image_url` text,
	`is_published` boolean NOT NULL DEFAULT true,
	`display_order` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `visa_services_id` PRIMARY KEY(`id`),
	CONSTRAINT `visa_services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `enquiries` ADD CONSTRAINT `enquiries_package_id_packages_id_fk` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enquiries` ADD CONSTRAINT `enquiries_visa_service_id_visa_services_id_fk` FOREIGN KEY (`visa_service_id`) REFERENCES `visa_services`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `package_hotels` ADD CONSTRAINT `package_hotels_package_id_packages_id_fk` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `package_prices` ADD CONSTRAINT `package_prices_package_id_packages_id_fk` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;