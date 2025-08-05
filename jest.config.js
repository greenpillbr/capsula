module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.expo/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|expo|@unimodules|unimodules|sentry-expo|native-base|react-clone-referenced-element|@react-native-community|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-vector-icons|@react-native-async-storage|react-native-svg|react-native-paper|react-native-elements|react-native-vector-icons|react-native-linear-gradient|react-native-animatable|react-native-super-grid|react-native-modal|react-native-device-info|react-native-keychain|react-native-biometrics|react-native-get-random-values|react-native-crypto|@ethersproject|ethers)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironment: 'node',
}
