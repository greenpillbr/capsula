# Capsula: The Greenpill BR Crypto Wallet

**A native-first mobile crypto wallet built for the Greenpill BR community**

[Features](#-features) • [Getting Started](#-getting-started) • [Running on Your Device](#-running-on-your-device) • [Architecture](#-architecture) • [Mini-App Development](#-mini-app-development) • [Contributing](#-contributing)

---

## 🌱 About Capsula

Capsula is a **minimalistic, vibrant, and incredibly easy-to-use** crypto wallet specifically designed for the Greenpill BR (GPBR) community. Built with [React Native](https://reactnative.dev/) and [Expo](https://docs.expo.dev/), it provides a simplified, beginner-friendly entry point into the world of crypto for individuals interested in **autonomy and regeneration**.

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
- **Hot Reloading**: Fast development iteration with the [Metro bundler](https://docs.expo.dev/guides/customizing-metro/)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Bun** package manager (`curl -fsSL https://bun.sh/install | bash`)
- **Git**

> Tooling specific to running the app on a phone or emulator (Android Studio, Java JDK, adb, Expo Go) is covered in the [Running on Your Device](#-running-on-your-device) section below.

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

# Run on Android device/emulator (requires native toolchain — see "Running on Your Device")
bun run android

# Run on iOS device/simulator (macOS only)
bun run ios
```

## 📱 Running on Your Device

This project targets **[Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)** and uses `react-native-mmkv@3.x`, which requires the [**New Architecture**](https://docs.expo.dev/guides/new-architecture/) (TurboModules). The New Architecture is already enabled in [`app.config.ts`](app.config.ts) (`newArchEnabled: true`), but it means you need an **Expo Go build that matches the SDK version** or, if that fails, a **custom development build**.

> If you're new to Expo, the official [Expo Tutorial](https://docs.expo.dev/tutorial/overview/) and [EAS Tutorial](https://docs.expo.dev/tutorial/eas/introduction/) are the best place to start. Expo also publishes a complete [environment setup guide](https://docs.expo.dev/get-started/set-up-your-environment/) covering Android Studio, JDK, and emulator installation per OS.

### 1. Install Android Studio

Download and install [Android Studio](https://developer.android.com/studio) (see Expo's [Android Studio emulator guide](https://docs.expo.dev/workflow/android-studio-emulator/)). During first launch let it install the latest **Android SDK**, **SDK Platform-Tools**, and a system image.

**Create an emulator (optional):** Open **Device Manager** in Android Studio and create a new virtual device (a recent Pixel image with Google Play Services is recommended).

### 2. Install the Java JDK (Linux)

Expo / Gradle requires a JDK (17 is recommended — see Expo's [local development setup](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&platform=android&device=physical)). On Linux, install **Eclipse Temurin (OpenJDK)** following [Adoptium's Linux installation guide](https://adoptium.net/installation/linux):

```bash
java -version   # verify the installation
```

### 3. Create an Expo Account

Some flows ([Expo Go](https://docs.expo.dev/get-started/set-up-your-environment/?mode=expo-go) account features, [EAS builds](https://docs.expo.dev/eas/)) require a free Expo account.

- Sign up at [expo.dev/signup](https://expo.dev/signup) and set a password at [expo.dev/settings](https://expo.dev/settings).

### 4. Run the App on a Physical Android Device

#### Enable Developer Mode and USB Debugging

1. **Settings → About phone**, tap **Build number** seven times to unlock **Developer options**.
2. **Settings → Developer options**, enable **USB debugging**.
3. Connect the phone via USB and accept the debugging prompt. Confirm with `adb devices` (see Expo's [Android device setup](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&platform=android&device=physical)).

You can now choose between two run modes:

#### Option A — Expo Go (fastest for UI iteration)

[Expo Go](https://docs.expo.dev/get-started/set-up-your-environment/?mode=expo-go) is a sandbox client that runs your JavaScript without rebuilding native code.

1. Install **Expo Go** on the phone.
   - The Play Store version is sometimes behind the latest SDK. If you see an SDK mismatch error, download the matching APK directly from Expo (see [Expo Go for older SDKs](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/#expo-go)):  
     [`https://expo.dev/go?sdkVersion=54&platform=android&device=true`](https://expo.dev/go?sdkVersion=54&platform=android&device=true)
2. Start the dev server (powered by [Expo CLI](https://docs.expo.dev/more/expo-cli/)):

   ```bash
   bun run dev
   ```

3. In the Metro terminal, press **`s`** to switch the target from "development build" to **Expo Go**, then scan the QR code with the Expo Go app.

> ⚠️ **MMKV / New Architecture:** if you see `react-native-mmkv 3.x.x requires TurboModules, but the new architecture is not enabled!`, your Expo Go binary is outdated or doesn't have the [New Architecture](https://docs.expo.dev/guides/new-architecture/) enabled. Reinstall Expo Go from the link above, or fall back to a Development Build (Option B).

#### Option B — Development Build with EAS (recommended for full feature support)

A [development build](https://docs.expo.dev/develop/development-builds/introduction/) is a custom version of Expo Go that includes this project's exact native modules — required when third-party libraries (like `react-native-mmkv` 3.x) need TurboModules or aren't bundled in stock Expo Go. See Expo's tutorials on [creating](https://docs.expo.dev/tutorial/eas/configure-development-build/) and [installing](https://docs.expo.dev/tutorial/eas/android-development-build/) Android development builds.

1. **Install the [EAS CLI](https://docs.expo.dev/eas/)** globally:

   ```bash
   npm install -g eas-cli
   ```

2. **Log in** with your Expo account:

   ```bash
   eas login
   ```

3. **Create an Expo project** on the [Expo dashboard](https://expo.dev/accounts/[account]/projects) and copy its `projectId` into your `.env` as `EXPO_PUBLIC_EAS_PROJECT_ID` (consumed by [`app.config.ts`](app.config.ts)). See [Using EAS with an existing project](https://docs.expo.dev/build/setup/).

4. **Configure EAS** (only needed once per repo — generates [`eas.json`](https://docs.expo.dev/build/eas-json/)):

   ```bash
   eas build:configure
   ```

5. **Build a development APK** (cloud build — see [`eas build`](https://docs.expo.dev/build/introduction/)):

   ```bash
   bun run build:android
   # equivalent to: eas build --platform android --profile development
   ```

   When the build finishes, install it on your device using one of:

   - The **Install** QR code from the EAS dashboard.
   - [Expo Orbit](https://expo.dev/orbit) — a desktop helper that installs builds on a connected device or emulator with one click.
   - `adb install path/to/capsula.apk`.

6. **Run the dev server** and open the installed development build on the device:

   ```bash
   bun run dev
   ```

#### Generating Native Projects Locally (advanced)

If you need to inspect or modify the native Android/iOS projects directly (e.g. for native debugging), you can generate them with [`expo prebuild`](https://docs.expo.dev/workflow/prebuild/):

```bash
bunx expo prebuild
```

This is **not** required for the Expo Go or EAS development build flows above.

#### Useful Expo references

- [Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/) — official, OS-aware checklist.
- [Development builds: introduction](https://docs.expo.dev/develop/development-builds/introduction/) — when and why to use one.
- [EAS Build configuration](https://docs.expo.dev/build/eas-json/) — `eas.json` reference.
- [Upgrading Expo SDK](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) — incremental SDK upgrades.
- [Debugging Expo apps](https://docs.expo.dev/debugging/runtime-issues/) — runtime troubleshooting.

## 🏗 Architecture

### Technology Stack

- [**React Native**](https://reactnative.dev/) + **TypeScript** + [**Expo**](https://docs.expo.dev/) for cross-platform development
- **Zustand** for state management with MMKV persistence
- **Ethers.js** for blockchain interactions
- **Drizzle ORM** with [**Expo SQLite**](https://docs.expo.dev/versions/latest/sdk/sqlite/) for local-first data storage
- [**Expo SecureStore**](https://docs.expo.dev/versions/latest/sdk/securestore/) for cryptographic key management
- [**Expo Router**](https://docs.expo.dev/router/introduction/) for file-based navigation

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

1. **Implement the interface:**

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

1. **Register in host:**
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

### Project docs

- **[Development Workflow](docs/development-workflow.md)** - Setup and contribution guide
- **[Mini-App System Architecture](docs/mini-app-system-mvp-architecture.md)** - Technical architecture
- **[Complete Specification](docs/capsula_all_documentation.md)** - Full project requirements

### Expo & React Native references

- [Expo documentation home](https://docs.expo.dev/)
- [Expo SDK 54 reference](https://docs.expo.dev/versions/v54.0.0/)
- [Expo CLI commands](https://docs.expo.dev/more/expo-cli/)
- [EAS Build](https://docs.expo.dev/build/introduction/) and [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [New Architecture in Expo](https://docs.expo.dev/guides/new-architecture/)
- [React Native docs](https://reactnative.dev/docs/getting-started)

## 🛠 Build & Deploy

### Development Testing

```bash
bun run dev              # Start Metro bundler
bun run android         # Test on Android device
```

### Expo Development build

```bash
bun run build:android
```

See [Running on Your Device → Option B](#option-b--development-build-with-eas-recommended-for-full-feature-support) for the full flow, and Expo's [development builds guide](https://docs.expo.dev/develop/development-builds/introduction/) for background.

### Production Build

```bash
./scripts/build-android.sh  # Build Android APK
```

For store-ready binaries, see Expo's docs on [internal distribution](https://docs.expo.dev/build/internal-distribution/) and [Google Play submission](https://docs.expo.dev/submit/android/).

### Automated Deployment

GitHub Actions automatically builds APKs on push to main branch — see Expo's [GitHub Actions integration](https://docs.expo.dev/eas/workflows/get-started/) for reference workflows.

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