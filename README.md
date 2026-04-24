# Capsula: The Greenpill BR Crypto Wallet



**A native-first mobile crypto wallet built for the Greenpill BR community**

[Features](#features) • [Getting Started](#getting-started) • [Architecture](#architecture) • [Mini-App Development](#mini-app-development) • [Contributing](#contributing)

---

## 🌱 About Capsula

Capsula is a **minimalistic, vibrant, and incredibly easy-to-use** crypto wallet specifically designed for the Greenpill BR (GPBR) community. Built with React Native and Expo, it provides a simplified, beginner-friendly entry point into the world of crypto for individuals interested in **autonomy and regeneration**.

### 🎯 Vision

Architected for a future of **limitless, user-installed functionality** through a revolutionary **modular mini-app system** - the central pillar of the application's design.

## ✨ Features

### 🔐 Core Wallet Functionality

- **Passkey-First Authentication**: Single-click onboarding with biometric security
- **Multi-Network Support**: Ethereum Mainnet, CELO, and Gnosis Chain
- **Secure Key Management**: Hardware-backed secure storage with optional seed phrase export
- **Send & Receive**: Full transaction flows with gas estimation and QR code support
- **Transaction History**: Comprehensive activity tracking with real-time status updates

### 🧩 Mini-App System (Central Pillar)

- **Modular Architecture**: Extensible system for adding new functionality
- **Built-in Mini-Apps**:
  - **Tokens Module**: ERC-20 token management and custom token addition
  - **Example Module**: SDK demonstration for developers
- **Network-Based Filtering**: Mini-apps automatically show/hide based on current network
- **Secure Integration**: All mini-app transactions require Passkey authentication

### 🛠 Developer Experience

- **Complete Mini-App SDK**: TypeScript interfaces for wallet, network, UI, storage, and events
- **Permission System**: Granular control over mini-app capabilities
- **Error Boundaries**: Robust error handling and recovery
- **Hot Reloading**: Fast development iteration with Metro bundler

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **Bun** package manager
- **Android Studio** (for Android development)
- **Expo CLI**: `bun add -g @expo/cli`
- **Expo Go**: Installed from playstore on your mobile phone

### Installation

1. **Clone the repository:**
  ```bash
   git clone https://github.com/greenpillbr/capsula.git
   cd capsula
  ```
2. **Install dependencies:**
  ```bash
   bun install
  ```
3. **Configure environment:**
  ```bash
   cp .env.example .env
   # Edit .env with your Infura API key
  ```
4. **Generate database schema:**
  ```bash
   bun run db:generate
  ```

### Development

```bash
# Start Metro bundler
bun run dev
# You should use Expo go instead of development build (press S to switch to expo go)

# Run on Android device/emulator
bun run android

# Run on iOS device/simulator (macOS only)
bun run ios
```

## 🏗 Architecture

### Technology Stack

- **React Native** + **TypeScript** + **Expo** for cross-platform development
- **Zustand** for state management with MMKV persistence
- **Ethers.js** for blockchain interactions
- **Drizzle ORM** with SQLite for local-first data storage
- **Expo SecureStore** for cryptographic key management

### Mini-App System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Core Wallet   │    │  Mini-App SDK   │    │  Built-in Apps  │
│                 │    │                 │    │                 │
│ • Authentication│◄──►│ • Wallet API    │◄──►│ • Tokens        │
│ • Network Mgmt  │    │ • Network API   │    │ • Example       │
│ • Transactions  │    │ • Storage API   │    │ • [Future Apps] │
│ • Key Mgmt      │    │ • UI API        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

- `**[lib/stores/miniAppStore.ts](lib/stores/miniAppStore.ts)**` - Mini-app state management
- `**[lib/mini-apps/sdk/](lib/mini-apps/sdk/)**` - Complete SDK for mini-app development
- `**[lib/blockchain/ethersService.ts](lib/blockchain/ethersService.ts)**` - Enhanced Ethereum integration
- `**[lib/crypto/keyManager.ts](lib/crypto/keyManager.ts)**` - Secure wallet management
- `**[db/schema.ts](db/schema.ts)**` - Complete database schema

## 🧩 Mini-App Development

### Creating a Mini-App

1. **Create your module:**
  ```bash
   mkdir -p lib/mini-apps/modules/your-app
  ```
2. **Implement the interface:**
  ```typescript
   import type { MiniAppProps } from '@/lib/mini-apps/sdk';

   export default function YourMiniApp({ sdk, onClose, isActive }: MiniAppProps) {
     // Access wallet
     const wallet = sdk.wallet.getActiveWallet();

     // Read from smart contract
     const data = await sdk.network.readContract({
       contractAddress: '0x...',
       abi: [...],
       functionName: 'getData',
       args: []
     });

     // Sign transaction with Passkey
     const tx = await sdk.wallet.signTransaction(params);

     return <YourUI />;
   }
  ```
3. **Register in host:**
  Add your module to `[lib/mini-apps/host/MiniAppHost.tsx](lib/mini-apps/host/MiniAppHost.tsx)`

### Available SDK APIs

- **Wallet API**: `getActiveWallet()`, `getBalance()`, `signTransaction()`
- **Network API**: `getActiveNetwork()`, `readContract()`, `callContract()`
- **UI API**: `showToast()`, `navigate()`, `showModal()`
- **Storage API**: `getItem()`, `setItem()`, session storage
- **Events API**: `onWalletChange()`, `onNetworkChange()`, custom events

## 📱 Supported Networks

- **Ethereum Mainnet** (Chain ID: 1)
- **CELO Mainnet** (Chain ID: 42220) 
- **Gnosis Chain** (Chain ID: 100)
- Extensible architecture for future EVM-compatible networks

## 🔒 Security

- **Passkey Authentication**: Hardware-backed biometric security
- **Secure Key Storage**: Private keys encrypted in device secure storage
- **Permission System**: Mini-apps have controlled access to wallet functions
- **Transaction Authorization**: All blockchain operations require Passkey confirmation

## 📚 Documentation

- **[Development Workflow](docs/development-workflow.md)** - Setup and contribution guide
- **[Mini-App System Architecture](docs/mini-app-system-mvp-architecture.md)** - Technical architecture
- **[Complete Specification](docs/capsula_all_documentation.md)** - Full project requirements

## 🛠 Build & Deploy

### Development Testing

```bash
bun run dev              # Start Metro bundler
bun run android         # Test on Android device
```

### Production Build

```bash
./scripts/build-android.sh  # Build Android APK
```

### Automated Deployment

GitHub Actions automatically builds APKs on push to main branch.

## 🗺 Roadmap

### ✅ MVP Complete (Current)

- Core wallet functionality with Passkey authentication
- Multi-network support (Ethereum, CELO, Gnosis)
- Complete mini-app system infrastructure
- Tokens module for ERC-20 token management
- Example module for developer guidance
- Android build pipeline

### 🔮 Future Phases

- Mini-app marketplace with search and categories
- Community following system for network/app recommendations
- Contacts module for address book management
- NFT module for ERC-721/ERC-1155 viewing
- Advanced DeFi integrations

## 🤝 Contributing

We welcome contributions from the Greenpill BR community and crypto developers worldwide!

### For Developers

1. Read the [development workflow](docs/development-workflow.md)
2. Study the [Example module](lib/mini-apps/modules/example/ExampleModule.tsx)
3. Follow the mini-app development guide above

### For Community

- Report issues and suggest features
- Test the app and provide feedback
- Help with documentation and translations

## 📄 License

[MIT License](LICENSE) - Feel free to use this project for your own community wallet needs.

---

**Built with ❤️ for the Greenpill BR community**  
*Your gateway to autonomy and regeneration*