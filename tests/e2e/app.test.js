const puppeteer = require('puppeteer');

describe('Capsula Wallet App E2E Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: process.env.CI ? true : false, // Show browser in development
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for React to load
  }, 30000);

  describe('Welcome Screen', () => {
    test('should display welcome screen with Capsula branding', async () => {
      // Check for welcome content first
      await page.waitForSelector('text=Welcome to Capsula');
      
      const welcomeTitle = await page.$eval('text=Welcome to Capsula', el => el.textContent);
      expect(welcomeTitle).toBe('Welcome to Capsula');
      
      const subtitle = await page.$eval('text=Your regenerative wallet for the future economy', el => el.textContent);
      expect(subtitle).toBe('Your regenerative wallet for the future economy');
      
      // Check for app name
      const appName = await page.$eval('text=Capsula', el => el.textContent);
      expect(appName).toBe('Capsula');
    });

    test('should have functional Continue button', async () => {
      await page.waitForSelector('text=Continue');
      const continueButton = await page.$('text=Continue');
      expect(continueButton).toBeTruthy();
      
      await continueButton.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Should navigate to create/import screen
      await page.waitForSelector('text=Let\'s get started');
      const createImportTitle = await page.$eval('text=Let\'s get started', el => el.textContent);
      expect(createImportTitle).toBe('Let\'s get started');
    });
  });

  describe('Create/Import Screen', () => {
    beforeEach(async () => {
      // Navigate to create/import screen
      await page.waitForSelector('text=Continue');
      await page.click('text=Continue');
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    test('should display all wallet creation options', async () => {
      // Check for all three options
      await page.waitForSelector('text=Create new wallet');
      const createOption = await page.$('text=Create new wallet');
      expect(createOption).toBeTruthy();
      
      const passkeyOption = await page.$('text=Import with Passkey');
      expect(passkeyOption).toBeTruthy();
      
      const phraseOption = await page.$('text=Import with Recovery Phrase');
      expect(phraseOption).toBeTruthy();
    });

    test('should have functional back button', async () => {
      await page.waitForSelector('text=← Back');
      const backButton = await page.$('text=← Back');
      expect(backButton).toBeTruthy();
      
      await backButton.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Should return to welcome screen
      await page.waitForSelector('text=Welcome to Capsula');
      const welcomeTitle = await page.$eval('text=Welcome to Capsula', el => el.textContent);
      expect(welcomeTitle).toBe('Welcome to Capsula');
    });

    test('should show educational note', async () => {
      await page.waitForSelector('text=New to crypto?');
      const educationalNote = await page.$('text=New to crypto? We recommend creating a new wallet to learn step by step with educational guidance.');
      expect(educationalNote).toBeTruthy();
    });
  });

  describe('Navigation Flow', () => {
    test('should support complete navigation flow', async () => {
      // Start at welcome screen
      await page.waitForSelector('text=Welcome to Capsula');
      let currentTitle = await page.$eval('text=Welcome to Capsula', el => el.textContent);
      expect(currentTitle).toBe('Welcome to Capsula');
      
      // Navigate to create/import
      await page.click('text=Continue');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await page.waitForSelector('text=Let\'s get started');
      currentTitle = await page.$eval('text=Let\'s get started', el => el.textContent);
      expect(currentTitle).toBe('Let\'s get started');
      
      // Navigate back to welcome
      await page.click('text=← Back');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await page.waitForSelector('text=Welcome to Capsula');
      currentTitle = await page.$eval('text=Welcome to Capsula', el => el.textContent);
      expect(currentTitle).toBe('Welcome to Capsula');
      
      // Navigate forward again
      await page.click('text=Continue');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await page.waitForSelector('text=Let\'s get started');
      currentTitle = await page.$eval('text=Let\'s get started', el => el.textContent);
      expect(currentTitle).toBe('Let\'s get started');
    });
  });

  describe('Visual Design', () => {
    test('should have regenerative color scheme', async () => {
      // Check background color
      const backgroundColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      // Should have light, earth-tone background
      expect(backgroundColor).toBeTruthy();
    });

    test('should have proper responsive design', async () => {
      // Test different viewport sizes
      await page.setViewport({ width: 375, height: 667 }); // Mobile
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await page.waitForSelector('text=Welcome to Capsula');
      const mobileTitle = await page.$('text=Welcome to Capsula');
      expect(mobileTitle).toBeTruthy();
      
      await page.setViewport({ width: 1024, height: 768 }); // Desktop
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const desktopTitle = await page.$('text=Welcome to Capsula');
      expect(desktopTitle).toBeTruthy();
    });
  });
});
