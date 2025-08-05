// Core wallet types
export interface Account {
  id: string
  address: string
  name: string
  isActive: boolean
  derivationPath: string
}

export interface Network {
  chainId: number
  name: string
  rpcUrl: string
  symbol: string
  blockExplorerUrl: string
  isTestnet: boolean
}

export interface TokenBalance {
  address: string
  symbol: string
  name: string
  balance: string
  decimals: number
  logoUrl?: string
  priceUsd?: number
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  gasUsed: string
  gasPrice: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  type: 'send' | 'receive' | 'contract'
  tokenAddress?: string
  tokenSymbol?: string
}

// Mini-app types
export interface MiniApp {
  id: string
  name: Record<string, string>
  description: Record<string, string>
  version: string
  author: string
  icon: string
  screenshots: string[]
  manifest: MiniAppManifest
  isInstalled: boolean
  installDate?: Date
  lastUsed?: Date
}

export interface MiniAppManifest {
  id: string
  name: Record<string, string>
  description: Record<string, string>
  version: string
  author: string
  icon: string
  screenshots: string[]
  
  // Network Configuration
  networks: {
    supported: NetworkConfig[]
    required: string[]
    optional: string[]
  }
  
  // Community & Discovery
  tags: string[]
  collections: string[]
  
  // Technical specs
  entryPoint: string
  permissions: Permission[]
  minWalletVersion: string
  supportedLanguages: string[]
  defaultLanguage: string
  
  // Distribution
  repository?: string
  website?: string
  category: 'defi' | 'nft' | 'social' | 'utility' | 'game'
}

export interface NetworkConfig {
  chainId: number
  name: string
  required: boolean
  contracts?: Record<string, string>
  features?: string[]
}

export interface Permission {
  type: 'wallet' | 'storage' | 'network' | 'camera' | 'location'
  description: string
  required: boolean
}

// Community collections
export interface CommunityCollection {
  id: string
  name: Record<string, string>
  description: Record<string, string>
  curator: {
    name: string
    avatar?: string
    verified: boolean
  }
  tags: string[]
  networks: number[]
  miniApps: string[]
  followers: number
  rating: number
  lastUpdated: Date
  isOfficial: boolean
  supportedLanguages: string[]
}

// Mini-app SDK types
export interface MiniAppSDK {
  wallet: {
    getAddress(): Promise<string>
    getBalance(token?: string): Promise<string>
    sendTransaction(params: SendParams): Promise<TransactionResult>
    signMessage(message: string): Promise<string>
  }
  
  storage: {
    get(key: string): Promise<any>
    set(key: string, value: any): Promise<void>
    remove(key: string): Promise<void>
  }
  
  ui: {
    showToast(message: string, type: 'success' | 'error' | 'info'): void
    showModal(component: React.ComponentType): Promise<any>
    navigate(screen: string, params?: any): void
    setHeaderTitle(title: string): void
  }
  
  network: {
    getCurrentNetwork(): Promise<Network>
    getSupportedNetworks(): Promise<Network[]>
    switchNetwork(chainId: number): Promise<boolean>
    isNetworkSupported(chainId: number): boolean
  }
  
  contracts: {
    getContract(name: string): Promise<any>
    callContract(contractName: string, method: string, params: any[]): Promise<any>
  }
  
  i18n: {
    t(key: string, params?: any): string
    getCurrentLanguage(): string
    formatCurrency(amount: number, currency?: string): string
    formatDate(date: Date): string
  }
}

export interface SendParams {
  to: string
  value: string
  data?: string
  gasLimit?: string
  gasPrice?: string
}

export interface TransactionResult {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
}

// User preferences
export interface UserSettings {
  language: string
  currency: string
  biometricEnabled: boolean
  autoLockTimeout: number
  theme: 'light' | 'dark' | 'auto'
  notifications: {
    transactions: boolean
    miniApps: boolean
    security: boolean
  }
}

// Onboarding
export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ComponentType
  isCompleted: boolean
  isRequired: boolean
}
