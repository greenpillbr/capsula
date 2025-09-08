import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

// UserSettings (Singleton)
export const userSettingsTable = sqliteTable("user_settings", {
  id: text("id")
    .$defaultFn(() => "user-settings")
    .primaryKey(),
  activeWalletId: text("active_wallet_id"),
  lastActiveNetworkChainId: integer("last_active_network_chain_id"),
  onboardingComplete: integer("onboarding_complete", { mode: "boolean" }).default(false),
  passkeyEnabled: integer("passkey_enabled", { mode: "boolean" }).default(true),
  pinEnabled: integer("pin_enabled", { mode: "boolean" }).default(false),
  theme: text("theme").default("system"),
  followedCommunities: text("followed_communities").default("[]"), // JSON array
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// Wallets
export const walletsTable = sqliteTable("wallets", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull().unique(),
  publicKey: text("public_key").notNull(),
  keyRefId: text("key_ref_id").notNull(), // Reference to SecureStore
  isPasskeyBacked: integer("is_passkey_backed", { mode: "boolean" }).default(true),
  derivationPath: text("derivation_path").default("m/44'/60'/0'/0/0"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  lastAccessedAt: text("last_accessed_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// Networks
export const networksTable = sqliteTable("networks", {
  chainId: integer("chain_id").primaryKey(),
  name: text("name").notNull(),
  rpcUrl: text("rpc_url").notNull(),
  explorerUrl: text("explorer_url"),
  nativeCurrencySymbol: text("native_currency_symbol").notNull(),
  nativeCurrencyDecimals: integer("native_currency_decimals").notNull().default(18),
  nativeCurrencyName: text("native_currency_name").notNull(),
  iconUrl: text("icon_url"),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  isRecommended: integer("is_recommended", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// Tokens
export const tokensTable = sqliteTable("tokens", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  walletId: text("wallet_id").notNull(),
  chainId: integer("chain_id").notNull(),
  contractAddress: text("contract_address"), // null for native currency
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  decimals: integer("decimals"), // null for NFTs
  type: text("type").notNull(), // "Native", "ERC20", "ERC721", "ERC1155"
  logoUrl: text("logo_url"),
  isCustom: integer("is_custom", { mode: "boolean" }).default(false),
  balance: text("balance").default("0"), // Stored as string for precision
  lastBalanceUpdate: text("last_balance_update"),
});

// NFTs
export const nftsTable = sqliteTable("nfts", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  tokenId: text("token_id").notNull(),
  tokenContractAddress: text("token_contract_address").notNull(),
  chainId: integer("chain_id").notNull(),
  ownerWalletId: text("owner_wallet_id").notNull(),
  name: text("name"),
  description: text("description"),
  imageUrl: text("image_url"),
  animationUrl: text("animation_url"),
  externalUrl: text("external_url"),
  collectionName: text("collection_name"),
  collectionSymbol: text("collection_symbol"),
  metadataUri: text("metadata_uri"),
  lastFetchedAt: text("last_fetched_at"),
});

// Transactions
export const transactionsTable = sqliteTable("transactions", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  walletId: text("wallet_id").notNull(),
  chainId: integer("chain_id").notNull(),
  hash: text("hash").notNull().unique(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  value: text("value").notNull(), // Native currency amount as string
  gasUsed: text("gas_used"),
  gasPrice: text("gas_price"),
  gasLimit: text("gas_limit"),
  blockNumber: integer("block_number"),
  timestamp: text("timestamp"),
  status: text("status").notNull().default("Pending"), // "Pending", "Confirmed", "Failed"
  type: text("type").notNull(), // "Native Transfer", "ERC20 Transfer", etc.
  tokenContractAddress: text("token_contract_address"),
  tokenSymbol: text("token_symbol"),
  tokenDecimals: integer("token_decimals"),
  tokenAmount: text("token_amount"),
  memo: text("memo"),
  isOutgoing: integer("is_outgoing", { mode: "boolean" }).notNull(),
});

// Contacts
export const contactsTable = sqliteTable("contacts", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  memo: text("memo"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// MiniApps
export const miniAppsTable = sqliteTable("mini_apps", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  version: text("version").notNull(),
  categories: text("categories").default("[]"), // JSON array
  supportedNetworks: text("supported_networks").default("[]"), // JSON array of chainIds
  recommendedByCommunities: text("recommended_by_communities").default("[]"), // JSON array
  isInstalled: integer("is_installed", { mode: "boolean" }).default(false),
  isBuiltIn: integer("is_built_in", { mode: "boolean" }).default(false),
  installationOrder: integer("installation_order").default(0),
  manifestData: text("manifest_data").default("{}"), // JSON object
  lastUpdated: text("last_updated").default(sql`(CURRENT_TIMESTAMP)`),
});

// Schema exports for type inference
export const UserSettingsSchema = createSelectSchema(userSettingsTable);
export const WalletSchema = createSelectSchema(walletsTable);
export const NetworkSchema = createSelectSchema(networksTable);
export const TokenSchema = createSelectSchema(tokensTable);
export const NftSchema = createSelectSchema(nftsTable);
export const TransactionSchema = createSelectSchema(transactionsTable);
export const ContactSchema = createSelectSchema(contactsTable);
export const MiniAppSchema = createSelectSchema(miniAppsTable);

// Type exports
export type UserSettings = z.infer<typeof UserSettingsSchema>;
export type Wallet = z.infer<typeof WalletSchema>;
export type Network = z.infer<typeof NetworkSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type Nft = z.infer<typeof NftSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type MiniApp = z.infer<typeof MiniAppSchema>;
