# Capsula Wallet Tests

This directory contains comprehensive tests for the Capsula wallet application.

## Test Structure

```
tests/
├── e2e/                    # End-to-end browser tests
│   ├── app.test.js        # Main application flow tests
│   └── setup.js           # E2E test setup and configuration
└── README.md              # This file
```

## Running Tests

### Prerequisites

1. **Development Server**: Make sure the development server is running:
   ```bash
   yarn web
   ```
   The app should be accessible at `http://localhost:8081`

2. **Dependencies**: All test dependencies are already installed with the project.

### Available Test Commands

#### Unit Tests (React Native Components)
```bash
# Run all unit tests
yarn test

# Run tests in watch mode (re-runs on file changes)
yarn test:watch

# Run tests with coverage report
yarn test:coverage
```

#### End-to-End Tests (Browser Automation)
```bash
# Run E2E tests (requires development server)
yarn test:e2e

# Run E2E tests in watch mode
yarn test:e2e:watch

# Run E2E tests with coverage
yarn test:e2e:coverage
```

#### All Tests
```bash
# Run both unit and E2E tests
yarn test:all
```

## E2E Test Features

The E2E tests use **Puppeteer** to automate a real browser and test the complete user experience:

### Test Coverage

- **Welcome Screen**: Logo, branding, and navigation
- **Wallet Creation Options**: All three wallet setup paths
- **Navigation Flow**: Forward and backward navigation
- **Interactive Elements**: Buttons, alerts, and user feedback
- **Visual Design**: Responsive layout and color scheme
- **Educational Content**: Tooltips and guidance messages

### Test Scenarios

1. **Welcome Screen Tests**
   - Displays Capsula branding and logo
   - Shows welcome content and description
   - Continue button navigates to options

2. **Create/Import Screen Tests**
   - Shows all three wallet creation options
   - Back button returns to welcome screen
   - Educational note is displayed

3. **Wallet Creation Flows**
   - Create new wallet confirmation and screen
   - Import with passkey information and flow
   - Import recovery phrase guidance and screen

4. **Navigation Tests**
   - Complete forward/backward navigation
   - Smooth transitions between screens
   - Proper state management

5. **Visual Design Tests**
   - Regenerative color scheme validation
   - Responsive design across screen sizes
   - Proper layout and styling

### Browser Configuration

The tests are configured to:
- **Development**: Show browser window for debugging
- **CI/Production**: Run headlessly for automated testing
- **Cross-platform**: Works on Linux, macOS, and Windows
- **Chrome**: Uses system Chrome or Chromium installation

## Test Development

### Adding New E2E Tests

1. Create test files in `tests/e2e/` directory
2. Follow the existing pattern in `app.test.js`
3. Use descriptive test names and organize with `describe` blocks
4. Include proper setup and teardown

### Best Practices

- **Wait for Elements**: Always wait for elements to load before interacting
- **Descriptive Names**: Use clear, descriptive test and describe block names
- **Isolated Tests**: Each test should be independent and not rely on others
- **Error Handling**: Include proper error handling and cleanup
- **Screenshots**: Take screenshots for debugging failed tests

### Example Test Structure

```javascript
describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup for each test
    await page.goto('http://localhost:8081');
    await page.waitForTimeout(2000);
  });

  test('should do something specific', async () => {
    // Test implementation
    const element = await page.$('text=Button Text');
    expect(element).toBeTruthy();
    
    await element.click();
    await page.waitForTimeout(500);
    
    // Assertions
    const result = await page.$eval('text=Expected Result', el => el.textContent);
    expect(result).toBe('Expected Result');
  });
});
```

## Troubleshooting

### Common Issues

1. **Development Server Not Running**
   ```
   Error: Development server is not running!
   Solution: Start with `yarn web` and wait for it to be ready
   ```

2. **Chrome/Chromium Not Found**
   ```
   Error: Could not find browser
   Solution: Install Chrome or set PUPPETEER_EXECUTABLE_PATH
   ```

3. **Tests Timing Out**
   ```
   Error: Test timeout
   Solution: Increase timeout or check for slow network/loading
   ```

4. **Element Not Found**
   ```
   Error: Element not found
   Solution: Check selectors and wait for elements to load
   ```

### Debug Mode

To debug tests with visible browser:
```bash
# Set environment variable to show browser
HEADLESS=false yarn test:e2e
```

### CI/CD Integration

For continuous integration:
```bash
# Run in headless mode with coverage
CI=true yarn test:all
```

## Contributing

When adding new features to the app:

1. **Add Unit Tests**: Test individual components and functions
2. **Add E2E Tests**: Test complete user workflows
3. **Update Documentation**: Keep this README current
4. **Run All Tests**: Ensure nothing breaks before committing

The test suite helps ensure the Capsula wallet remains reliable, user-friendly, and true to its regenerative values! 🌱
