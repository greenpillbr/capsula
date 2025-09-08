# Capsula Development Workflow

## Overview
This document outlines the development workflow for the Capsula crypto wallet, including setup instructions, testing procedures, and contribution guidelines.

## Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **bun** or **yarn**
- **Expo CLI** (`bun install -g @expo/cli`)
- **Android Studio** (for Android development)
- **Java Development Kit (JDK)** (v11 or higher)

### Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/capsula.git
   cd capsula
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Infura API key
   ```

4. Generate database schema:
   ```bash
   bun run db:generate
   ```

## Development Commands

### Start Development Server
```bash
# Start Metro bundler
bun run dev

# Start with Android focus
bun run dev:android
```

### Build and Test
```bash
# Run on Android device/emulator
bun run android

# Run on iOS device/simulator (macOS only)
bun run ios

# Build for web (testing purposes)
bun run build:web
```

### Code Quality
```bash
# Format code with Biome
bun run format

# Check Expo dependencies
bun run expo-check
```

## Project Structure

### Core Architecture
```
lib/
├── stores/           # Zustand state management
├── blockchain/       # Ethereum/Web3 integration
├── auth/            # Passkey authentication
├── crypto/          # Key management
└── mini-apps/       # Mini-app system (CENTRAL PILLAR)
    ├── sdk/         # Mini-app SDK
    ├── host/        # Runtime framework
    └── modules/     # Built-in mini-apps
```

### Key Files
- [`lib/stores/miniAppStore.ts`](../lib/stores/miniAppStore.ts) - Mini-app state management
- [`lib/mini-apps/sdk/`](../lib/mini-apps/sdk/) - Complete SDK for mini-app development
- [`lib/blockchain/ethersService.ts`](../lib/blockchain/ethersService.ts) - Enhanced Ethereum integration
- [`lib/crypto/keyManager.ts`](../lib/crypto/keyManager.ts) - Secure wallet management
- [`db/schema.ts`](../db/schema.ts) - Complete database schema

## Mini-App Development

### Creating a New Mini-App

1. **Create module directory:**
   ```bash
   mkdir -p lib/mini-apps/modules/your-app
   ```

2. **Implement MiniAppProps interface:**
   ```typescript
   import type { MiniAppProps } from '@/lib/mini-apps/sdk';
   
   export default function YourModule({ sdk, onClose, isActive }: MiniAppProps) {
     // Your mini-app implementation
   }
   ```

3. **Register in MiniAppHost:**
   Add your module to the `BUILT_IN_MODULES` object in [`lib/mini-apps/host/MiniAppHost.tsx`](../lib/mini-apps/host/MiniAppHost.tsx)

### SDK APIs Available

#### Wallet API
- `sdk.wallet.getActiveWallet()` - Get current wallet
- `sdk.wallet.getBalance(tokenAddress?)` - Get balance
- `sdk.wallet.signTransaction(tx)` - Sign with Passkey

#### Network API  
- `sdk.network.getActiveNetwork()` - Get current network
- `sdk.network.readContract(params)` - Read from contract
- `sdk.network.callContract(params)` - Write to contract

#### Storage API
- `sdk.storage.getItem(key)` - Persistent storage
- `sdk.storage.setSessionItem(key, value)` - Session storage

#### UI API
- `sdk.ui.showToast(message, type)` - Show notifications
- `sdk.ui.navigate(route)` - Navigation

## Testing Strategy

### Manual Testing
1. **Start development server:** `bun run dev`
2. **Test on device/emulator:** Use Expo Go app or `bun run android`
3. **Test mini-apps:** Navigate to each mini-app and verify functionality
4. **Test networks:** Switch between Ethereum, CELO, and Gnosis

### Key Test Cases
- ✅ Wallet creation with Passkey
- ✅ Send/receive transactions
- ✅ Network switching
- ✅ Mini-app launching (Tokens & Example)
- ✅ ERC-20 token management
- ✅ Smart contract interaction

### Android Testing
1. **Connect device:** `adb devices`
2. **Run on device:** `bun run android`
3. **Test Passkey:** Verify biometric authentication works
4. **Test transactions:** Verify gas estimation and signing

## Build Process

### Development Build
```bash
bun run android  # Creates debug APK
```

### Production Build (Future)
```bash
expo build:android --type apk
```

## Code Standards

### TypeScript
- Strict type checking enabled
- All mini-apps must implement `MiniAppProps`
- Use proper error handling with try/catch

### React Native
- Use functional components with hooks
- Follow Expo best practices
- Use the provided UI component library

### Security
- Never store private keys in plain text
- All transactions require Passkey authentication
- Mini-apps have controlled permissions

## Contribution Guidelines

### Before Contributing
1. Read the [Architecture Documentation](./mini-app-system-mvp-architecture.md)
2. Study existing mini-apps (Tokens & Example modules)
3. Ensure you understand the SDK interfaces

### Pull Request Process
1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Follow code standards and add tests
4. Submit PR with clear description

### Mini-App Contributions
1. Follow the mini-app development guide above
2. Ensure network compatibility (Ethereum, CELO, Gnosis)
3. Use only approved SDK APIs
4. Include proper error handling

## Troubleshooting

### Common Issues

#### Metro Bundle Errors
```bash
# Clear cache and restart
bun run dev -- --clear-cache
```

#### Android Build Issues
```bash
# Check Android environment
npx expo doctor

# Reconnect device
adb kill-server && adb start-server
```

#### TypeScript Errors
```bash
# Regenerate types
bun run db:generate
```

### Getting Help
- Check [comprehensive documentation](./capsula_all_documentation.md)
- Review mini-app examples in `lib/mini-apps/modules/`
- Test with Example module for SDK reference

## Performance Notes

- **Local-first:** All core data stored on device
- **Network filtering:** Mini-apps only show for supported networks
- **Lazy loading:** Mini-apps load on demand
- **State persistence:** Uses MMKV for fast storage

This workflow ensures efficient development while maintaining the security and modularity that makes Capsula's mini-app system the "central pillar" of the architecture.