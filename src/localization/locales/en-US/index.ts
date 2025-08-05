const enUS = {
  // Common terms
  common: {
    welcome: 'Welcome to Capsula',
    continue: 'Continue',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    skip: 'Skip',
    retry: 'Retry',
    close: 'Close',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
  },

  // Wallet-specific terms
  wallet: {
    balance: 'Balance',
    send: 'Send',
    receive: 'Receive',
    history: 'History',
    transaction: 'Transaction',
    transactions: 'Transactions',
    address: 'Address',
    amount: 'Amount',
    fee: 'Fee',
    total: 'Total',
    
    // Wallet creation/import
    createWallet: 'Create Wallet',
    importWallet: 'Import Wallet',
    seedPhrase: 'Recovery Phrase',
    seedPhraseExplanation: 'Your recovery phrase is like the master key to your wallet. Keep it safe and never share it!',
    confirmSeedPhrase: 'Confirm Recovery Phrase',
    enterSeedPhrase: 'Enter your recovery phrase',
    invalidSeedPhrase: 'Invalid recovery phrase',
    
    // Security
    biometricSetup: 'Setup Biometrics',
    biometricEnabled: 'Biometrics enabled',
    biometricDisabled: 'Biometrics disabled',
    unlockWithBiometric: 'Unlock with biometrics',
    unlockWithPasscode: 'Unlock with passcode',
    
    // Transactions
    transactionSent: 'Transaction sent successfully',
    transactionFailed: 'Transaction failed',
    insufficientFunds: 'Insufficient funds',
    invalidAddress: 'Invalid address',
    confirmTransaction: 'Confirm transaction',
    transactionDetails: 'Transaction details',
    
    // Networks
    network: 'Network',
    switchNetwork: 'Switch network',
    networkUnsupported: 'Network not supported',
  },

  // Mini-apps
  modules: {
    availableModules: 'Available Modules',
    installedModules: 'Installed Modules',
    installModule: 'Install Module',
    uninstallModule: 'Uninstall Module',
    moduleStore: 'Module Store',
    featuredModules: 'Featured Modules',
    recentlyUsed: 'Recently used',
    
    categories: {
      defi: 'DeFi',
      nft: 'NFTs',
      social: 'Social',
      utility: 'Utilities',
      game: 'Games',
    },
    
    collections: {
      followedCollections: 'Followed Collections',
      featuredCollections: 'Featured Collections',
      communityCollections: 'Community Collections',
      officialCollections: 'Official Collections',
    },
    
    permissions: {
      wallet: 'Wallet access',
      storage: 'Local storage',
      network: 'Network access',
      camera: 'Camera access',
      location: 'Location access',
    },
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: 'Welcome to Capsula',
      subtitle: 'Your regenerative wallet for the future economy',
      description: 'Manage your digital assets and participate in regenerative communities simply and securely.',
    },
    
    createOrImport: {
      title: 'Let\'s get started',
      subtitle: 'Create a new wallet or import an existing one',
      createNew: 'Create new wallet',
      createNewDescription: 'Generate a new wallet with a secure recovery phrase',
      importPasskey: 'Import with Passkey',
      importPasskeyDescription: 'Use your biometric authentication to restore your wallet',
      importSeedPhrase: 'Import with Recovery Phrase',
      importSeedPhraseDescription: 'Restore your wallet using your 12-word recovery phrase',
      educationalNote: 'New to crypto? We recommend creating a new wallet to learn step by step with educational guidance.',
      importExisting: 'Import existing wallet',
    },
    
    security: {
      title: 'Secure your wallet',
      subtitle: 'Set up your wallet security',
      biometricTitle: 'Enable biometrics',
      biometricDescription: 'Use your fingerprint or face recognition to quickly access your wallet',
      backupTitle: 'Backup',
      backupDescription: 'Save your recovery phrase in a safe place',
    },
    
    complete: {
      title: 'All set!',
      subtitle: 'Your Capsula wallet has been successfully configured',
      description: 'Now you can start exploring the world of regenerative finance.',
      startExploring: 'Start exploring',
    },
  },

  // Settings
  settings: {
    title: 'Settings',
    general: 'General',
    security: 'Security',
    about: 'About',
    
    language: 'Language',
    currency: 'Currency',
    theme: 'Theme',
    notifications: 'Notifications',
    
    backup: 'Backup',
    changePasscode: 'Change passcode',
    biometric: 'Biometrics',
    autoLock: 'Auto lock',
    
    version: 'Version',
    support: 'Support',
    privacy: 'Privacy',
    terms: 'Terms of use',
  },

  // Errors
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Connection error. Check your internet.',
    invalidInput: 'Invalid input',
    unauthorized: 'Unauthorized',
    notFound: 'Not found',
    timeout: 'Timeout',
    
    wallet: {
      creation: 'Error creating wallet',
      import: 'Error importing wallet',
      unlock: 'Error unlocking wallet',
      transaction: 'Transaction error',
    },
    
    miniApp: {
      install: 'Error installing module',
      uninstall: 'Error uninstalling module',
      load: 'Error loading module',
      permission: 'Permission denied',
    },
  },

  // Navigation
  navigation: {
    home: 'Home',
    modules: 'Modules',
    settings: 'Settings',
    wallet: 'Wallet',
    discover: 'Discover',
  },

  // Time formats
  time: {
    now: 'now',
    minutesAgo: '{{count}} min ago',
    hoursAgo: '{{count}}h ago',
    daysAgo: '{{count}}d ago',
    weeksAgo: '{{count}}w ago',
  },
}

export default enUS
