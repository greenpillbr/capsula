// Common Types for Capsula App

export interface Wallet {
  id: string;
  name: string;
  address: string;
  publicKey: string;
  keyRefId: string;
  isPasskeyBacked: boolean;
  derivationPath?: string;
  createdAt: Date;
  lastAccessedAt: Date;
}

export interface Network {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrencySymbol: string;
  nativeCurrencyDecimals: number;
  nativeCurrencyName: string;
  iconUrl?: string;
  isDefault: boolean;
  isRecommended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Token {
  id: string;
  walletId: string;
  chainId: number;
  contractAddress?: string; // null for native currency
  symbol: string;
  name: string;
  decimals?: number; // null for NFTs
  type: 'Native' | 'ERC20' | 'ERC721' | 'ERC1155';
  logoUrl?: string;
  isCustom: boolean;
  balance: string;
  lastBalanceUpdate: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  chainId: number;
  hash: string;
  fromAddress: string;
  toAddress: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  gasLimit: string;
  blockNumber?: number;
  timestamp: Date;
  status: 'Pending' | 'Confirmed' | 'Failed';
  type: 'Native Transfer' | 'ERC20 Transfer' | 'ERC721 Transfer' | 'ERC1155 Transfer' | 'Contract Call';
  tokenContractAddress?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  tokenAmount?: string;
  memo?: string;
  isOutgoing: boolean;
}

export interface Contact {
  id: string;
  name: string;
  address: string;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id: string;
  activeWalletId?: string;
  lastActiveNetworkChainId?: number;
  onboardingComplete: boolean;
  passkeyEnabled: boolean;
  pinEnabled: boolean;
  theme: 'system' | 'light' | 'dark';
  followedCommunities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MiniApp {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  version: string;
  categories: string[];
  supportedNetworks: number[];
  recommendedByCommunities: string[];
  isInstalled: boolean;
  isBuiltIn: boolean;
  installationOrder: number;
  manifestData: Record<string, unknown>;
  lastUpdated: Date;
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  Send: { tokenId?: string };
  Receive: undefined;
  TransactionDetails: { transactionId: string };
  AddWallet: undefined;
  ImportWallet: undefined;
  ExportSeedPhrase: undefined;
  NetworkSettings: undefined;
  MiniAppDetails: { miniAppId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Activity: undefined;
  MiniApps: undefined;
  Profile: undefined;
};

// Form Types
export interface SendFormData {
  recipientAddress: string;
  amount: string;
  token: Token;
  memo?: string;
}

export interface ImportWalletFormData {
  seedPhrase?: string;
  privateKey?: string;
  walletName: string;
}

// API Response Types
export interface BalanceResponse {
  balance: string;
  tokenAddress?: string;
  decimals: number;
}

export interface GasEstimateResponse {
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};