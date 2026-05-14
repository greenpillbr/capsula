import type { Network, Transaction, Wallet } from '@/db/schema';

// Core mini-app SDK types
export interface MiniAppSDK {
  // Core mini-app info
  readonly miniAppId: string;
  readonly version: string;
  readonly manifest: MiniAppManifest;
  
  // Wallet access
  wallet: WalletAPI;
  
  // Network access
  network: NetworkAPI;
  
  // UI components
  ui: UIAPI;
  
  // Storage
  storage: StorageAPI;
  
  // Events
  events: EventAPI;
}

export interface MiniAppManifest {
  type: 'built-in' | 'external';
  module: string;
  entryPoint: string;
  permissions: Permission[];
  contractInteractions?: ContractType[];
  abi?: any[];
  customComponents?: string[];
  networks?: number[];
}

// Permission system
export type Permission = 
  | 'wallet.read'
  | 'wallet.write'
  | 'network.read'
  | 'network.write'
  | 'transaction.sign'
  | 'transaction.send'
  | 'storage.read'
  | 'storage.write'
  | 'ui.navigation';

export type ContractType = 'ERC20' | 'ERC721' | 'ERC1155' | 'Custom';

// Wallet API interface
export interface WalletAPI {
  // Read-only access
  getActiveWallet(): Wallet | null;
  getWalletAddress(): string | null;
  getBalance(tokenAddress?: string): Promise<string>;
  
  // Transaction preparation (requires wallet.write permission)
  prepareTransaction(params: TransactionParams): Promise<UnsignedTransaction>;
  
  // Transaction signing (requires transaction.sign permission)
  signTransaction(transaction: UnsignedTransaction): Promise<SignedTransaction>;
  
  // Transaction sending (requires transaction.send permission)
  sendTransaction(transaction: SignedTransaction): Promise<string>; // returns txHash
}

// Network API interface
export interface NetworkAPI {
  // Read access
  getActiveNetwork(): Network | null;
  getNetworkById(chainId: number): Network | null;
  getSupportedNetworks(): Network[];
  
  // Network switching (requires network.write permission)
  switchNetwork(chainId: number): Promise<boolean>;
  
  // Contract interaction
  callContract(params: ContractCallParams): Promise<any>;
  readContract(params: ContractReadParams): Promise<any>;
}

// UI API interface
export interface UIAPI {
  // Navigation (requires ui.navigation permission)
  navigate(route: string, params?: any): void;
  goBack(): void;
  
  // Toast notifications
  showToast(message: string, type?: 'success' | 'error' | 'info'): void;
  
  // Modals
  showModal(component: React.ComponentType, props?: any): Promise<any>;
  hideModal(): void;
  
  // Loading states
  showLoading(message?: string): void;
  hideLoading(): void;
}

// Storage API interface
export interface StorageAPI {
  // Persistent storage for mini-app (requires storage.read/write permissions)
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  
  // Temporary session storage
  getSessionItem(key: string): string | null;
  setSessionItem(key: string, value: string): void;
  removeSessionItem(key: string): void;
}

// Event API interface
export interface EventAPI {
  // Listen to core wallet events
  onWalletChange(callback: (wallet: Wallet | null) => void): () => void;
  onNetworkChange(callback: (network: Network | null) => void): () => void;
  onTransactionUpdate(callback: (transaction: Transaction) => void): () => void;
  
  // Emit mini-app specific events
  emit(eventName: string, data?: any): void;
  on(eventName: string, callback: (data?: any) => void): () => void;
}

// Transaction parameter types
export interface TransactionParams {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  nonce?: number;
}

export interface UnsignedTransaction {
  to: string;
  value: string;
  data: string;
  gasLimit: string;
  gasPrice: string;
  nonce: number;
  chainId: number;
}

export interface SignedTransaction extends UnsignedTransaction {
  signature: {
    r: string;
    s: string;
    v: number;
  };
}

// Contract interaction types
export interface ContractCallParams {
  contractAddress: string;
  abi: any[];
  functionName: string;
  args: any[];
  value?: string;
  gasLimit?: string;
}

export interface ContractReadParams {
  contractAddress: string;
  abi: any[];
  functionName: string;
  args: any[];
  blockTag?: string | number;
}

// Mini-app component props interface
export interface MiniAppProps {
  sdk: MiniAppSDK;
  onClose: () => void;
  isActive: boolean;
}

// Mini-app module interface that all mini-apps must implement
export interface MiniAppModule {
  id: string;
  title: string;
  version: string;
  description: string;
  component: React.ComponentType<MiniAppProps>;
  manifest: MiniAppManifest;
  
  // Lifecycle hooks
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onActivate?: (sdk: MiniAppSDK) => Promise<void>;
  onDeactivate?: () => Promise<void>;
}

// Error types for mini-app SDK
export class MiniAppError extends Error {
  constructor(
    message: string,
    public code: string,
    public miniAppId: string
  ) {
    super(message);
    this.name = 'MiniAppError';
  }
}

export class MiniAppPermissionError extends MiniAppError {
  constructor(permission: Permission, miniAppId: string) {
    super(`Permission denied: ${permission}`, 'PERMISSION_DENIED', miniAppId);
    this.name = 'MiniAppPermissionError';
  }
}

export class MiniAppNetworkError extends MiniAppError {
  constructor(message: string, miniAppId: string) {
    super(message, 'NETWORK_ERROR', miniAppId);
    this.name = 'MiniAppNetworkError';
  }
}

// Utility types for mini-app development
export type MiniAppEventMap = {
  'wallet:change': Wallet | null;
  'network:change': Network | null;
  'transaction:update': Transaction;
  'mini-app:activate': string;
  'mini-app:deactivate': string;
  'mini-app:install': string;
  'mini-app:uninstall': string;
};

// React hook types for mini-app development
export interface UseMiniAppSDKResult {
  sdk: MiniAppSDK | null;
  isReady: boolean;
  error: MiniAppError | null;
}

export interface UseMiniAppWalletResult {
  wallet: Wallet | null;
  address: string | null;
  balance: string;
  isLoading: boolean;
  refreshBalance: () => Promise<void>;
}

export interface UseMiniAppNetworkResult {
  network: Network | null;
  isConnected: boolean;
  switchNetwork: (chainId: number) => Promise<boolean>;
  supportedNetworks: Network[];
}