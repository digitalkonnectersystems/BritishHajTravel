ALTER TABLE `blog_posts` MODIFY COLUMN `slug` varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` MODIFY COLUMN `enquiry_number` varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE `packages` MODIFY COLUMN `slug` varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE `packages` MODIFY COLUMN `inclusions` text;--> statement-breakpoint
ALTER TABLE `packages` MODIFY COLUMN `exclusions` text;--> statement-breakpoint
ALTER TABLE `site_settings` MODIFY COLUMN `key` varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE `visa_services` MODIFY COLUMN `slug` varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE `visa_services` MODIFY COLUMN `requirements` text;