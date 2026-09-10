CREATE TABLE `hotel_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`display_order` int NOT NULL DEFAULT 0,
	`is_published` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotel_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `hotel_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `hotels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`city` varchar(120) NOT NULL,
	`image_url` text,
	`rating` decimal(2,1) DEFAULT '5.0',
	`description` text,
	`price_label` varchar(100) DEFAULT 'TBC',
	`price_period` varchar(50) DEFAULT 'per Night',
	`website_url` text NOT NULL,
	`display_order` int NOT NULL DEFAULT 0,
	`is_published` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotels_id` PRIMARY KEY(`id`),
	CONSTRAINT `hotels_category_id_hotel_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `hotel_categories`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `hotels_category_order_idx` ON `hotels` (`category_id`,`display_order`);
