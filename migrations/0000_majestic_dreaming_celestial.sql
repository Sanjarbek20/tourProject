CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tour_id` int NOT NULL,
	`full_name` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`number_of_people` int NOT NULL,
	`special_requests` text,
	`start_date` date NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`payment_method` enum('plastic','visa','cash','later') NOT NULL,
	`deposit_paid` boolean DEFAULT false,
	`payment_status` varchar(20) NOT NULL DEFAULT 'unpaid',
	`payment_details` text,
	`total_amount` varchar(50) NOT NULL,
	`admin_notes` text,
	`assigned_to_id` int,
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`subject` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`tour` varchar(100),
	`status` varchar(20) NOT NULL DEFAULT 'new',
	`response` text,
	`response_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `destinations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`image` varchar(255) NOT NULL,
	`featured` boolean DEFAULT false,
	CONSTRAINT `destinations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`category` varchar(50) NOT NULL,
	`image` varchar(255) NOT NULL,
	`description` text,
	CONSTRAINT `gallery_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `newsletter_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscriptions_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`position` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`image` varchar(255) NOT NULL,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`location` varchar(100) NOT NULL,
	`text` text NOT NULL,
	`image` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tours` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`price` varchar(50) NOT NULL,
	`duration` varchar(50) NOT NULL,
	`image` varchar(255) NOT NULL,
	`cities` varchar(255) NOT NULL,
	`max_people` int NOT NULL,
	`rating` varchar(10) NOT NULL,
	`category` varchar(50) NOT NULL,
	`featured` boolean DEFAULT false,
	CONSTRAINT `tours_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`full_name` varchar(100) NOT NULL,
	`role` enum('admin','staff') NOT NULL DEFAULT 'staff',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
