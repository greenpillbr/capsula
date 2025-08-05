import 'react-native-gesture-handler/jestSetup'

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})


// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    Wallet: {
      createRandom: jest.fn(),
      fromPhrase: jest.fn(),
    },
    JsonRpcProvider: jest.fn(),
    formatEther: jest.fn(),
    parseEther: jest.fn(),
  },
}))

// Mock Zustand
jest.mock('zustand', () => ({
  create: jest.fn(() => (set, get) => ({})),
}))

// Mock i18next and react-i18next
jest.mock('i18next', () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn().mockReturnThis(),
  t: jest.fn((key) => key),
  changeLanguage: jest.fn(),
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}))


// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
