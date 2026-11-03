CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`deal` text NOT NULL,
	`type` text NOT NULL,
	`neighborhood` text NOT NULL,
	`area` integer NOT NULL,
	`rooms` integer NOT NULL,
	`year` integer NOT NULL,
	`floor` integer NOT NULL,
	`price` integer NOT NULL,
	`deposit` integer NOT NULL,
	`rent` integer NOT NULL,
	`description` text NOT NULL,
	`amenities` text NOT NULL,
	`images` text NOT NULL,
	`owner_name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`feedback` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content_type` text NOT NULL,
	`created_at` text NOT NULL
);
