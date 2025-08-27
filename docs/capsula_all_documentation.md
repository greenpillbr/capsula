# Capsula

## Project Description
**Capsula: The Greenpill BR Crypto Wallet**

**Project Vision:** Create a native-first mobile application, **"Capsula,"** built with **React Native** and **Expo**, to serve as an intuitive and aesthetically pleasing crypto wallet for the Greenpill BR (GPBR) community. The app's core mission is to provide a simplified, beginner-friendly entry point into the world of crypto, specifically for those interested in autonomy and regeneration, while being architected for a future of limitless, user-installed functionality. The design should be **minimalistic, vibrant, and incredibly easy to use**, focusing on a delightful user experience.

---
### **1. Core Technical Requirements**
- **Technology Stack:** The entire application must be built using **React Native** with **TypeScript** and **Expo**. This includes a unified codebase for both iOS and Android.
- **Architecture:** Implement a modular, scalable architecture. The core wallet should be a stable foundation, with the ability for new features to be seamlessly added via a modular "mini-app" system. This system should be the central pillar of the app's design. All storage should be local, no remote data access, unless via mini-apps.
- **State Management:** Use a robust and modern state management solution like **Zustand** that can handle the complexity of both the core wallet and dynamic, add-on modules.
- **Blockchain Integration:** The app must interact with the Ethereum blockchain and several Layer 2 networks. A stable library for web3 interactions like **Ethers.js** is required.
- **Security:** Key management and transaction signing are paramount. The implementation must prioritize security, with secure on-device storage for private keys.
---
### **2. Core Wallet Functionality**
- **Onboarding:** A simplified onboarding flow where users can create their key using a **Passkey** for simplicity and easier single-click onboarding.
    - Users should later, on their profile settings page, have the optional, educational choice to export their 12-word seed phrase. The app should guide them through understanding why this is important without making it a mandatory or intimidating step.
- **Network Support:** The wallet must support the following networks from the start: **Ethereum Mainnet, CELO and Gnosis**, as well as their respective testnets. The architecture should be extensible to allow for the easy addition of new EVM-compatible networks in the future.
- **Basic Wallet Features:**
    - Unlock the wallet's main screen with a Passkey and use a Passkey to authorize transactions.
    - Network switcher.
    - Profile page allowing you to add more wallets and switch between the active wallet.
    - Clearly display your address and allow it to be copied to the clipboard.
    - Send and receive crypto (via address or QR code).
    - View current token balances across all supported networks.
    - Transactions: Display a comprehensive transaction history.
    - Bell icon on top: Notification of transactions.
    - Display a list of buttons for starting mini-apps.
- **Mini-app finder screen**:
    - Enhance Wallet by installing Mini-Apps.
    - Search for a specific app or browse from a list.
    - After installation, a new button will be visible on the main screen.

---

### **3. Modular Architecture: The "Mini-App" System**

The app's design must be centered around the idea of installable, curated third-party modules.
- **Module System:** Develop a framework that allows for "mini-apps" to be installed, managed, and displayed within the core wallet interface.
- **Initial Modules:** The first version of Capsula will ship with the following four built-in modules, but leave those for later, prioritize building a functional wallet first.
    - **Tokens Module:** A user interface to add tokens from a list of curated ERC-20 tokens, but also allowing you to add custom ERC-20 tokens by providing a contract address and the network it's on.
    - **NFT Module:** A viewer for NFTs from a list of pre-defined, monitored collections, but also allowing you to add custom ERC-721 or ERC-1155 tokens by providing a collection address and the network it's on. This module should display the NFT's image, name, and collection details.
    - **Contacts Module:** A feature to save contacts with names and associated wallet addresses, simplifying the process of sending tokens. This module should be architected to potentially support messaging features in the future.
    - **Example Module:** A sample module showing how to access a basic ERC-20 smart contract and invoke contract functions to display data and perform actions via a button click.

---
### **4. Deliverables**
- A publicly available and well-documented source code repository on **GitHub**.
- Complete documentation for the project, including how to set up the development environment, build the application, and contribute to the codebase.
- A binary **APK file** for direct installation on Android devices.

## Product Requirements Document
CAPSULA: THE GREENPILL BR CRYPTO WALLET PRD

1. INTRODUCTION AND PROJECT VISION

Project Name: Capsula: The Greenpill BR Crypto Wallet

Vision: Capsula is a native-first mobile application built with React Native and Expo, designed to be an intuitive and aesthetically pleasing crypto wallet specifically for the Greenpill BR (GPBR) community. Its core mission is to provide a simplified, beginner-friendly entry point into the world of crypto for individuals interested in autonomy and regeneration. The app is architected for a future of limitless, user-installed functionality through a modular \"mini-app\" system. The design emphasizes a minimalistic, vibrant, and incredibly easy-to-use experience, focusing on delightful user interaction.

Target Audience: The primary target audience is the Greenpill BR (GPBR) community, largely located in the southeastern region of Brazil. This community consists of farmers, agroecologists, land regenerators, and crypto activists. They possess moderate knowledge of technology and apps and view crypto as a source of additional income and funding for their regenerative projects. They seek simple, uncluttered interfaces that streamline their crypto interactions without constant context switching, as they are often overwhelmed by numerous platforms and tools.

2. GOALS AND OBJECTIVES

Overall Goal: To empower the GPBR community by providing a user-friendly, secure, and extensible mobile crypto wallet that simplifies access to blockchain technology and regenerative finance.

Key Objectives:
*   Deliver a functional Minimum Viable Product (MVP) within less than a week.
*   Provide a native-first mobile experience for both Android and iOS from a unified codebase.
*   Establish a Passkey-first onboarding and transaction authorization flow for maximum simplicity.
*   Enable seamless interaction with key EVM-compatible networks (Ethereum Mainnet, CELO, Gnosis) from launch.
*   Develop a robust, modular \"mini-app\" architecture to allow for future expansion and community-driven features.
*   Prioritize a minimalistic, vibrant, and intuitive user experience inspired by leading mobile wallets like Coinbase's Base wallet and Valora.
*   Ensure high-level security for key management and transaction signing.

3. SCOPE

3.1. IN-SCOPE (MVP)

Technology Stack:
*   React Native with TypeScript and Expo for a unified iOS/Android codebase.
*   Zustand for robust state management.
*   Ethers.js for Ethereum blockchain and Layer 2 network interactions.
*   Local storage for all core wallet data; no remote data access unless via mini-apps.

Core Wallet Functionality:
*   Simplified onboarding flow with Passkey creation as the default.
*   Optional, educational seed phrase export on the profile settings page.
*   Support for Ethereum Mainnet, CELO, Gnosis, and their respective testnets.
*   Extensible architecture for adding new EVM-compatible networks from Chainlist.org API, with community recommendations.
*   Wallet unlock and transaction authorization via Passkey (with PIN/password fallback).
*   Network switcher.
*   Profile page to add and switch between multiple wallets.
*   Clear display of wallet address with copy-to-clipboard functionality.
*   Send and receive crypto via address or QR code.
*   Display of current token balances across all supported networks.
*   Comprehensive transaction history display.
*   In-app notification system (bell icon) for transactions.
*   Gas fee estimation using Infura API, with warnings for unusual fees.

