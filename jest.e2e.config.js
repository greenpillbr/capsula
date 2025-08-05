module.exports = {
  displayName: 'E2E Tests',
  testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageDirectory: 'coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
}
