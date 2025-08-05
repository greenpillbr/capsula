// E2E Test Setup
const { execSync } = require('child_process');

// Global setup for E2E tests
beforeAll(async () => {
  console.log('🌱 Setting up Capsula E2E Tests...');
  
  // Check if development server is running
  try {
    const response = await fetch('http://localhost:8081');
    if (!response.ok) {
      throw new Error('Development server not responding');
    }
    console.log('✅ Development server is running');
  } catch (error) {
    console.error('❌ Development server is not running!');
    console.error('Please start the development server with: yarn web');
    process.exit(1);
  }
});

// Global teardown
afterAll(async () => {
  console.log('🧹 Cleaning up E2E tests...');
});

// Increase timeout for E2E tests
jest.setTimeout(30000);

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
