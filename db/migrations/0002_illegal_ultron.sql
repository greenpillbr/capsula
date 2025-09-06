CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`memo` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `mini_apps` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon_url` text,
	`version` text NOT NULL,
	`categories` text DEFAULT '[]',
	`supported_networks` text DEFAULT '[]',
	`recommended_by_communities` text DEFAULT '[]',
	`is_installed` integer DEFAULT false,
	`is_built_in` integer DEFAULT false,
	`installation_order` integer DEFAULT 0,
	`manifest_data` text DEFAULT '{}',
	`last_updated` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `networks` (
	`chain_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rpc_url` text NOT NULL,
	`explorer_url` text,
	`native_currency_symbol` text NOT NULL,
	`native_currency_decimals` integer DEFAULT 18 NOT NULL,
	`native_currency_name` text NOT NULL,
	`icon_url` text,
	`is_default` integer DEFAULT false,
	`is_recommended` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `nfts` (
	`id` text PRIMARY KEY NOT NULL,
	`token_id` text NOT NULL,
	`token_contract_address` text NOT NULL,
	`chain_id` integer NOT NULL,
	`owner_wallet_id` text NOT NULL,
	`name` text,
	`description` text,
	`image_url` text,
	`animation_url` text,
	`external_url` text,
	`collection_name` text,
	`collection_symbol` text,
	`metadata_uri` text,
	`last_fetched_at` text
);
--> statement-breakpoint
CREATE TABLE `tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_id` text NOT NULL,
	`chain_id` integer NOT NULL,
	`contract_address` text,
	`symbol` text NOT NULL,
	`name` text NOT NULL,
	`decimals` integer,
	`type` text NOT NULL,
	`logo_url` text,
	`is_custom` integer DEFAULT false,
	`balance` text DEFAULT '0',
	`last_balance_update` text
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_id` text NOT NULL,
	`chain_id` integer NOT NULL,
	`hash` text NOT NULL,
	`from_address` text NOT NULL,
	`to_address` text NOT NULL,
	`value` text NOT NULL,
	`gas_used` text,
	`gas_price` text,
	`gas_limit` text,
	`block_number` integer,
	`timestamp` text,
	`status` text DEFAULT 'Pending' NOT NULL,
	`type` text NOT NULL,
	`token_contract_address` text,
	`token_symbol` text,
	`token_decimals` integer,
	`token_amount` text,
	`memo` text,
	`is_outgoing` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_hash_unique` ON `transactions` (`hash`);--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`active_wallet_id` text,
	`last_active_network_chain_id` integer,
	`onboarding_complete` integer DEFAULT false,
	`passkey_enabled` integer DEFAULT true,
	`pin_enabled` integer DEFAULT false,
	`theme` text DEFAULT 'system',
	`followed_communities` text DEFAULT '[]',
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`public_key` text NOT NULL,
	`key_ref_id` text NOT NULL,
	`is_passkey_backed` integer DEFAULT true,
	`derivation_path` text DEFAULT 'm/44''/60''/0''/0/0',
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`last_accessed_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wallets_address_unique` ON `wallets` (`address`);--> statement-breakpoint
DROP TABLE `habits`;