# 🌱 Capsula - Beginner-Friendly Modular Crypto Wallet

A regenerative, community crypto wallet built for Greenpill BR with React Native and TypeScript.

## 🌟 Vision

Capsula makes crypto accessible through:
- **Effortless onboarding** with passkey/email signup
- **Educational approach** with plain language explanations
- **Modular design** allowing users to add features as they grow
- **Regenerative values** with earth-friendly design and community focus

## 🚀 Features

### Current (MVP)
- ✅ **Welcome Screen** with smooth onboarding flow
- ✅ **Multi-language Support** (Portuguese, English, Spanish)
- ✅ **Modular Architecture** ready for expansion
- ✅ **Local Storage** - completely standalone Android app
- ✅ **Accessibility** built-in from the start
- ✅ **Testing Setup** with comprehensive test coverage

### Planned Modules
- 🔄 **Token Management** - Add tokens by address + network
- 🖼️ **NFT Viewer** - Monitor selected collections
- 👥 **Contacts** - Save names + addresses, easy sending
- 🍪 **Cookie Jar** - Claim tokens with notifications
- 🗳️ **Community Voting** - Participate in governance
- 🌿 **Gardens** - Quick proposal voting
- 🛒 **Sarafu Marketplace** - Products + token swaps
- 📜 **Hypercerts** - Skills certificates

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **Expo** - Development and build tooling
- **Zustand** - Lightweight state management
- **i18next** - Internationalization
- **Gluestack UI** - Modern, accessible components
- **Jest + Testing Library** - Comprehensive testing
- **Ethers.js** - Ethereum interaction (planned)

## 🏗️ Architecture

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   └── onboarding/     # Welcome and setup screens
├── stores/             # Zustand state management
├── localization/       # i18n translations
├── constants/          # App configuration
├── types/              # TypeScript definitions
└── utils/              # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn package manager
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd capsula
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   yarn start
   ```

4. **Run on device/simulator**
   ```bash
   # Android
   yarn android
   
   # iOS
   yarn ios
   ```

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage
```

## 🌍 Internationalization

The app supports multiple languages:
- **Portuguese (pt-BR)** - Primary language for Brazilian users
- **English (en-US)** - International users
- **Spanish (es-ES)** - Latin American users

Add new translations in `src/localization/locales/`.

## 🎨 Design System

### Colors
- **Primary Green**: Earth-friendly regenerative theme
- **Bright Accents**: Welcoming, energetic highlights
- **Neutral Grays**: Clean, modern backgrounds

### Typography
- Clear hierarchy with accessible font sizes
- Consistent spacing and rhythm
- Support for multiple languages

### Components
- Built with Gluestack UI for consistency
- Accessible by default
- Smooth micro-interactions
- Responsive design

## 🔧 Development

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Consistent naming conventions
- Comprehensive type definitions

### State Management
- Zustand for lightweight, scalable state
- Local storage for persistence
- Modular store structure

### Testing Strategy
- Unit tests for components
- Integration tests for user flows
- Snapshot tests for UI consistency
- Accessibility testing included

## 📱 Platform Support

- **Android**: Primary target platform
- **iOS**: Future support planned
- **Web**: Potential future expansion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write tests for new features
- Follow TypeScript best practices
- Ensure accessibility compliance
- Add translations for new text
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌱 Greenpill BR

Built with love for the Greenpill Brazil community, promoting regenerative crypto adoption and education.

---

**Made with 🌱 by the Greenpill BR community**
