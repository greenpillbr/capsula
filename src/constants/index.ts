// Design System Colors (Regenerative/Earth tones)
export const Colors = {
  primary: '#2D5A27',      // Forest Green
  primaryLight: '#E8F5E8', // Light Green Background
  secondary: '#87A96B',    // Sage Green
  accent: '#9ACD32',       // Bright Lime
  background: '#FAF9F6',   // Soft Cream
  surface: '#FFFFFF',      // White
  text: '#2C3E50',         // Deep Charcoal
  textSecondary: '#7F8C8D', // Gray
  success: '#50C878',      // Emerald
  warning: '#FFD700',      // Golden Yellow
  error: '#E74C3C',        // Red
  info: '#3498DB',         // Blue
  
  // Semantic colors
  border: '#E1E8ED',
  disabled: '#BDC3C7',
  placeholder: '#95A5A6',
  shadow: '#000000',       // Shadow color
  
  // Gradients
  primaryGradient: ['#2D5A27', '#87A96B'],
  accentGradient: ['#9ACD32', '#50C878'],
}

// Supported Networks
export const NETWORKS: Record<string, any> = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    symbol: 'ETH',
    blockExplorerUrl: 'https://etherscan.io',
    isTestnet: false,
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    symbol: 'MATIC',
    blockExplorerUrl: 'https://polygonscan.com',
    isTestnet: false,
  },
  celo: {
    chainId: 42220,
    name: 'Celo',
    rpcUrl: 'https://forno.celo.org',
    symbol: 'CELO',
    blockExplorerUrl: 'https://explorer.celo.org',
    isTestnet: false,
  },
  gnosis: {
    chainId: 100,
    name: 'Gnosis Chain',
    rpcUrl: 'https://rpc.gnosischain.com',
    symbol: 'xDAI',
    blockExplorerUrl: 'https://gnosisscan.io',
    isTestnet: false,
  },
  // Testnets
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    symbol: 'ETH',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    isTestnet: true,
  },
}

// Default network for Brazil/Greenpill community
export const DEFAULT_NETWORK = NETWORKS.celo

// Mini-app categories
export const MINI_APP_CATEGORIES = {
  defi: {
    id: 'defi',
    name: { 'pt-BR': 'DeFi', 'en-US': 'DeFi', 'es-ES': 'DeFi' },
    icon: '💰',
    color: Colors.success,
  },
  nft: {
    id: 'nft',
    name: { 'pt-BR': 'NFTs', 'en-US': 'NFTs', 'es-ES': 'NFTs' },
    icon: '🎨',
    color: Colors.accent,
  },
  social: {
    id: 'social',
    name: { 'pt-BR': 'Social', 'en-US': 'Social', 'es-ES': 'Social' },
    icon: '👥',
    color: Colors.info,
  },
  utility: {
    id: 'utility',
    name: { 'pt-BR': 'Utilidades', 'en-US': 'Utilities', 'es-ES': 'Utilidades' },
    icon: '🔧',
    color: Colors.secondary,
  },
  game: {
    id: 'game',
    name: { 'pt-BR': 'Jogos', 'en-US': 'Games', 'es-ES': 'Juegos' },
    icon: '🎮',
    color: Colors.warning,
  },
}

// Tag categories for better organization
export const TAG_CATEGORIES = {
  COMMUNITY: ['greenpill', 'brazilian', 'regenerative', 'local'],
  DIFFICULTY: ['beginner', 'intermediate', 'advanced'],
  FUNCTION: ['defi', 'nft', 'social', 'utility', 'governance'],
  NETWORK: ['ethereum', 'polygon', 'celo', 'gnosis'],
  LANGUAGE: ['portuguese', 'english', 'spanish'],
}

// Greenpill Brazil collections
export const GREENPILL_BRAZIL_COLLECTIONS = [
  {
    id: 'greenpill-br-starter',
    name: {
      'pt-BR': 'Iniciante Greenpill',
      'en-US': 'Greenpill Starter',
      'es-ES': 'Iniciante Greenpill'
    },
    description: {
      'pt-BR': 'Mini-apps essenciais para começar na economia regenerativa',
      'en-US': 'Essential mini-apps to start in regenerative economy',
      'es-ES': 'Mini-apps esenciales para empezar en la economía regenerativa'
    },
    tags: ['beginner', 'educational', 'regenerative'],
    networks: [42220, 100], // Celo, Gnosis
    isOfficial: true,
  },
  {
    id: 'greenpill-br-advanced',
    name: {
      'pt-BR': 'Avançado Regenerativo',
      'en-US': 'Advanced Regenerative',
      'es-ES': 'Regenerativo Avanzado'
    },
    description: {
      'pt-BR': 'Ferramentas avançadas para impacto regenerativo',
      'en-US': 'Advanced tools for regenerative impact',
      'es-ES': 'Herramientas avanzadas para impacto regenerativo'
    },
    tags: ['advanced', 'governance', 'impact'],
    networks: [42220, 100, 137], // Celo, Gnosis, Polygon
    isOfficial: true,
  },
]

// App configuration
export const APP_CONFIG = {
  name: 'Capsula',
  version: '1.0.0',
  defaultLanguage: 'pt-BR',
  supportedLanguages: ['pt-BR', 'en-US', 'es-ES'],
  defaultCurrency: 'BRL',
  autoLockTimeout: 300000, // 5 minutes in milliseconds
  maxAccounts: 10,
  
  // Security
  biometricTimeout: 30000, // 30 seconds
  maxFailedAttempts: 5,
  
  // Mini-apps
  maxInstalledMiniApps: 50,
  miniAppCacheTimeout: 3600000, // 1 hour
}

// Animation durations
export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  spring: {
    damping: 15,
    stiffness: 150,
  },
}

// Layout constants
export const LAYOUT = {
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
}
