CREATE TABLE `otp_codes` (
	`id` varchar(36) NOT NULL,
	`contact` varchar(128) NOT NULL,
	`code` varchar(10) NOT NULL,
	`status` varchar(32) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `otp_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token` varchar(512) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`username` varchar(64) NOT NULL,
	`password` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE INDEX `otp_codes_id_idx` ON `otp_codes` (`id`);--> statement-breakpoint
CREATE INDEX `otp_codes_contact_idx` ON `otp_codes` (`contact`);--> statement-breakpoint
CREATE INDEX `otp_codes_code_idx` ON `otp_codes` (`code`);--> statement-breakpoint
CREATE INDEX `refresh_tokens_user_id_idx` ON `refresh_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `refresh_tokens_token_idx` ON `refresh_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `users_id_idx` ON `users` (`id`);