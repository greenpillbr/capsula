# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `bun run dev` - Start Expo development server with telemetry disabled
- `bun run dev:android` - Start development server specifically for Android
- `bun run android` - Run the app on Android device/emulator
- `bun run ios` - Run the app on iOS device/simulator
- `bun run format` - Format code using Biome (includes linting and auto-fixes)
- `bun run db:generate` - Generate database schema with Drizzle Kit
- `bun run expo-check` - Check and sync Expo dependencies

**Note**: No traditional test framework is configured. Manual testing is performed on Android devices/emulators.

## Architecture Overview

Capsula is a React Native crypto wallet built with Expo, focusing on a modular mini-app system architecture.

### Technology Stack
- **React Native + Expo** (SDK 53) with TypeScript
- **Zustand** for state management with MMKV persistence
- **Ethers.js v6** for blockchain interactions
- **Drizzle ORM** with SQLite for local-first storage
- **Expo SecureStore** for secure key management
- **NativeWind** for styling (Tailwind CSS for React Native)
- **WebAuthn/Passkeys** for authentication and transaction signing
- **Infura API** for gas estimation and RPC services
- **Chainlist.org API** for dynamic network management

### Key Directories
- `app/` - Expo Router file-based routing with tab navigation
- `lib/` - Core business logic and services
  - `lib/stores/` - Zustand state management stores
  - `lib/mini-apps/` - Mini-app system architecture
  - `lib/crypto/` - Wallet and key management
  - `lib/blockchain/` - Ethereum service integration
- `components/` - Reusable UI components
- `db/` - Drizzle ORM schema and database configuration

### State Management Architecture
- **authStore** - User authentication and passkey state
- **walletStore** - Wallet management and transaction history
- **networkStore** - Multi-chain network management (Ethereum, CELO, Gnosis)
- **miniAppStore** - Mini-app system state

### Mini-App System
The core architectural feature is the extensible mini-app system:
- Located in `lib/mini-apps/`
- Complete SDK in `lib/mini-apps/sdk/`
- Built-in modules in `lib/mini-apps/modules/`
- Host system in `lib/mini-apps/host/`

Each mini-app receives an SDK with APIs for:
- Wallet operations (getActiveWallet, signTransaction)
- Network interactions (readContract, callContract)
- Storage (persistent and session storage)
- UI utilities (navigation, toasts, modals)

### Security Architecture
- **Passkey-first authentication** with biometric security (WebAuthn standard)
- **Expo SecureStore** for private key encryption with hardware-backed storage
- **PIN/password fallback** for devices without Passkey support
- **Curated mini-app marketplace** with security review process
- **Local-first storage** - no remote data access except via mini-apps
- All blockchain transactions require passkey confirmation

### Development Notes
- Uses Biome for formatting/linting instead of ESLint/Prettier
- No traditional test framework configured - manual testing on devices
- Development primarily targets Android with Metro bundler
- Database migrations handled by Drizzle Kit
- Environment variables configured in `.env` (copy from `.env.example`)
- Target: Less than 1 second load times for most interactions
- MVP timeline: Functional wallet in less than a week
- Community focus: Greenpill BR (Brazilian regenerative agriculture/crypto activists)

### Database Schema
Located in `db/schema.ts` with tables for:
- **Wallets** - Support for multiple wallets with Passkey integration
- **Networks** - EVM-compatible chains with Chainlist.org API integration
- **Transactions** - Comprehensive history with status tracking
- **Tokens** - ERC-20 token management
- **Mini-apps** - Module metadata and permissions
- **Contacts** - Address book for easier sending
- **User Settings** - App preferences and configurations

Key security considerations:
- Private keys stored via `keyRefId` references to Expo SecureStore
- Passkey-backed wallets use system-level credentials
- Network data re-verified against Chainlist.org API on app startup

### Key Files to Understand
- `app/_layout.tsx` - Root layout with providers and theme setup
- `lib/stores/index.ts` - Central store exports
- `lib/mini-apps/sdk/index.ts` - Mini-app SDK entry point
- `lib/blockchain/ethersService.ts` - Core blockchain integration
- `lib/crypto/keyManager.ts` - Secure wallet management

### Functional Requirements Summary
- **Onboarding**: Passkey-first with optional seed phrase export
- **Multi-wallet**: Support for multiple wallets with easy switching
- **Networks**: Ethereum, CELO, Gnosis + testnets (extensible via Chainlist.org)
- **Transactions**: Send/receive with QR codes, gas estimation, history
- **Mini-apps**: Curated marketplace with network-specific visibility
- **Built-in modules**: Tokens, NFTs, Contacts, Example mini-app

### Performance Requirements
- Load times under 1 second for critical interactions
- Local caching for all fetched data
- Responsive animated loading screens
- GraphQL/external caches preferred over direct blockchain calls

### Mini-App SDK Features
- ABI-to-UI binding for smart contract interaction
- JSON configuration for simple mini-apps
- Custom component support for advanced UIs
- Access to wallet, network, storage, and UI APIs
- Secure transaction signing through core wallet

When working with this codebase, always consider the mini-app architecture and ensure changes maintain the modular design principles. The target user is the Greenpill BR community (Brazilian regenerative agriculture/crypto activists) who need simple, uncluttered interfaces.