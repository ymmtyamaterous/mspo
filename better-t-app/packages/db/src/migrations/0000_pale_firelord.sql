CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`emoji` text NOT NULL,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `favorite` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`sport_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sport_id`) REFERENCES `sport`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `favorite_user_id_idx` ON `favorite` (`user_id`);--> statement-breakpoint
CREATE INDEX `favorite_sport_id_idx` ON `favorite` (`sport_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `favorite_user_sport_unique` ON `favorite` (`user_id`,`sport_id`);--> statement-breakpoint
CREATE TABLE `pickup` (
	`id` text PRIMARY KEY NOT NULL,
	`main_sport_id` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_by_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`main_sport_id`) REFERENCES `sport`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pickup_side_card` (
	`id` text PRIMARY KEY NOT NULL,
	`pickup_id` text NOT NULL,
	`sport_id` text NOT NULL,
	`label` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`pickup_id`) REFERENCES `pickup`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sport_id`) REFERENCES `sport`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sport` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`name_en` text,
	`description` text NOT NULL,
	`rules` text,
	`history` text,
	`origin_country` text,
	`founded_year` integer,
	`player_count` text,
	`difficulty` integer,
	`category_id` text NOT NULL,
	`image_url` text,
	`video_url` text,
	`view_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`submitted_by_id` text,
	`rejection_reason` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submitted_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `sport_category_id_idx` ON `sport` (`category_id`);--> statement-breakpoint
CREATE INDEX `sport_status_idx` ON `sport` (`status`);--> statement-breakpoint
CREATE INDEX `sport_submitted_by_idx` ON `sport` (`submitted_by_id`);--> statement-breakpoint
CREATE INDEX `sport_view_count_idx` ON `sport` (`view_count`);--> statement-breakpoint
CREATE TABLE `sport_tag` (
	`id` text PRIMARY KEY NOT NULL,
	`sport_id` text NOT NULL,
	`tag` text NOT NULL,
	FOREIGN KEY (`sport_id`) REFERENCES `sport`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sport_tag_sport_id_idx` ON `sport_tag` (`sport_id`);--> statement-breakpoint
CREATE INDEX `sport_tag_tag_idx` ON `sport_tag` (`tag`);