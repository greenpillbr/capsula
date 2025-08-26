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
    
    // Seed Phrase Backup & Verification
    backupRecoveryPhrase: 'Backup Recovery Phrase',
    backupDescription: 'Your recovery phrase is the master key to your wallet. Write it down and store it safely.',
    securityNotice: 'Security Notice',
    securityWarnings: 'Never share • Store offline • Capsula cannot recover lost phrases',
    yourRecoveryPhrase: 'Your Recovery Phrase',
    writeDownWords: 'Write down these 12 words in order:',
    backupInstructions: 'How to backup safely:',
    instruction1: 'Write the words on paper in the exact order shown',
    instruction2: 'Store the paper in a secure, offline location',
    instruction3: 'Consider making multiple copies in different locations',
    instruction4: 'Never take screenshots or store digitally',
    confirmBackup: 'I have safely written down and stored my recovery phrase',
    continueToVerification: 'Continue to Verification',
    skipBackup: 'Skip Backup (Not Recommended)',
    
    // Seed Phrase Verification
    verifyRecoveryPhrase: 'Verify Recovery Phrase',
    verificationDescription: 'Select the correct word for each position to verify you\'ve saved your recovery phrase',
    verificationProgress: '{{current}} of {{total}}',
    whatIsWord: 'What is word #{{position}}?',
    positionInPhrase: 'Position in your recovery phrase:',
    selectCorrectWord: 'Select the correct word:',
    skipVerification: 'Skip Verification',
    verificationComplete: 'Verification Complete!',
    verificationSuccess: 'You\'ve successfully verified your recovery phrase. Your wallet backup is secure.',
    incorrectWord: 'Incorrect word. The correct word for position {{position}} is "{{word}}". Please try again.',
    skipVerificationWarning: 'Skipping verification means you haven\'t confirmed you can recover your wallet. This is risky and not recommended.',
    skipBackupWarning: 'Without backing up your recovery phrase, you will lose access to your wallet if:\n• You lose your device\n• Your device is damaged\n• You uninstall the app\n\nThis is HIGHLY RISKY and not recommended.',
    
    // Security
    biometricSetup: 'Setup Biometrics',
    biometricEnabled: 'Biometrics enabled',
    biometricDisabled: 'Biometrics disabled',
    unlockWithBiometric: 'Unlock with biometrics',
    unlockWithPasscode: 'Unlock with passcode',
    
    // Passkey Authentication
    passkeySetup: 'Setup Passkey',
    passkeyEnabled: 'Passkey enabled',
    passkeyDisabled: 'Passkey disabled',
    unlockWithPasskey: 'Unlock with Passkey',
    createWithPasskey: 'Create Wallet with Passkey',
    enterWithPasskey: 'Enter with Passkey',
    passkeyAuthentication: 'Passkey Authentication',
    passkeyNotSupported: 'Passkeys Not Supported',
    passkeyRegistrationFailed: 'Passkey Registration Failed',
    passkeyAuthenticationFailed: 'Passkey Authentication Failed',
    
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
      welcomeBack: 'Welcome back! Choose how you\'d like to access your wallet.',
    },
    
    // Simplified Onboarding
    simplified: {
      passkeyButton: 'Create Wallet with Passkey',
      passkeyButtonExisting: 'Enter with Passkey',
      passkeyDescription: 'Create a new wallet secured with Passkey authentication',
      passkeyDescriptionExisting: 'Use Passkey authentication to access your existing wallet',
      passkeyDescriptionBiometric: 'Passkeys not available, but biometric authentication is supported',
      passkeyDescriptionLimited: 'Limited security features available on this device',
      
      manualButton: 'Manual Setup',
      manualButtonExisting: 'Enter with Recovery Phrase',
      manualDescription: 'Create or restore wallet using recovery phrase',
      manualDescriptionExisting: 'Use your 12-word recovery phrase to restore your wallet',
      
      securityHigh: 'High Security',
      securityMedium: 'Medium Security',
      securityLow: 'Basic Security',
      
      capabilityPasskey: 'Your device supports Passkey authentication for enhanced security and convenience.',
      capabilityBiometric: 'Your device supports biometric authentication. Passkeys are not available, but you can use fingerprint or face recognition.',
      capabilityBasic: 'Your device supports secure storage. You can use transaction passwords for wallet protection.',
      capabilityLimited: 'Your device has limited security features. Manual seed phrase management is recommended.',
      
      securityNote: 'Your wallet data is encrypted and stored securely on your device. Capsula never has access to your private keys or recovery phrase.',
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
    
    passkey: {
      notSupported: 'Your device does not support Passkey authentication',
      registrationFailed: 'Failed to register Passkey',
      authenticationFailed: 'Failed to authenticate with Passkey',
      browserNotSupported: 'Your browser does not support WebAuthn/Passkeys or the feature is disabled',
      iosRequirement: 'Passkeys require iOS 16+ and compatible hardware',
      androidRequirement: 'Passkeys require Android 9+ with Google Play Services and compatible hardware',
      platformNotSupported: 'Passkeys are not supported on this platform',
      fallbackSuggestion: 'Use manual seed phrase entry or transaction password',
      biometricFallback: 'You can try using biometric authentication or transaction password as alternatives',
      manualFallback: 'Consider using manual seed phrase entry for better security',
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