Modular Architecture (\"Mini-App\" System):
*   Framework for installing, managing, and displaying mini-apps within the core wallet.
*   Mini-app finder screen allowing search and browsing from a curated list, grouped by category and community.
*   Installed mini-apps appear as dedicated buttons on the main screen.
*   Contextual display of mini-apps based on the currently selected network.
*   Community following feature to install recommended networks and mini-apps.
*   Simple Mini-App SDK with an example app, ABI-to-UI binding for smart contract interaction via JSON configuration, and support for custom UI components.

Initial Built-in Mini-Apps (MVP):
*   Tokens Module: UI to add/manage curated ERC-20 tokens and custom ERC-20 tokens (via contract address, network).
*   NFT Module: Viewer for NFTs from predefined collections; allows adding custom ERC-721/ERC-1155 tokens (via collection address, network), displaying image, name, and collection details.
*   Contacts Module: Feature to save contacts with names and associated wallet addresses.
*   Example Module: Sample demonstrating basic ERC-20 smart contract interaction (data display, function invocation).

Deliverables:
*   Publicly available and well-documented GitHub source code repository.
*   Complete project documentation (dev setup, build, contribution guides).
*   Binary APK file for Android device installation.

3.2. OUT-OF-SCOPE (MVP)

*   Messaging features within the Contacts module (future consideration).
*   Support for non-EVM compatible blockchain networks.
*   Direct user installation of arbitrary, uncurated mini-apps.
*   Complex dApp browser functionality (focus is on direct smart contract interaction via curated mini-apps).
*   Official iOS App Store release (APK first for Android).
*   Advanced DeFi integrations beyond basic token/NFT viewing and sending.

4. FUNCTIONAL REQUIREMENTS

4.1. Onboarding & Wallet Management
*   FR1.1: The app shall provide a simplified onboarding flow allowing users to create a new wallet using a Passkey for single-click setup.
*   FR1.2: Users shall have the option, on their profile settings page, to export their 12-word seed phrase, with educational guidance on its importance.
*   FR1.3: The profile page shall allow users to add additional wallets.
*   FR1.4: Users shall be able to switch between active wallets from the profile page.
*   FR1.5: In cases where Passkey is unavailable or undesired, the app shall offer a backup flow to create a wallet via seed phrase, with options for backup/restore and a transaction PIN/password.

4.2. Network & Token Management
*   FR2.1: The app shall support Ethereum Mainnet, CELO, Gnosis, and their respective testnets from launch.
*   FR2.2: The architecture shall allow for easy addition of new EVM-compatible networks in the future.
*   FR2.3: A clear network switcher UI shall be available for users to select their active network.
*   FR2.4: Users shall be able to add and remove networks by searching from the Chainlist.org API, with recommended community networks prominently displayed.
*   FR2.5: The app shall display the base network token (used for gas) for each supported network.
*   FR2.6: Network data (name, chain ID, RPC) shall be stored locally and re-verified against Chainlist.org API upon app opening, notifying the user of any changes.

4.3. Basic Wallet Operations
*   FR3.1: Users shall unlock the main wallet screen using their Passkey.
*   FR3.2: Users shall authorize transactions using their Passkey.
*   FR3.3: The wallet's current address shall be clearly displayed and allow for one-click copying.
*   FR3.4: Users shall be able to send crypto by entering a recipient address, selecting from contacts, or scanning a QR code.
*   FR3.5: Users shall be able to display their wallet address as a QR code for receiving crypto.
*   FR3.6: The app shall display current token balances for all supported networks.
*   FR3.7: A comprehensive transaction history shall be available, showing status and allowing for possible actions.
*   FR3.8: A bell icon on the top bar shall notify users of transaction updates and other important events.
*   FR3.9: Gas fee estimations shall be provided using data from the Infura API, with visual warnings (e.g., red ink) if fees appear unusually high.

4.4. Mini-App System
*   FR4.1: The app shall implement a modular framework for mini-apps to be installed, managed, and integrated into the wallet UI.
*   FR4.2: A dedicated \"Mini-App Finder\" screen shall allow users to search for specific apps or browse from a curated list.
*   FR4.3: After installation, new mini-apps shall appear as clickable buttons on the wallet's main screen.
*   FR4.4: Mini-apps shall only be visible/listed if they are available on the currently selected network.
*   FR4.5: The mini-app marketplace shall be curated, allowing categorization and suggestions based on communities.
*   FR4.6: A \"communities banner\" shall display available communities to follow, and following a community shall automatically install its recommended networks and mini-apps.
*   FR4.7: A simple Mini-App SDK shall be provided, including an example app, and documentation on how to bind smart contract ABIs to pre-provided UI components (potentially via JSON configuration) or create custom components.

4.5. Core Built-in Mini-Apps (MVP)
*   FR5.1 (Tokens Module): Users shall be able to add ERC-20 tokens from a curated list.
*   FR5.2 (Tokens Module): Users shall be able to add custom ERC-20 tokens by providing a contract address and the network.
*   FR5.3 (NFT Module): Users shall be able to view NFTs from pre-defined, monitored collections.
*   FR5.4 (NFT Module): Users shall be able to add custom ERC-721 or ERC-1155 tokens by providing a collection address and the network, displaying the NFT's image, name, and collection details.
*   FR5.5 (Contacts Module): Users shall be able to save contacts with names and associated wallet addresses.
*   FR5.6 (Example Module): This module shall demonstrate accessing an ERC-20 smart contract, invoking contract functions, and displaying data via UI components.

5. NON-FUNCTIONAL REQUIREMENTS

5.1. Performance
*   NFR1.1: Most application load times and critical user interactions shall complete in less than one second.
*   NFR1.2: The app shall provide responsive animated loading screens during data fetching or intensive operations.
*   NFR1.3: All fetched data for mini-apps and core wallet functions shall be stored and cached locally within the state store to minimize repeated network calls.
*   NFR1.4: The Mini-App SDK shall guide developers to utilize external caches (e.g., GraphQL APIs) when possible, before querying the blockchain directly, to optimize performance.

5.2. Security
*   NFR2.1: Private keys shall be stored securely using on-device secure storage mechanisms (e.g., Android Keystore, iOS Keychain).
*   NFR2.2: Passkey integration shall be the default and primary method for authorizing transactions and wallet access.
*   NFR2.3: Robust key management practices shall be implemented to protect user assets.
*   NFR2.4: The mini-app marketplace shall undergo a curation process to ensure the security and trustworthiness of listed modules.

5.3. Usability & User Experience (UX)
*   NFR3.1: The app shall feature a minimalistic, vibrant, and aesthetically pleasing design, inspired by wallets like Coinbase's Base and Valora.
*   NFR3.2: The user interface shall be intuitive, simple, and beginner-friendly, catering to users with moderate technical knowledge.
*   NFR3.3: The overall user experience shall be delightful, reducing common crypto complexities and context switching.

5.4. Scalability & Extensibility
*   NFR4.1: The core wallet architecture shall be modular and scalable, allowing for the seamless addition of new features and mini-apps without requiring core app updates.
*   NFR4.2: The use of React Native and Expo shall ensure a unified codebase for efficient development and maintenance across iOS and Android.
*   NFR4.3: The network integration architecture shall be extensible to easily support new EVM-compatible chains in the future.
*   NFR4.4: The Mini-App SDK shall simplify developer contributions by providing components and methods for binding smart contract calls to UI, allowing for both JSON-based configuration and custom component development.

5.5. Maintainability
*   NFR5.1: The codebase shall be publicly available on GitHub and well-documented for future maintenance and community contributions.
*   NFR5.2: The use of modern and robust technologies (React Native, TypeScript, Expo, Zustand, Ethers.js) shall contribute to long-term maintainability.

6. CORE TECHNICAL REQUIREMENTS (Summary)

*   Technology Stack: React Native, TypeScript, Expo, Zustand, Ethers.js. Unified codebase for iOS and Android.
*   Architecture: Modular, scalable. Core wallet as a stable foundation. Modular \"mini-app\" system as central pillar. All core storage local, no remote data access unless via mini-apps.
*   Blockchain Integration: Ethereum blockchain and several Layer 2 networks, starting with Ethereum Mainnet, CELO, Gnosis and their testnets.
*   Security: Secure on-device storage for private keys. Passkey for key management and transaction signing.

7. DELIVERABLES

*   A publicly available and well-documented source code repository on GitHub.
*   Comprehensive documentation covering:
    *   Development environment setup instructions.
    *   Application build instructions.
    *   Contribution guidelines for developers.
    *   Mini-App SDK documentation with examples.
*   A binary APK file for direct installation on Android devices.

8. TIMELINE AND CONSTRAINTS

*   MVP Release: Targeted for less than one week from project commencement.
*   Development Team: Single seasoned solo developer with additional \"vibe coding aid.\"
*   Budget: Implicitly lean, prioritizing rapid MVP development.
*   Future Roadmap: Subsequent releases will focus on adding more mini-apps and expanding community features.

## Technology Stack
CAPSULA: THE GREENPILL BR CRYPTO WALLET TECHSTACK

This document outlines the recommended technology stack for the "Capsula" project, a native-first mobile application designed to be a user-friendly crypto wallet for the Greenpill BR community. The chosen technologies prioritize ease of use, security, modularity, performance, and future scalability.

### 1. Core Mobile Development

**1.1. React Native**
*   **Description:** A JavaScript framework for building native mobile applications for iOS and Android from a single codebase.
*   **Justification:** Aligns perfectly with the "native-first mobile application" requirement, allowing for efficient cross-platform development. Its large community, extensive libraries, and strong performance characteristics make it ideal for a vibrant, responsive user experience.

**1.2. Expo**
*   **Description:** A set of tools and services built around React Native that simplifies development, build processes, and deployment.
*   **Justification:** Essential for achieving the "first MVP version in less than a week" goal. Expo provides pre-built modules, simplified dependency management, over-the-air updates, and streamlined build pipelines (e.g., for APK generation), significantly accelerating development cycles and reducing complexity for a solo developer. It ensures a unified codebase for iOS and Android with minimal configuration.

**1.3. TypeScript**
*   **Description:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Justification:** Crucial for maintaining code quality, readability, and scalability, especially with a modular architecture and future "limitless, user-installed functionality". TypeScript catches errors at compile-time, improves developer productivity through better tooling and auto-completion, and makes complex state management and API interactions more robust.

### 2. Architecture & State Management

**2.1. Modular "Mini-App" System**
*   **Description:** A core architectural paradigm where new features are introduced as installable, curated modules ("mini-apps") that integrate seamlessly into the core wallet interface.
*   **Justification:** This system is the "central pillar of the app's design" and directly supports the vision of "limitless, user-installed functionality". It enables the core wallet to remain stable and lightweight while allowing for diverse community-specific tools and features to be added dynamically, enhancing user value without bloating the main application.

**2.2. Zustand**
*   **Description:** A fast, lightweight, and scalable state management solution for React and React Native.
*   **Justification:** Chosen for its ability to handle the "complexity of both the core wallet and dynamic, add-on modules". Zustand's minimalistic API, lack of boilerplate, and excellent performance make it ideal for managing global state efficiently, including wallet data, network information, and mini-app specific data, ensuring the app remains performant with "most load times happening in less than a second". Its simplicity aids rapid development and maintainability for a solo developer.

**2.3. Local Storage First (No Remote Data Access for Core Wallet)**
*   **Description:** The core wallet logic and data (wallets, networks, mini-app configurations, cached data) are stored locally on the device.
*   **Justification:** Prioritizes user "autonomy and regeneration" by giving them full control over their data. This approach significantly enhances security and privacy by minimizing external dependencies and potential attack vectors. It also contributes to performance, as most operations occur on-device. Remote data access is explicitly reserved for mini-apps, allowing for flexibility while maintaining core wallet integrity.

### 3. Blockchain & Web3 Integration

**3.1. Ethers.js**
*   **Description:** A comprehensive and robust library for interacting with the Ethereum blockchain and its ecosystem.
*   **Justification:** As a "stable library for web3 interactions", Ethers.js provides all necessary functionalities for blockchain integration, including wallet creation, transaction signing, interaction with smart contracts, and event listening. Its reliability and strong community support are critical for secure and efficient blockchain interactions, especially with "Ethereum Mainnet, CELO and Gnosis" and future EVM-compatible networks.

**3.2. EVM-Compatible Networks**
*   **Description:** Support for blockchain networks compatible with the Ethereum Virtual Machine (EVM).
*   **Justification:** The project explicitly targets "Ethereum Mainnet, CELO and Gnosis" and states the "architecture should be extensible to allow for the easy addition of new EVM-compatible networks in the future". This focus aligns with the initial scope and allows for future expansion into various Layer 2 solutions and other EVM chains relevant to the GPBR community.

**3.3. Chainlist API**
*   **Description:** An API service that provides up-to-date information about EVM-compatible networks (RPC URLs, chain IDs, symbols, etc.).
*   **Justification:** Enables users to "add Networks by selecting from Chainlist API" and ensures that network data (like RPC servers) is "rechecked against chainlist" for accuracy and resilience. This dynamic network management is crucial for the extensibility requirement and for keeping Capsula up-to-date with evolving blockchain ecosystems.

**3.4. Infura API (or similar RPC provider)**
*   **Description:** A blockchain infrastructure provider offering reliable access to Ethereum and other networks via RPC endpoints.
*   **Justification:** Required for "gas fee estimations" and reliable interaction with blockchain data. While mini-apps are encouraged to use GraphQL caches, a direct RPC provider like Infura is essential for core wallet functions like sending transactions and querying on-chain data for gas estimations, ensuring accuracy and stability ("warn the user with red ink in case something is too off").

### 4. Security & Key Management

**4.1. Passkeys (WebAuthn)**
*   **Description:** A modern, phishing-resistant, and user-friendly authentication method leveraging device biometrics or PINs.
*   **Justification:** The primary method for "simplified onboarding" and authorizing transactions, fulfilling the "Passkey for simplicity and easier single-click onboarding" requirement. Passkeys significantly enhance security by eliminating passwords and seed phrases as initial points of failure, making crypto "friendlier and less complicated" for the target audience.

**4.2. Secure On-Device Storage (e.g., React Native KeyChain, iOS KeyChain, Android Keystore)**
*   **Description:** Native device-level secure storage mechanisms for sensitive data like private keys and seed phrases.
*   **Justification:** "Key management and transaction signing are paramount." Private keys, even if derived from a Passkey, must be stored in the most secure manner possible on the device. This ensures that cryptographic material is protected from unauthorized access, aligning with the project's high security standards.

**4.3. Seed Phrase Export & Backup Flow**
*   **Description:** An optional feature allowing users to export their 12-word seed phrase, with a backup flow for manual wallet creation and a transaction password/PIN fallback.
*   **Justification:** Provides "educational choice" and ensures user "autonomy" by allowing them to control their keys fully, while not intimidating beginners with immediate seed phrase requirements. The backup flow with a transaction PIN offers a robust alternative if Passkeys are unavailable or not preferred, catering to diverse user needs and ensuring access to funds.

### 5. Data Management & APIs

**5.1. Local Database (e.g., SQLite via WatermelonDB/Realm, or AsyncStorage for simpler use cases)**
*   **Description:** A local, on-device database for persistent storage of structured data.
*   **Justification:** While the specific technology wasn't called out, a robust local database is essential for storing "wallets and addresses independent of the network", "available networks" (potentially from Chainlist), "tokens" with their details, and "mini-app database" information (title, description, version, categories, communities, network availability). This ensures fast access, offline capabilities, and data persistence for the "fully loaded on the user device" experience. Given the "modular, scalable architecture", a solution like WatermelonDB (built on SQLite) could be beneficial for its reactive data model and performance with larger datasets, or Realm for cross-platform object persistence.

**5.2. GraphQL Caches (Recommended for Mini-App Developers)**
*   **Description:** A server-side caching layer using GraphQL to aggregate and optimize blockchain data queries.
*   **Justification:** Explicitly recommended for mini-app developers to "try to always use external caches (like GraphQL) when possible before querying the blockchain directly." This strategy is crucial for "performance scalability metrics" and ensuring "most load times should happen in less than a second," as it significantly reduces the load on RPC endpoints and improves data retrieval speed for complex blockchain interactions.

### 6. Development & Tooling

**6.1. GitHub**
*   **Description:** A web-based platform for version control and collaboration using Git.
*   **Justification:** Required for the "publicly available and well-documented source code repository". GitHub provides essential tools for version control, issue tracking, project management, and collaboration, supporting open-source best practices and project transparency.

**6.2. Mini-App SDK**
*   **Description:** A software development kit providing tools, libraries, and examples for building Capsula mini-apps.
*   **Justification:** Fundamental for the "modular architecture: The "Mini-App" System". The SDK will provide "example app that connects directly to a smart contract by reading its ABI and exposing the contract functions" and "simple UI components already provided by Capsula". It streamlines mini-app development, ensures consistency, and allows developers to build new features efficiently, even by just "writing a JSON file binding smart contract calls to UI components."

### 7. Deployment

**7.1. Android APK File**
*   **Description:** The Android Application Package file format used for distribution and installation of mobile apps on Android devices.
*   **Justification:** A specific "deliverable" requirement, allowing for "direct installation on Android devices." Expo's build services will be instrumental in generating this artifact efficiently.

## Project Structure
PROJECT STRUCTURE

This document outlines the file and folder organization for the Capsula project, emphasizing a modular and scalable architecture that supports the core wallet functionalities and the "mini-app" system. The structure is designed for clarity, maintainability, and ease of contribution.

```
./
├── .expo/
├── .github/
├── .vscode/
├── android/
├── ios/
├── assets/
├── documentation/
├── e2e/
├── scripts/
├── src/
│   ├── App.tsx
│   ├── common/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── types/
│   │   └── utils/
│   ├── config/
│   ├── constants/
│   ├── lib/
│   │   ├── api/
│   │   ├── ethers.ts
│   │   ├── passkey.ts
│   │   ├── secureStorage.ts
│   │   └── web3.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   └── utils/
│   │   ├── mini-app-host/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── runtime/
│   │   │   └── types/
│   │   ├── mini-app-marketplace/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── data/
│   │   │   └── screens/
│   │   ├── mini-app-modules/
│   │   │   ├── contacts/
│   │   │   │   ├── components/
│   │   │   │   ├── logic/
│   │   │   │   └── types/
│   │   │   ├── example/
│   │   │   │   ├── components/
│   │   │   │   ├── contract/
│   │   │   │   └── types/
│   │   │   ├── nfts/
│   │   │   │   ├── components/
│   │   │   │   ├── logic/
│   │   │   │   └── types/
│   │   │   └── tokens/
│   │   │       ├── components/
│   │   │       ├── logic/
│   │   │       └── types/
│   │   ├── navigation/
│   │   ├── networks/
│   │   │   ├── components/
│   │   │   ├── logic/
│   │   │   └── types/
│   │   ├── notifications/
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   └── screens/
│   │   └── wallet/
│   │       ├── components/
│   │       ├── screens/
│   │       └── services/
│   ├── navigation/
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── index.ts
│   │   ├── miniAppStore.ts
│   │   ├── networkStore.ts
│   │   └── walletStore.ts
│   └── types/
├── __tests__/
├── .editorconfig
├── .eslintignore
├── .eslintrc.js
├── .gitignore
├── .prettierignore
├── .prettierrc.js
├── app.json
├── babel.config.js
├── jest.config.js
├── LICENSE
├── package.json
├── README.md
├── tsconfig.json
└── yarn.lock
```

### **Detailed Directory Explanations**

**Root Directory (`./`)**
*   `.expo/`: Generated files by Expo CLI. Should be ignored in version control.
*   `.github/`: Contains GitHub-specific configurations, such as workflows for CI/CD, issue templates, and pull request templates.
*   `.vscode/`: Recommended VS Code settings for the project, including extensions, linting rules, and launch configurations.
*   `android/`: Native Android project files, managed by Expo.
*   `ios/`: Native iOS project files, managed by Expo.
*   `assets/`: Static assets for the application like fonts, images, and icons that are not specific to any particular module.
*   `documentation/`: Markdown files, diagrams, and other project-level documentation (e.g., architecture, deployment guides, contribution guidelines). This will contain other generated documents.
*   `e2e/`: End-to-end test files, typically using a framework like Detox.
*   `scripts/`: Utility scripts for development, building, deployment, or other automation tasks.
*   `src/`: The core application source code. This is where most development work will take place.
*   `__tests__/`: Unit and integration test files, typically co-located with the source files but sometimes in a dedicated root directory for broader tests.
*   `.editorconfig`: Configuration for consistent coding styles across different editors.
*   `.eslintignore`: Files and directories to be ignored by ESLint.
*   `.eslintrc.js`: ESLint configuration for code linting.
*   `.gitignore`: Specifies intentionally untracked files to ignore.
*   `.prettierignore`: Files and directories to be ignored by Prettier.
*   `.prettierrc.js`: Prettier configuration for consistent code formatting.
*   `app.json`: Expo application configuration file.
*   `babel.config.js`: Babel configuration for JavaScript transpilation.
*   `jest.config.js`: Jest configuration for testing.
*   `LICENSE`: Project license file (e.g., MIT, Apache).
*   `package.json`: Project metadata, dependencies, and scripts.
*   `README.md`: Main project README, providing an overview, setup instructions, and contribution guidelines.
*   `tsconfig.json`: TypeScript compiler configuration.
*   `yarn.lock`: Yarn dependency lock file.

**Source Directory (`src/`)**
*   `App.tsx`: The primary entry point for the React Native application. Initializes global providers and the main navigation stack.
*   `common/`: Contains shared, reusable code that is not tied to any specific application feature.
    *   `components/`: Generic, reusable UI components (e.g., Button, Modal, Card) that can be used across different modules.
    *   `hooks/`: Custom React hooks for common logic (e.g., `useDebounce`, `useTheme`).
    *   `styles/`: Global style definitions, theme configurations, color palettes, and typography.
    *   `types/`: Global TypeScript type definitions and interfaces that are used across multiple modules.
    *   `utils/`: General utility functions (e.g., `formatDate`, `validateEmail`) that don't fit into a specific module or hook.
*   `config/`: Application-wide configuration values, environment variables, API endpoints, default network settings, etc.
*   `constants/`: Non-configurable, immutable values used throughout the application (e.g., error messages, status codes).
*   `lib/`: Wrappers or initializers for third-party libraries and core services.
    *   `api/`: Configuration and instances for external APIs like Chainlist, Infura, or any other data sources.
    *   `ethers.ts`: Initialization and configuration of the Ethers.js library for blockchain interactions.
    *   `passkey.ts`: Logic and integration for Passkey authentication and transaction signing.
    *   `secureStorage.ts`: Utility for secure, encrypted on-device storage (e.g., for private keys, sensitive user data).
    *   `web3.ts`: Higher-level abstractions over Ethers.js or other blockchain libraries, providing simplified methods for common web3 operations.
*   `modules/`: The heart of the modular architecture. Each subdirectory here represents a distinct feature or a mini-app.
    *   `auth/`: Handles user authentication, onboarding flows, Passkey setup, seed phrase generation/export, and wallet creation/recovery.
        *   `components/`: UI components specific to the authentication process.
        *   `screens/`: Full-page screens for onboarding, login, seed phrase backup.
        *   `utils/`: Authentication-related utility functions.
    *   `mini-app-host/`: Contains the framework and logic for running and managing installed mini-apps within the Capsula environment.
        *   `components/`: UI components for mini-app containers, error boundaries, and integration points.
        *   `context/`: React Contexts for providing mini-apps with access to core wallet functionalities (e.g., signing transactions).
        *   `runtime/`: Logic for sandboxing, loading, and executing mini-app code, including how they interact with the core app's state and blockchain connections.
        *   `types/`: TypeScript definitions for the mini-app interface and communication protocols.
    *   `mini-app-marketplace/`: Manages the discovery, browsing, and installation of mini-apps.
        *   `api/`: Logic for fetching mini-app listings from a curated source or community APIs.
        *   `components/`: UI for displaying mini-app cards, categories, and search results.
        *   `data/`: Local data structures for pre-installed or recommended mini-apps, community banners.
        *   `screens/`: The "Mini-app finder" screen.
    *   `mini-app-modules/`: This directory houses the built-in mini-apps that ship with Capsula.
        *   `contacts/`: The Contacts mini-app for saving and managing wallet addresses with names.
            *   `components/`: UI components for contact lists, add/edit forms.
            *   `logic/`: Business logic for contact management, storage, and retrieval.
            *   `types/`: Types for contact data.
        *   `example/`: A sample mini-app demonstrating how to interact with a smart contract, providing a template for mini-app developers.
            *   `components/`: UI components for the example module.
            *   `contract/`: ABI definitions and interaction logic for the example smart contract.
            *   `types/`: Types for the example module's data and contract interactions.
        *   `nfts/`: The NFT viewer mini-app for displaying ERC-721 and ERC-1155 tokens.
            *   `components/`: UI for displaying NFT images, details, and collection information.
            *   `logic/`: Logic for fetching NFT data, managing curated collections, and adding custom NFTs.
            *   `types/`: Types for NFT data and collections.
        *   `tokens/`: The Tokens mini-app for managing and viewing ERC-20 token balances, and adding custom tokens.
            *   `components/`: UI for token lists, adding custom tokens by contract address.
            *   `logic/`: Logic for fetching token balances, managing curated token lists, and adding custom tokens.
            *   `types/`: Types for token data.
    *   `navigation/`: Module-specific navigation stacks or navigators that are then composed into the main app navigation.
    *   `networks/`: Logic and UI for managing supported EVM networks, including switching between networks and adding new ones from Chainlist.
        *   `components/`: UI for network switcher, network settings.
        *   `logic/`: Logic for interacting with Chainlist API, managing network configurations.
        *   `types/`: Types for network data.
    *   `notifications/`: Handles in-app and push notifications, primarily for transaction updates.
        *   `components/`: UI for the bell icon and notification display.
        *   `services/`: Background service for listening to transaction events and generating notifications.
    *   `profile/`: User profile screen, allowing management of wallets, settings, and other personal preferences.
        *   `components/`: UI for profile details, settings options.
        *   `screens/`: The Profile screen itself.
    *   `wallet/`: The core wallet functionality, including displaying balances, sending/receiving crypto, and transaction history.
        *   `components/`: UI for balance display, send/receive forms, transaction list items.
        *   `screens/`: The main Wallet home screen and detailed transaction views.
        *   `services/`: Services for fetching balances, sending transactions, and monitoring transaction status.
*   `navigation/`: Centralized React Navigation configuration, defining the main app navigator, screens, and nested navigators.
*   `store/`: Zustand state management setup. Contains individual store definitions and an entry point to combine them.
    *   `authStore.ts`: Manages authentication state, including Passkey status, wallet unlocked status, and user session.
    *   `index.ts`: Combines all individual Zustand stores into a single, accessible store tree.
    *   `miniAppStore.ts`: Manages installed mini-apps, their configurations, and any mini-app specific local data.
    *   `networkStore.ts`: Manages the currently selected network, available networks, and network-related settings.
    *   `walletStore.ts`: Manages wallet addresses, private keys (securely), balances, and transaction history.
*   `types/`: General TypeScript type definitions and interfaces for the entire `src` directory, if not specific to a common utility or module.

## Database Schema Design
SCHEMADESIGN

This section outlines the database schema design for "Capsula," detailing the data models, relationships, and overall structure for local data storage. Given the project's requirement for local-first storage, the schema is designed for a lightweight, document-oriented approach, suitable for use with React Native's asynchronous storage mechanisms (e.g., AsyncStorage, Expo-Secure-Store) or a local embedded database (e.g., SQLite via expo-sqlite for more complex queries, or a key-value store for simpler data structures).



**Design Principles:**

*   **Local-First:** All data, except what mini-apps explicitly fetch from external sources (like blockchain or GraphQL caches), resides on the user's device.

*   **Security:** Sensitive information like encrypted private keys is handled with the highest security, leveraging platform-specific secure storage.

*   **Extensibility:** The schema is built to easily accommodate new networks, tokens, and mini-apps without requiring significant structural changes.

*   **Performance:** Data caching strategies are considered, especially for frequently accessed blockchain data, to ensure a responsive user experience.



---

**1. Data Models (Logical Collections/Entities)**



**1.1. UserSettings (Singleton)**

This collection stores global user preferences and application state.

*   `id`: String (Unique identifier, e.g., "user-settings", acts as a singleton key)

*   `activeWalletId`: String (References `Wallets.id` for the currently selected wallet)

*   `lastActiveNetworkChainId`: Number (References `Networks.chainId` for the last active network)

*   `onboardingComplete`: Boolean (True if the initial onboarding flow has been completed)

*   `passkeyEnabled`: Boolean (True if Passkey is the primary authentication method)

*   `pinEnabled`: Boolean (True if a backup PIN is configured)

*   `theme`: String (e.g., "system", "light", "dark" for UI theme)

*   `followedCommunities`: Array<String> (List of community identifiers the user follows, impacting recommended networks/mini-apps)

*   `createdAt`: Timestamp

*   `updatedAt`: Timestamp



**1.2. Wallets**

Stores information about each user's wallet. Sensitive key material is stored separately in `Expo-Secure-Store`.

*   `id`: String (UUID, Primary Key)

*   `name`: String (User-defined name for the wallet, e.g., "My Main Wallet")

*   `address`: String (The public blockchain address, e.g., "0x...")

*   `publicKey`: String (The public key associated with the wallet, derived from private key)

*   `keyRefId`: String (Reference ID to the securely stored encrypted private key or seed phrase in `Expo-Secure-Store`)

*   `isPasskeyBacked`: Boolean (True if this wallet's key management is primarily handled by Passkey)

*   `derivationPath`: String (The HD wallet derivation path, e.g., "m/44'/60'/0'/0/0", if applicable)

*   `createdAt`: Timestamp

*   `lastAccessedAt`: Timestamp



**1.3. Networks**

Stores configuration for supported EVM-compatible networks.

*   `chainId`: Number (Primary Key, unique identifier for the network, e.g., 1 for Ethereum Mainnet)

*   `name`: String (Display name, e.g., "Ethereum Mainnet")

*   `rpcUrl`: String (URL for the RPC endpoint, e.g., "https://mainnet.infura.io/v3/...")

*   `explorerUrl`: String (URL for the block explorer, e.g., "https://etherscan.io")

*   `nativeCurrencySymbol`: String (Symbol of the native currency, e.g., "ETH", "CELO")

*   `nativeCurrencyDecimals`: Number (Decimals of the native currency, e.g., 18)

*   `nativeCurrencyName`: String (Full name of the native currency, e.g., "Ether")

*   `iconUrl`: String (Optional URL for the network's icon)

*   `isDefault`: Boolean (True for networks shipped with the app or prominently recommended)

*   `isRecommended`: Boolean (True if recommended based on `UserSettings.followedCommunities` or other criteria)

*   `createdAt`: Timestamp

*   `updatedAt`: Timestamp (For re-checking against Chainlist API)



**1.4. Tokens**

Stores details for ERC-20, ERC-721, ERC-1155 tokens, and native currencies, associated with specific wallets and networks.

*   `id`: String (UUID, Primary Key, local identifier)

*   `walletId`: String (Foreign Key to `Wallets.id`)

*   `chainId`: Number (Foreign Key to `Networks.chainId`)

*   `contractAddress`: String (Token contract address; `null` for native currency)

*   `symbol`: String (Token symbol, e.g., "DAI", "WETH", "ETH")

*   `name`: String (Full token name, e.g., "Dai Stablecoin")

*   `decimals`: Number (Number of decimal places for ERC-20 tokens; `null` for NFTs)

*   `type`: String ("Native", "ERC20", "ERC721", "ERC1155")

*   `logoUrl`: String (Optional URL for the token's logo)

*   `isCustom`: Boolean (True if added by the user manually, false if from a curated list)

*   `balance`: String (Cached balance, stored as string to handle large numbers; updated periodically)

*   `lastBalanceUpdate`: Timestamp (Timestamp of the last balance fetch)



**1.5. NFTs**

Specific storage for NFT (ERC-721/ERC-1155) metadata and ownership. (Could be integrated into `Tokens` if preferred, but separate provides clearer structure for NFT viewer features).

*   `id`: String (UUID, Primary Key, local identifier)

*   `tokenId`: String (The unique ID of the NFT within its collection contract)

*   `tokenContractAddress`: String (The contract address of the NFT collection)

*   `chainId`: Number (Foreign Key to `Networks.chainId`)

*   `ownerWalletId`: String (Foreign Key to `Wallets.id` for the owning wallet)

*   `name`: String (NFT name, from metadata)

*   `description`: String (NFT description, from metadata)

*   `imageUrl`: String (URL to the NFT's primary image)

*   `animationUrl`: String (Optional URL for animated NFTs)

*   `externalUrl`: String (Link to the NFT's marketplace or project page)

*   `collectionName`: String (Name of the NFT collection)

*   `collectionSymbol`: String (Symbol of the NFT collection, if available)

*   `metadataUri`: String (URI where full metadata can be fetched)

*   `lastFetchedAt`: Timestamp (Timestamp of the last metadata fetch)



**1.6. Transactions**

History of blockchain transactions for each wallet on each network.

*   `id`: String (UUID, Primary Key, local identifier)

*   `walletId`: String (Foreign Key to `Wallets.id`)

*   `chainId`: Number (Foreign Key to `Networks.chainId`)

*   `hash`: String (Blockchain transaction hash, unique on-chain)

*   `fromAddress`: String (Sender's address)

*   `toAddress`: String (Recipient's address)

*   `value`: String (Amount of native currency or token transferred, as a string)

*   `gasUsed`: String (Amount of gas consumed)

*   `gasPrice`: String (Price of gas in Gwei)

*   `gasLimit`: String (Max gas allowed for transaction)

*   `blockNumber`: Number (Block number where transaction was confirmed)

*   `timestamp`: Timestamp (Timestamp of the block confirmation)

*   `status`: String ("Pending", "Confirmed", "Failed")

*   `type`: String ("Native Transfer", "ERC20 Transfer", "ERC721 Transfer", "ERC1155 Transfer", "Contract Call")

*   `tokenContractAddress`: String (Contract address if token transfer; `null` for native)

*   `tokenSymbol`: String (Symbol of the token involved, for display)

*   `tokenDecimals`: Number (Decimals of the token involved, for display)

*   `tokenAmount`: String (Amount of ERC-20 token transferred, as string)

*   `memo`: String (Optional user-added note for the transaction)

*   `isOutgoing`: Boolean (True if transaction originated from `walletId`)



**1.7. Contacts**

User's address book for easy sending.

*   `id`: String (UUID, Primary Key)

*   `name`: String (User-friendly name for the contact)

*   `address`: String (The contact's blockchain address)

*   `memo`: String (Optional notes about the contact)

*   `createdAt`: Timestamp

*   `updatedAt`: Timestamp



**1.8. MiniApps**

Details and configuration for installed and available mini-apps.

*   `id`: String (Unique identifier for the mini-app, e.g., "tokens-module", "contacts-module")

*   `title`: String (Display name, e.g., "Tokens Viewer")

*   `description`: String (Short description of the mini-app's functionality)

*   `iconUrl`: String (URL to the mini-app's icon)

*   `version`: String (Version string, e.g., "1.0.0")

*   `categories`: Array<String> (Tags for categorization, e.g., ["DeFi", "Tools"])

*   `supportedNetworks`: Array<Number> (Array of `Networks.chainId` where this mini-app is active/available)

*   `recommendedByCommunities`: Array<String> (IDs/Names of communities that recommend it)

*   `isInstalled`: Boolean (True if the user has installed this mini-app)

*   `isBuiltIn`: Boolean (True for modules that ship with the core Capsula app)

*   `installationOrder`: Number (Determines display order on the main screen)

*   `manifestData`: JSON (Stores mini-app-specific configuration, e.g., contract ABIs, UI component mappings, entry points for the SDK. This is crucial for the declarative mini-app system.)

*   `lastUpdated`: Timestamp (To track when the mini-app's data/manifest was last synchronized/checked for updates)



---

**2. Relationships**

*   **One-to-One (Implicit Singleton):** `UserSettings` is a single record.

*   **One-to-Many:**

    *   `Wallets` to `Tokens`: A wallet can hold many tokens across different networks. (`Tokens.walletId`)

    *   `Wallets` to `NFTs`: A wallet can own many NFTs. (`NFTs.ownerWalletId`)

    *   `Wallets` to `Transactions`: A wallet can have many transactions. (`Transactions.walletId`)

    *   `Networks` to `Tokens`: A network can host many tokens. (`Tokens.chainId`)

    *   `Networks` to `NFTs`: A network can host many NFT collections/tokens. (`NFTs.chainId`)

    *   `Networks` to `Transactions`: A network has many transactions. (`Transactions.chainId`)

*   **Many-to-Many (via arrays):**

    *   `UserSettings.followedCommunities` links to implicit community definitions.

    *   `MiniApps.supportedNetworks` links to `Networks.chainId`.

    *   `MiniApps.recommendedByCommunities` links to implicit community definitions.



---

**3. Local Storage Implementation Considerations**



*   **Secure Storage (Expo-Secure-Store):**

    *   `Wallets.keyRefId` will point to a key-value entry in `Expo-Secure-Store` that holds the *encrypted* private key, seed phrase, or a reference to a system-level Passkey credential.

    *   Any user-set PIN for transaction signing or app unlock will also be securely stored here.



*   **Persistent Storage (AsyncStorage / SQLite):**

    *   For the MVP, `AsyncStorage` can be used to store JSON representations of the collections above. Each collection could be stored as a single large JSON array, or individual items as key-value pairs (e.g., `wallets: [ { /* wallet data */ } ]` or `wallet:id1: { /* wallet data */ }`).

    *   For more robust querying capabilities (e.g., filtering transactions, searching mini-apps), `expo-sqlite` (SQLite database) or a local ORM like WatermelonDB could be considered for future iterations, but `AsyncStorage` is suitable for the initial tight timeline.



*   **State Management (Zustand):**

    *   The `Zustand` store will serve as the in-memory cache for frequently accessed data, derived from the persistent storage. This includes:

        *   The currently active wallet and its derived properties.

        *   The list of networks and their statuses.

        *   Balances and recent transactions for the active wallet/network.

        *   Currently active mini-app configurations and their UI state.

    *   `Zustand` will orchestrate loading data from persistent storage on app launch/resume and updating persistent storage when changes occur (e.g., adding a new wallet, installing a mini-app).



---

**4. Data Fetching and Caching Strategy**



*   **On-Demand & Background Sync:**

    *   Token balances, NFT metadata, and transaction histories will primarily be fetched from the blockchain via `Ethers.js` (or a GraphQL cache if implemented by a mini-app) when needed (e.g., when viewing the tokens screen, opening an NFT).

    *   These fetched data points (`Tokens.balance`, `NFTs` metadata, `Transactions` status) will be cached locally in their respective collections with a `lastFetchedAt` timestamp.

    *   A background process or a pull-to-refresh mechanism will trigger updates for relevant data based on user activity or time.

*   **Mini-App Data:**

    *   `MiniApps.manifestData` will be loaded on app startup.

    *   Any data fetched by a mini-app from external sources (smart contracts, APIs) should be encouraged to use the provided SDK's caching mechanisms, potentially utilizing the main `Zustand` store or local mini-app-specific storage. Mini-app developers should leverage GraphQL caches (e.g., The Graph) before direct blockchain calls for better performance.

*   **Network Data:**

    *   The `Networks` list will be pre-populated with default networks.

    *   Users can add new networks via `Chainlist.org` API integration. The added network data will be stored locally.

    *   `Networks.updatedAt` can be used to periodically re-verify RPC URLs or other details against `Chainlist.org` to ensure they are up-to-date.



---

**5. Security Considerations in Schema**



*   **No Direct Private Key Storage:** Private keys are never stored directly in plain text within any persistent data collection. Only `keyRefId`s are stored, pointing to encrypted data within `Expo-Secure-Store`.

*   **Passkey Integration:** The schema supports `isPasskeyBacked` wallets. When true, `keyRefId` might reference a system-level Passkey credential, or a securely wrapped seed phrase that Passkey unlocks.

*   **Transaction Authorization:** All critical actions (sending tokens, signing mini-app transactions) require re-authentication (Passkey or PIN), confirming user intent before accessing the secure key material.



This schema provides a robust and flexible foundation for Capsula's local-first architecture, supporting its core wallet features and the modular mini-app system.

## User Flow
USERFLOW

UF-001: Initial Wallet Setup via Passkey
Purpose: For a new user to create a secure wallet and gain access to Capsula using a Passkey.
Actors: User, System.
Preconditions: User has downloaded and launched Capsula for the first time.
Postconditions: A new wallet address is generated, secured by a Passkey, and the user is logged into the Capsula main screen.

Main Flow:
1.  Screen: Welcome/Onboarding Screen
    Description: Displays "Welcome to Capsula: The Greenpill BR Crypto Wallet" with a vibrant, minimalistic design. It features a large Capsula logo and introductory text.
    UI Elements: Large Capsula logo, brief welcome message, "Create Wallet" button.
2.  Action: User taps "Create Wallet."
3.  Screen: Choose Wallet Creation Method
    Description: The system prioritizes Passkey. It presents information about Passkey's simplicity and security for beginners. A secondary, less prominent option for "Advanced Setup (Seed Phrase)" is available for those who prefer it (see UF-001a).
    UI Elements: Text explaining Passkey benefits ("Simplified, single-click onboarding"), "Continue with Passkey" button, "Advanced Setup (Seed Phrase)" link/button (smaller).
4.  Action: User taps "Continue with Passkey."
5.  Screen: Passkey Authentication Prompt
    Description: The system initiates the native Passkey creation/authentication flow (e.g., Face ID, Touch ID, device PIN/password, or external security key depending on device capabilities).
    UI Elements: Native OS prompt for Passkey authentication.
6.  Action: User successfully authenticates via Passkey.
7.  Screen: Wallet Generation & Setup (Loading)
    Description: Capsula generates a new, secure wallet (private key) on the device and securely associates it with the Passkey. A "Creating your Capsula..." loading animation is displayed.
    UI Elements: Progress indicator, "Creating your Capsula..." text.
8.  Action: System completes wallet generation.
9.  Screen: Wallet Created Confirmation / Main Dashboard
    Description: A brief, ephemeral "Wallet Created Successfully!" message appears, then the app automatically transitions to the Main Dashboard, displaying initial balances (likely zero) and the default active network (Ethereum Mainnet).
    UI Elements: "Wallet Created Successfully!" toast/modal (briefly), then Main Dashboard UI (see Main Dashboard wireframe description).

Alternative Flow UF-001a: Fallback - Create Wallet with Seed Phrase (If Passkey is not desired/available at onboarding or explicitly chosen)
Description: This flow is triggered if the user explicitly selects "Advanced Setup (Seed Phrase)" on the "Choose Wallet Creation Method" screen or if Passkey setup fails/is unavailable (though Passkey is the default and recommended path).
1.  Screen: Seed Phrase Generation Screen
    Description: Displays a unique 12-word seed phrase. Strong warnings about the importance of writing it down securely offline and not sharing it are provided.
    UI Elements: 12-word list (numbered), "Copy to clipboard" button, "I have securely written it down and understand the risks" checkbox, "Continue" button (disabled until checkbox is checked).
2.  Action: User copies the seed phrase, checks the "I have securely written it down" checkbox, and taps "Continue."
3.  Screen: Seed Phrase Verification Screen
    Description: To ensure the user has correctly recorded the seed phrase, they are prompted to re-enter specific words (e.g., the 3rd, 7th, and 10th word) from the phrase.
    UI Elements: Input fields for specific words (e.g., "Word 3:", "Word 7:", "Word 10:"), "Verify" button.
4.  Action: User enters the requested words and taps "Verify."
5.  Screen: Set Transaction PIN/Password
    Description: Prompts the user to set a 6-digit PIN or a password. This will be used for transaction authorization if Passkey is not configured as the primary method or if the user prefers a PIN.
    UI Elements: Numeric keypad for PIN input, "Confirm PIN" input, "Set PIN" button.
6.  Action: User sets and confirms their PIN.
7.  Postconditions: A new wallet is created, secured by the seed phrase and PIN, and the user is logged into the Main Dashboard.



UF-002: Export 12-Word Seed Phrase
Purpose: For a user who initially onboarded with Passkey to export their seed phrase for backup purposes, understanding its importance.
Actors: User, System.
Preconditions: User has an existing wallet, is logged in, and navigates to the Profile/Settings page.
Postconditions: User has viewed and potentially copied their seed phrase, understanding its implications.

Main Flow:
1.  Screen: Main Dashboard
    Description: Displays wallet balance, active network, transaction history summary, and provides navigation to Profile/Settings.
    UI Elements: Bottom navigation bar or top-right profile icon.
2.  Action: User taps the Profile/Settings icon/button.
3.  Screen: Profile & Settings Page
    Description: Contains various settings categories including "Security & Backup," "Wallet Management," etc.
    UI Elements: List of options including "Security & Backup," "Export Seed Phrase" (or similar wording) within the security section.
4.  Action: User taps "Export Seed Phrase."
5.  Screen: Security Warning & Re-authentication Prompt
    Description: Displays a strong warning about the critical sensitivity of the seed phrase, emphasizing that it grants full control over funds. Re-authentication (via Passkey or PIN) is required before displaying the phrase.
    UI Elements: Prominent warning text (e.g., "WARNING: Anyone with your seed phrase can access your funds."), "I understand the risks" checkbox, "Authenticate to view seed phrase" button (disabled until checkbox is checked).
6.  Action: User checks the "I understand the risks" checkbox, taps "Authenticate to view seed phrase," and successfully authenticates via Passkey (or PIN if Passkey is not set up).
7.  Screen: Display Seed Phrase
    Description: Clearly displays the 12-word seed phrase. Provides educational text explaining *why* it's important to back it up offline and never share it digitally.
    UI Elements: 12-word list (numbered), "Copy to Clipboard" button, "Done" button.
8.  Action: User reviews the seed phrase, potentially copies it to a secure offline location, then taps "Done."
9.  Postconditions: User returns to the Profile & Settings page. The seed phrase has been displayed to the user.



UF-003: Unlock Capsula Wallet
Purpose: For a user to access their Capsula wallet after the app has been closed or idled.
Actors: User, System.
Preconditions: Capsula app is installed, a wallet has been created, and the app is launched from a "locked" state.
Postconditions: User is logged into the Main Dashboard.

Main Flow:
1.  Screen: Unlock Screen
    Description: A minimalistic screen prompting for authentication. It features the Capsula logo centrally.
    UI Elements: Capsula logo, "Unlock Capsula" text, prompt for Passkey authentication (e.g., "Scan your face to unlock").
2.  Action: System prompts for Passkey authentication (e.g., Face ID, Touch ID, PIN).
3.  Action: User authenticates via Passkey.
4.  Screen: Main Dashboard
    Description: Upon successful authentication, the user gains full access and is taken to the Main Dashboard.
    UI Elements: Main Dashboard UI.
5.  Postconditions: User has full access to the app's functionalities.

Alternative Flow UF-003a: Unlock with PIN/Password (if Passkey not setup or fails)
Description: This flow is triggered if Passkey authentication fails, is unavailable, or if the user initially set up their wallet with a PIN/password.
1.  Screen: Unlock Screen with PIN/Password Input
    UI Elements: Numeric keypad for PIN input or text input field for password, "Forgot PIN/Password?" option.
2.  Action: User enters their PIN/Password.
3.  Action: System validates the input.
4.  Postconditions: User accesses Main Dashboard if correct, or receives an error message for incorrect input.



UF-004: Switch Active Blockchain Network
Purpose: To change the blockchain network the wallet is currently interacting with.
Actors: User, System.
Preconditions: User is on the Main Dashboard.
Postconditions: The wallet displays data and interacts with the newly selected network.

Main Flow:
1.  Screen: Main Dashboard
    Description: The Main Dashboard prominently displays the name of the currently active network (e.g., "Ethereum Mainnet") in the header.
    UI Elements: Current network indicator (e.g., a dropdown or button in the top navigation bar, next to the wallet address).
2.  Action: User taps the current network indicator.
3.  Screen: Network Selection Modal/Screen
    Description: A modal or full-screen overlay appears, listing all supported networks (Ethereum Mainnet, CELO, Gnosis, and their testnets), along with any user-added networks. Recommended networks from followed communities (as per UF-011a) are highlighted.
    UI Elements: Scrollable list of networks, each with a radio button or selection indicator. "Add Custom Network" button, "Manage Networks" button.
4.  Action: User selects a new network from the list (e.g., "CELO").
5.  Screen: Main Dashboard (Loading state)
    Description: A responsive animated loading screen or indicator is displayed as the app fetches updated data (balances, transaction history, mini-app availability) for the newly selected network.
    UI Elements: Animated loading spinner, "Loading [Network Name] data..." text.
6.  Action: System updates all displayed data (balances, transactions, mini-app visibility) to reflect the chosen network.
7.  Screen: Main Dashboard
    Description: The Main Dashboard now displays the updated current network name (e.g., "CELO") and all associated information specific to that network.
    UI Elements: Updated network name in the header, updated token balances and transaction history.
8.  Postconditions: The wallet is now operating on the selected network.

Alternative Flow UF-004a: Add Custom Network (from Chainlist API)
Description: Allows users to add new EVM-compatible networks by searching the Chainlist API or entering details manually.
1.  Screen: Network Selection Modal/Screen
    UI Elements: "Add Custom Network" button.
2.  Action: User taps "Add Custom Network."
3.  Screen: Add Network Screen
    Description: This screen allows searching for networks via Chainlist.org API or manually inputting RPC details. Community-recommended networks will be pre-suggested here.
    UI Elements: Search bar (for Chainlist API), list of search results, fields for "Network Name," "Chain ID," "RPC URL" (for manual entry), "Add Network" button.
4.  Action: User searches for a network and selects it, or manually enters network details.
5.  Action: User confirms adding the network by tapping "Add Network."
6.  Postconditions: The new network is added to the user's list of available networks and can be selected as the active network.



UF-005: Manage Multiple Wallets & Switch Active Wallet
Purpose: To add new wallet addresses or switch between existing ones.
Actors: User, System.
Preconditions: User is on the Main Dashboard.
Postconditions: The user is interacting with the newly selected active wallet.

Main Flow:
1.  Screen: Main Dashboard
    Description: The active wallet's address is displayed in the header.
    UI Elements: Top-right profile icon, Wallet address in the header (potentially tappable to access wallet list directly).
2.  Action: User taps the Profile icon.
3.  Screen: Profile & Settings Page
    Description: This page contains a section dedicated to wallet management.
    UI Elements: "My Wallets" section with the current active wallet highlighted, "Add New Wallet" button, "Import Wallet" button.
4.  Action: User taps "My Wallets" or the active wallet entry to open the wallet list.
5.  Screen: Wallet List Management Screen
    Description: Lists all created or imported wallets. The current active wallet is clearly indicated. Provides options to create new, import, or set an existing wallet as active.
    UI Elements: Scrollable list of wallets (each showing address and possibly a user-defined name), "Set as Active" button for inactive wallets, "Create New Wallet" button, "Import Wallet (Seed Phrase/Private Key)" button.
6.  Action: User selects an existing (inactive) wallet and taps "Set as Active."
7.  Screen: Wallet List Management Screen
    Description: The newly selected wallet is now highlighted as active.
8.  Action: User taps "Create New Wallet."
9.  Screen: Create New Wallet Confirmation / Passkey Prompt
    Description: Asks for confirmation to create a new wallet and requires Passkey (or PIN) authorization.
    UI Elements: Confirmation modal ("Are you sure you want to create a new wallet?"), Passkey authentication prompt.
10. Action: System creates a new wallet address and adds it to the list.
11. Action: User taps "Import Wallet (Seed Phrase/Private Key)".
12. Screen: Import Wallet Screen
    Description: Allows the user to enter a 12-word seed phrase or a private key to import an existing wallet. Includes warnings about security.
    UI Elements: Text area for seed phrase/private key, "Import" button.
13. Action: User enters credentials and taps "Import".
14. Action: User navigates back to the Main Dashboard.
15. Screen: Main Dashboard
    Description: Displays the newly active wallet's address and associated balances.
    UI Elements: Updated wallet address and balances.
16. Postconditions: The selected wallet is now the active wallet, and its data is displayed across the app.



UF-006: Send Crypto Tokens
Purpose: To send cryptocurrency from the active wallet to another address on the currently selected network.
Actors: User, System.
Preconditions: User is on the Main Dashboard, has a token balance, and the correct network is selected.
Postconditions: A transaction is initiated and broadcast to the blockchain.

Main Flow:
1.  Screen: Main Dashboard
    Description: The primary screen after unlocking, showing token balances and key actions.
    UI Elements: Prominent "Send" button.
2.  Action: User taps "Send."
3.  Screen: Select Token to Send / Send Details (Step 1: Choose Token)
    Description: A list of tokens available in the active wallet on the current network. The native token (e.g., ETH for Ethereum, CELO for Celo) is usually at the top.
    UI Elements: Scrollable list of tokens, search bar for tokens.
4.  Action: User selects a token to send (e.g., "ETH").
5.  Screen: Send Details (Step 2: Enter Recipient & Amount)
    Description: Prompts the user for the recipient's address, the amount to send, and clearly indicates the currently selected network.
    UI Elements: "Recipient Address" input field (with a QR scanner icon and an address book icon), "Amount" input field, "Max" button (to send full balance), "Available Balance" display for the selected token, "Current Network" display, "Next" button.
6.  Action: User enters the recipient address (or uses QR scan/contacts - see UF-006a/b) and the desired amount.
7.  Screen: Transaction Review Screen
    Description: Summarizes all transaction details for user verification: sender address, recipient address, amount, selected token, active network, and estimated gas fees (fetched from Infura API). Warnings (e.g., insufficient balance, unusually high gas fees) are displayed prominently in red ink.
    UI Elements: Transaction summary (From, To, Amount, Network, Estimated Gas Fee), "Edit" button (to go back and change details), "Confirm & Send" button.
8.  Action: User reviews the details, then taps "Confirm & Send."
9.  Screen: Passkey Authentication for Transaction
    Description: The system prompts for Passkey authentication to authorize the transaction, ensuring secure signing of the transaction.
    UI Elements: Native OS Passkey prompt.
10. Action: User successfully authenticates via Passkey.
11. Screen: Transaction Initiated (Loading)
    Description: Displays a "Sending..." loading animation while the transaction is being broadcast to the network. A preliminary transaction hash might be shown if available immediately.
    UI Elements: Animated loading spinner, "Sending transaction..." text.
12. Action: System broadcasts the transaction to the network.
13. Screen: Transaction Status / Confirmation
    Description: Displays "Transaction Sent!" confirmation. A notification is also triggered (updating the bell icon on the main screen and sending a phone-level notification).
    UI Elements: Confirmation message, option to "View in Activity" (links to UF-009) or "View on Block Explorer" (external link), "Done" button.
14. Postconditions: The transaction is broadcast to the blockchain, the user's balance is updated (pending confirmation), and the transaction history (UF-009) is updated with the new pending transaction.

Alternative Flow UF-006a: Select Recipient from Contacts
Description: In the "Send Details" screen, the user can select a recipient from their saved contacts.
1.  Screen: Send Details (Step 2: Enter Recipient & Amount)
    UI Elements: Address book icon next to the "Recipient Address" input.
2.  Action: User taps the address book icon.
3.  Screen: Contacts List
    Description: Displays a list of saved contacts with their names and associated wallet addresses.
    UI Elements: List of contacts, search bar.
4.  Action: User selects a contact from the list.
5.  Postconditions: The "Recipient Address" input field on the "Send Details" screen is pre-filled with the selected contact's address.

Alternative Flow UF-006b: Scan QR Code for Recipient
Description: In the "Send Details" screen, the user can scan a QR code to automatically populate the recipient's address.
1.  Screen: Send Details (Step 2: Enter Recipient & Amount)
    UI Elements: QR scanner icon next to the "Recipient Address" input.
2.  Action: User taps the QR scanner icon.
3.  Screen: QR Code Scanner
    Description: Activates the device's camera with an overlay for scanning QR codes.
    UI Elements: Live camera view with QR scanning guide.
4.  Action: User positions a QR code (containing an address and potentially an amount) within the scanner's view.
5.  Postconditions: The "Recipient Address" field is pre-filled. If the QR code includes an amount, the "Amount" field is also pre-filled.



UF-007: Receive Crypto Tokens
Purpose: To display the user's wallet address and QR code for receiving funds.
Actors: User, System.
Preconditions: User is on the Main Dashboard.
Postconditions: User has successfully shared their wallet address.

Main Flow:
1.  Screen: Main Dashboard
    Description: The active wallet's address is always visible in the header.
    UI Elements: "Receive" button (prominently visible), and the wallet address itself with a "Copy" icon next to it.
2.  Action: User taps "Receive" or taps the "Copy" icon next to their address.
3.  Screen: Receive Funds Screen
    Description: Displays the user's active wallet address as a clear text string and a large QR code representation. It also allows the user to clarify which network/token they intend to receive on/with.
    UI Elements: Large QR code, wallet address (tappable to copy), "Share Address" button, "Change Network" button (links to UF-004), "Select Token" dropdown (to generate a specific QR for a token and network).
4.  Action: User copies the address to their clipboard, uses the "Share Address" function (via OS share sheet), or allows another person to scan the QR code.
5.  Postconditions: The user's wallet address is successfully shared, allowing another party to send funds.



UF-008: View Token Balances
Purpose: To see the current holdings of various tokens on the active network.
Actors: User, System.
Preconditions: User is on the Main Dashboard.
Postconditions: User has viewed their token balances.

Main Flow:
1.  Screen: Main Dashboard
    Description: The primary section of the Main Dashboard after the header is dedicated to displaying token balances. It shows a list or card view of each token held by the active wallet on the current network. The native token (for gas fees) is usually listed first.
    UI Elements: A scrollable list of tokens, each showing: token icon, token symbol (e.g., ETH, CELO), quantity, and estimated fiat value.
2.  Action: User views the listed balances.
3.  Alternative Flow UF-008a: Refresh Balances
    Description: To get the most up-to-date information, the user can initiate a refresh.
    1.  Action: User pulls down on the token list to refresh, or taps a refresh icon (if available in the UI).
    2.  Action: System fetches updated balances from the blockchain for all listed tokens on the active network.
    3.  Postconditions: The displayed balances are updated to reflect the latest on-chain data.
4.  Postconditions: User has an up-to-date view of their token holdings.



UF-009: View Transaction History
Purpose: To review past cryptocurrency transactions for the active wallet on the current network.
Actors: User, System.
Preconditions: User is on the Main Dashboard.
Postconditions: User has reviewed their transaction history.

Main Flow:
1.  Screen: Main Dashboard
    Description: Below the token balances and mini-app buttons, there is a "Recent Activity" section showing a snapshot of the latest transactions.
    UI Elements: "Recent Activity" section with a short list of latest transactions, "View All Activity" button.
2.  Action: User scrolls through the "Recent Activity" list or taps "View All Activity."
3.  Screen: Activity/Transaction History Screen
    Description: A comprehensive, scrollable list of all transactions for the active wallet on the current network, ordered from most recent. Each entry shows the transaction type (Send, Receive, Contract Interaction), token involved, amount, date, and current status (Pending, Confirmed, Failed).
    UI Elements: Scrollable list of transaction cards, filter options (by type, token, date range), search bar.
4.  Action: User taps on a specific transaction entry to see more details.
5.  Screen: Transaction Details Screen
    Description: Provides in-depth information about the selected transaction, including the full transaction hash, block number, gas used, exact timestamp, sender address, recipient address, and a direct link to a block explorer for on-chain verification.
    UI Elements: Detailed transaction fields, "Copy Transaction Hash" button, "View on Explorer" button.
6.  Action: User reviews the detailed information, then navigates back to the Activity/Transaction History screen or Main Dashboard.
7.  Postconditions: User has obtained detailed information about a specific transaction or reviewed their overall transaction history.



UF-010: Receive Transaction Notifications
Purpose: To alert the user about incoming/outgoing transactions and their status changes.
Actors: User, System.
Preconditions: User has enabled push notifications for Capsula at the operating system level.
Postconditions: User is informed about transaction events.

Main Flow:
1.  Screen: Any Screen / Background
    Description: The user is actively using Capsula, or the app is running in the background.
2.  Action: System detects a new transaction involving the user's active wallet on the blockchain (e.g., an incoming transfer) or a pending transaction changes status (e.g., confirmation).
3.  Action: System pushes a phone-level notification (e.g., "Capsula: Transaction confirmed! +0.5 ETH from 0xABC...").
4.  Screen: Main Dashboard
    Description: The bell icon in the top navigation bar updates, typically showing a red badge with a count of unread notifications.
    UI Elements: Bell icon with a notification badge.
5.  Action: User taps the bell icon.
6.  Screen: Notifications Center
    Description: Lists all recent notifications, with unread notifications clearly highlighted. Notifications include transaction confirmations, mini-app updates, or community alerts.
    UI Elements: Scrollable list of notifications.
7.  Action: User views notifications and can mark them as read or dismiss them.
8.  Postconditions: User is made aware of relevant transaction events through system-level and in-app notifications.



UF-011: Discover & Install Mini-Apps
Purpose: For users to find and add new functionalities (mini-apps) to their Capsula wallet.
Actors: User, System.
Preconditions: User is on the Main Dashboard.
Postconditions: A new mini-app button appears on the Main Dashboard (if network-compatible), and the mini-app is available for use.

Main Flow:
1.  Screen: Main Dashboard
    Description: The Main Dashboard includes a horizontal scrollable list of buttons for currently installed mini-apps.
    UI Elements: Scrollable list of mini-app buttons, with a "Mini-App Finder" button at the end of the list.
2.  Action: User taps the "Mini-App Finder" button.
3.  Screen: Mini-App Finder Screen
    Description: This is the central marketplace for mini-apps. It presents a curated list of available mini-apps, organized by categories. A prominent "Communities" banner suggests communities to follow, which can recommend networks and mini-apps.
    UI Elements: Search bar, Categories (e.g., "DeFi," "NFTs," "Tools," "Greenpill BR Community Apps"), Scrollable list of Mini-App cards (each showing icon, name, short description, and an "Install" button), "Communities" banner.
4.  Action: User browses the list, uses the search bar, or taps on a "Communities" banner.
5.  Alternative Flow UF-011a: Follow a Community
    Description: Users can follow communities to get tailored network and mini-app recommendations.
    1.  Action: User taps on a "Communities" banner from the Mini-App Finder.
    2.  Screen: Community Details Screen
        Description: Provides a description of the community, lists its recommended networks, and showcases mini-apps specifically curated or developed for that community.
        UI Elements: Community description, list of recommended networks, list of recommended mini-apps, "Follow Community" button.
    3.  Action: User taps "Follow Community."
    4.  Action: System automatically adds the community's recommended networks to the user's network list (if not already present) and highlights/suggests the community's recommended mini-apps in the Mini-App Finder.
    5.  Postconditions: The user receives community-specific recommendations, and relevant networks are added.
6.  Action: User taps on a specific mini-app card from the list in the Mini-App Finder.
7.  Screen: Mini-App Details Screen
    Description: Provides more in-depth information about the selected mini-app: detailed description, representative images/screenshots, version information, categories, the communities that recommend it, and its network compatibility.
    UI Elements: Mini-app icon and name, detailed description, screenshots, list of compatible networks, "Install" button (or "Uninstall" if already installed).
8.  Action: User taps "Install."
9.  Screen: Installation Confirmation / Loading
    Description: Displays a "Installing [Mini-App Name]..." loading animation as the mini-app's data is integrated into Capsula.
    UI Elements: Progress indicator, "Installing..." text.
10. Action: System successfully installs the mini-app package.
11. Screen: Mini-App Finder / Confirmation
    Description: Returns to the Mini-App Finder, with the newly installed app now marked as "Installed."
12. Action: User navigates back to the Main Dashboard.
13. Screen: Main Dashboard
    Description: A new button representing the installed mini-app is now visible in the scrollable list of mini-app buttons. Crucially, if the active network is *not* supported by the mini-app, its button will *not* be visible on the Main Dashboard until a compatible network is selected.
    UI Elements: New mini-app button (e.g., "Tokens Module") visible in the mini-app list.
14. Postconditions: The mini-app is installed, and its button is accessible from the Main Dashboard when on a compatible network.



UF-012: Launch an Installed Mini-App
Purpose: To access the functionality provided by an installed mini-app.
Actors: User, System.
Preconditions: A mini-app is installed, and the user is on a compatible network for that mini-app.
Postconditions: The user is interacting within the mini-app interface.

Main Flow:
1.  Screen: Main Dashboard
    Description: Displays buttons for all installed mini-apps that are compatible with the currently active network.
    UI Elements: Scrollable list of mini-app buttons.
2.  Action: User taps on a mini-app button (e.g., "Tokens Module").
3.  Screen: Mini-App Loading / Interface
    Description: A brief loading screen might appear, then the dedicated user interface for the selected mini-app is displayed. This interface is integrated seamlessly within Capsula's overall design, making it feel native.
    UI Elements: Mini-app specific UI components (e.g., for the "Tokens Module," an interface to add custom ERC-20 tokens). A clear "Back to Wallet" or "Close Mini-App" button is available in the header.
4.  Action: User interacts with the mini-app's functionalities (e.g., adds a custom token, views an NFT, adds a contact to the Contacts Module).
5.  Action: (If the mini-app requires blockchain interaction, like sending a token via the Tokens Module or interacting with a smart contract via the Example Module) The mini-app prepares a transaction.
6.  Screen: Passkey Authentication (for mini-app transaction)
    Description: The system initiates a Passkey authentication prompt. This prompt clearly displays the details of the transaction requested by the mini-app, allowing the user to review before authorizing. This is identical to a core wallet transaction authorization.
    UI Elements: Native OS Passkey prompt, summary of transaction details requested by the mini-app.
7.  Action: User successfully authenticates via Passkey.
8.  Action: System processes and broadcasts the mini-app's requested transaction to the blockchain.
9.  Action: User taps "Back to Wallet" or similar button within the mini-app's header to exit.
10. Screen: Main Dashboard
    Description: User returns to the main wallet interface. Any changes made through the mini-app (e.g., a newly added custom token) are reflected in the core wallet's state.
    UI Elements: Main Dashboard UI, potentially updated to reflect mini-app interactions (e.g., new token in balances list).
11. Postconditions: User has successfully used the mini-app, and any relevant data changes are reflected within the core wallet.



Wireframe Descriptions for Key Screens:

*   **Welcome Screen:**
    Layout: Centered.
    Elements: Large Capsula logo (top), a welcoming phrase like "Your gateway to autonomy and regeneration" (middle), a prominent "Create Wallet" button (bottom). Clean, uncluttered, vibrant.

*   **Main Dashboard:**
    Layout:
        Top Bar: Capsula logo (left-center), Bell icon (notifications, right-top, with optional red badge for unread notifications), Profile/Settings icon (far right-top). The active Network name (e.g., "Ethereum Mainnet") is prominently displayed below the logo and is tappable. The active Wallet address is below the network name, with a "Copy" icon.
        Middle Section (Main Content Area):
            Total Balance: Large display of total estimated value across all active tokens.
            Token Balances: A scrollable vertical list of core token balances. Each item shows token icon, symbol, quantity, and estimated fiat value.
        Below Balances (Action Buttons): Two prominent, often centrally aligned, large action buttons: "Send" and "Receive."
        Mini-App Carousel: A horizontal scrollable list of square or round buttons representing installed mini-apps. At the end of this list is a "Mini-App Finder" button to access the marketplace.
        Bottom Section: A "Recent Activity" list showing the latest 3-5 transactions, with a "View All Activity" link.

*   **Send Crypto Screen (Step 2: Enter Recipient & Amount):**
    Layout: Form-based.
    Header: "Send" title, Back button (top-left).
    Inputs: "Recipient Address" input field with a QR scan icon (right) and an address book icon (left). Below it, "Amount" input field with a "Max" button (right).
    Details: Display for "Current Token" (selected in Step 1), "Available Balance" of that token, and "Current Network."
    Footer: "Next" button (bottom-center).

*   **Transaction Review Screen:**
    Layout: Summary-based.
    Header: "Review Transaction" title, Back button.
    Summary Details: Clearly laid out information: "From" (your address), "To" (recipient's address), "Amount" (token and quantity), "Network," "Estimated Gas Fee" (with current price and total in native token/fiat). Warnings (e.g., "High Gas Fee!") are displayed in red text.
    Actions: "Edit" button (to go back and modify inputs), "Confirm & Send" button (prominent).

*   **Receive Funds Screen:**
    Layout: Centered, visual.
    Header: "Receive" title, Back button.
    Content: Large, centered QR code representing the active wallet's address. Below the QR code, the full wallet address is displayed as copyable text.
    Options: "Copy Address" button. "Share Address" button (activates OS share sheet). Options like "Change Network" or "Select Token" (to generate network/token-specific QR codes, if supported).

*   **Mini-App Finder Screen:**
    Layout: Marketplace-style.
    Header: "Mini-App Store" title, Back button.
    Search: A search bar at the top for finding specific mini-apps.
    Categories: A horizontal scrollable list of categories (e.g., "DeFi," "NFTs," "Tools," "Recommended").
    Communities Banner: A prominent, visually engaging banner at the top, inviting users to "Discover Communities & Their Recommended Apps."
    App List: A vertical scrollable grid or list of mini-app cards. Each card includes: Mini-app icon, Name, Short description, "Install" button (or "Installed" status).

*   **Mini-App Details Screen:**
    Layout: Informational, single-app focus.
    Header: Mini-app Name, Back button.
    Content: Large mini-app icon, Mini-app Name, detailed description of its functionality, screenshots/images illustrating its use, list of compatible networks, and any communities that recommend it.
    Actions: Prominent "Install" button (or "Uninstall" button if already installed).

## Styling Guidelines
STYLING GUIDELINES: CAPSULA

1. OVERVIEW & PHILOSOPHY
The Capsula styling guidelines aim to create a native-first mobile application that is intuitive, aesthetically pleasing, and incredibly easy to use. Our design philosophy is deeply rooted in the project's vision: minimalistic, vibrant, and beginner-friendly, providing a delightful user experience for the Greenpill BR community. We draw inspiration from the clean, accessible interfaces of Coinbase's Base wallet and Valora wallet, striving for a crypto experience that feels less daunting and more integrated with daily life and community tools. The visual language should reflect autonomy, regeneration, and the vibrant spirit of the GPBR movement.

2. DESIGN PRINCIPLES (UI/UX)
These principles guide all design decisions, from layout to micro-interactions, ensuring a cohesive and user-centric experience across the core wallet and all integrated mini-apps.

2.1. Simplicity & Intuition
The interface must be uncluttered, straightforward, and easy to navigate for users with moderate technical knowledge. Key actions like sending and receiving crypto, switching networks, and accessing mini-apps should be immediately understandable. The default use of Passkeys underscores this commitment to simplicity and ease of access.

2.2. Clarity & Readability
All text, data, and interactive elements must be clearly legible and understandable. We will prioritize high contrast ratios, appropriate font sizes, and well-organized information display to minimize cognitive load and ensure accessibility for all users, including those in varying lighting conditions or with visual impairments.

2.3. Consistency & Unity
A unified visual language is paramount, especially given the modular "mini-app" system. The core wallet establishes the foundational design system (colors, typography, components), which all mini-apps must adhere to. This ensures a seamless user experience, making mini-apps feel like integral extensions of Capsula, not disjointed external applications.

2.4. Vibrancy & Delight
While minimalistic, Capsula should not feel sterile. Strategic use of vibrant accent colors, thoughtful micro-interactions, and responsive animations will create an engaging and delightful user experience. Feedback for actions (e.g., transaction confirmations, successful copies) should be clear and visually pleasing.

2.5. Performance & Responsiveness
The UI must be highly responsive, with all load times ideally under one second. This requires efficient rendering, animated loading states (e.g., skeleton loaders), and a design that adapts gracefully to different screen sizes and orientations. Animations should feel fluid and purposeful, never hindering performance.

2.6. Greenpill Identity
The overall aesthetic should subtly evoke the "Greenpill BR" identity – regeneration, growth, community, and the natural world. This can be achieved through a carefully curated color palette, subtle natural textures, or organic shapes where appropriate, without compromising minimalism.

3. COLOR PALETTE
The Capsula color palette is designed to be fresh, vibrant, and reassuring, reflecting the Greenpill ethos while ensuring clarity and modern appeal.

3.1. Primary Colors
*   **GPBR Green (Main):** A vibrant, earthy green representing regeneration, growth, and the Greenpill identity. Used for primary calls to action, active states, and key branding elements.
    *   `#4CAF50` (e.g., for buttons, active tabs, success indicators)
*   **Capsula Dark Blue (Background/Base):** A deep, calming blue for primary backgrounds, adding depth and a sense of stability.
    *   `#1A237E` (e.g., for navigation bars, primary background)

3.2. Secondary & Accent Colors
*   **Capsula Light Green (Accent):** A brighter, more energetic green for highlights, progress indicators, or secondary interactive elements.
    *   `#8BC34A`
*   **Capsula Yellow (Highlight/Warning):** A warm, inviting yellow for occasional accents, warnings, or to draw attention to new features.
    *   `#FFEB3B`
*   **Capsula Teal (Accent/Information):** A fresh teal for specific informational elements or alternative accent colors, providing contrast.
    *   `#00BCD4`

3.3. Neutral Colors
*   **White:** For cards, content areas, and primary text on dark backgrounds. Provides excellent contrast.
    *   `#FFFFFF`
*   **Light Gray:** For subtle backgrounds, dividers, borders, and inactive states.
    *   `#EEEEEE`
*   **Medium Gray:** For secondary text, icons, and subtle interactive elements.
    *   `#9E9E9E`
*   **Dark Gray:** For primary text on light backgrounds, ensuring high readability.
    *   `#424242`

3.4. Semantic Colors
*   **Success:** `GPBR Green` (`#4CAF50`)
*   **Warning:** `Capsula Yellow` (`#FFEB3B`)
*   **Error:** A clear, non-aggressive red.
    *   `#F44336`

3.5. Accessibility Considerations
All color combinations will be checked against WCAG 2.1 AA standards for contrast ratios to ensure optimal readability for all users.

4. TYPOGRAPHY
A clean, modern, and highly legible sans-serif typeface will be used consistently throughout the application to maintain a professional and user-friendly appearance.

4.1. Font Family
*   **Primary Font:** `Inter` (or a suitable open-source alternative like `Roboto` if `Inter` causes licensing/bundling issues with Expo)
    *   `Inter` offers excellent readability across various sizes and weights, a modern feel, and good international character support.

4.2. Font Sizes & Hierarchy
A clear typographic scale will establish a consistent hierarchy for text elements. (All sizes in `pt` or `dp` for React Native).
*   **Heading 1 (Screen Titles):** `24pt` (`semibold`)
*   **Heading 2 (Section Titles):** `20pt` (`medium`)
*   **Heading 3 (Card Titles, Large Numbers):** `18pt` (`medium`)
*   **Body Text (Primary Information):** `16pt` (`regular`)
*   **Secondary Text (Labels, Descriptions):** `14pt` (`regular`)
*   **Caption/Small Text (Metadata, Legal):** `12pt` (`regular`)
*   **Button Text:** `16pt` (`medium`)

4.3. Font Weights
*   **Regular:** For most body text, ensuring readability.
*   **Medium:** For emphasis, button text, and sub-headings.
*   **SemiBold:** For primary headings, important figures, and strong emphasis.
*   **Bold:** Used sparingly for critical highlights.

4.4. Line Height & Letter Spacing
Optimized line height (e.g., `1.4` for body text) and minimal letter spacing will ensure comfortable reading on mobile screens.

5. ICONOGRAPHY
Icons will be consistent in style, clear in meaning, and contribute to the overall minimalistic aesthetic.

5.1. Style & Consistency
*   **Outline/Line Icons:** Preferred style for most UI elements, maintaining a light and modern feel.
*   **Filled Icons:** May be used for active states or specific emphasized actions (e.g., the bell icon for notifications when active).
*   **Stroke Width & Corner Radius:** Consistent across all icons.

5.2. Clarity & Purpose
Each icon should have an immediately recognizable meaning relevant to its function (e.g., an envelope for "receive," an arrow for "send," a gear for "settings," a grid for "mini-apps"). Text labels will accompany icons where meaning might be ambiguous.

6. UI COMPONENTS & DESIGN SYSTEM
Capsula will leverage a robust, reusable component library built on React Native, enforcing consistency and accelerating development. This system is crucial for enabling mini-apps to seamlessly integrate.

6.1. General Styling
*   **Rounded Corners:** A consistent `8-12pt` border-radius for buttons, cards, input fields, and other interactive elements to convey a friendly and modern feel.
*   **Subtle Shadows/Elevation:** Used sparingly to create hierarchy and distinguish interactive elements, particularly cards and buttons, without adding clutter.
*   **Clear Spacing & Layout:** Utilize a consistent spacing system (e.g., multiples of `4pt` or `8pt`) for margins, padding, and component separation to ensure visual harmony and breathability.

6.2. Common Components
*   **Buttons:**
    *   **Primary:** Solid `GPBR Green` background, white text.
    *   **Secondary:** Outlined with `GPBR Green`, `GPBR Green` text, transparent background.
    *   **Ghost/Text:** Transparent background, `Medium Gray` or `Capsula Teal` text.
    *   **States:** Default, pressed, disabled (reduced opacity or distinct background color).
*   **Input Fields:** Clear labels above or as placeholders. Consistent border, focus state (e.g., `GPBR Green` border), error state (e.g., `Error Red` border).
*   **Cards:** Used extensively for displaying balances, transactions, mini-app entries. White background, `8-12pt` border-radius, subtle shadow.
*   **Navigation Bar (Header):** Dark blue or white background, with screen title, address, bell icon, and potential back button.
*   **Tab Bar (Bottom Navigation):** For core wallet sections, with clear icons and labels. Active tab indicated by `GPBR Green` icon and text.
*   **Loaders & Spinners:** Animated, simple, and non-intrusive, matching the app's color palette. Skeleton loaders will be used for content areas to indicate loading without abrupt layout shifts.
*   **Modals & Bottom Sheets:** For focused tasks or additional information, providing a clear context shift.

6.3. Modular Integration (Mini-Apps)
The Capsula SDK for mini-app developers will include access to the core app's design system, including predefined UI components, color variables, and typography rules. Mini-apps should primarily compose their interfaces using these provided components to ensure a consistent look and feel. Custom components within mini-apps should still adhere to Capsula's general styling principles (colors, spacing, typography) to maintain unity.

7. IMAGERY & ILLUSTRATIONS
While the design is minimalistic, any imagery or illustrations (e.g., for onboarding, empty states, or community banners) should align with the Greenpill aesthetic. These will be simple, abstract, and focus on themes of nature, growth, connection, and digital autonomy, using the Capsula color palette.

8. TECHNICAL STYLING IMPLEMENTATION
*   **React Native StyleSheet API:** Core styling will utilize React Native's StyleSheet API for performance and maintainability.
*   **Theming Context:** A React Context-based theming solution will be implemented to provide consistent access to colors, typography, and spacing variables across the entire application and for mini-apps. This will facilitate potential future additions like light/dark mode.
*   **Reusable Components:** All common UI elements will be developed as highly reusable, atomic React Native components, with clear props for customization within the defined design system.
*   **Mini-App SDK:** The Mini-App SDK will expose styling utilities and components from the core app's design system, guiding developers to build UIs that naturally fit within Capsula. Developers will be encouraged to avoid custom styling that deviates significantly from the established guidelines.
