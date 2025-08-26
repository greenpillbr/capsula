import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, LAYOUT } from '../../constants';
import { DeviceCapabilities, deviceCapabilityService } from '../../services/DeviceCapabilityService';
import { passkeyService } from '../../services/PasskeyService';
import { WalletInfo, walletService } from '../../services/WalletService';
import { SeedPhraseBackupScreen } from './SeedPhraseBackupScreen';

interface SimplifiedOnboardingScreenProps {
  onWalletReady: (walletInfo: WalletInfo) => void;
}

export const SimplifiedOnboardingScreen: React.FC<SimplifiedOnboardingScreenProps> = ({
  onWalletReady,
}) => {
  const { t } = useTranslation();
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingWallet, setHasExistingWallet] = useState(false);
  const [capabilitySummary, setCapabilitySummary] = useState<string>('');
  const [currentFlow, setCurrentFlow] = useState<'onboarding' | 'seedBackup'>('onboarding');
  const [pendingWalletInfo, setPendingWalletInfo] = useState<WalletInfo | null>(null);

  useEffect(() => {
    checkCapabilities();
  }, []);

  const checkCapabilities = async () => {
    try {
      // Get comprehensive device capabilities
      const capabilities = await deviceCapabilityService.getDeviceCapabilities();
      setDeviceCapabilities(capabilities);

      // Get user-friendly summary
      const summary = await deviceCapabilityService.getCapabilitySummary();
      setCapabilitySummary(summary);

      // Check if there's an existing wallet
      const hasWallet = await walletService.hasStoredWallet();
      setHasExistingWallet(hasWallet);

      // Check minimum security requirements
      const meetsRequirements = await deviceCapabilityService.meetsMinimumSecurityRequirements();
      if (!meetsRequirements) {
        Alert.alert(
          'Security Warning',
          'Your device has limited security features. Please ensure you backup your recovery phrase securely.',
          [{ text: 'I Understand' }]
        );
      }
    } catch (error) {
      console.error('Error checking capabilities:', error);
      // Set fallback capabilities
      setDeviceCapabilities({
        supportsPasskeys: false,
        supportsBiometrics: false,
        supportsSecureStorage: true,
        platformType: 'unknown',
        recommendedAuthMethod: 'manual',
        fallbackOptions: ['Manual seed phrase entry', 'Recovery phrase backup'],
      });
    }
  };

  const handlePasskeyFlow = async () => {
    if (!deviceCapabilities?.supportsPasskeys) {
      const capabilityCheck = await deviceCapabilityService.checkCapability('supportsPasskeys');
      Alert.alert(
        'Passkeys Not Supported',
        `${capabilityCheck.reason}\n\n${capabilityCheck.fallbackSuggestion}`,
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    
    try {
      if (hasExistingWallet) {
        // Try to authenticate with existing Passkey
        await authenticateWithPasskey();
      } else {
        // Create new wallet with Passkey
        await createWalletWithPasskey();
      }
    } catch (error) {
      console.error('Passkey flow error:', error);
      
      // Provide more detailed error handling based on device capabilities
      const securityLevel = await deviceCapabilityService.getSecurityLevel();
      const fallbackMessage = securityLevel === 'low'
        ? 'Consider using manual seed phrase entry for better security.'
        : 'You can try using biometric authentication or transaction password as alternatives.';
      
      Alert.alert(
        'Passkey Error',
        `${error instanceof Error ? error.message : 'Failed to process Passkey authentication'}\n\n${fallbackMessage}`,
        [
          { text: 'Try Manual Setup', onPress: handleManualSeedFlow },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithPasskey = async () => {
    try {
      // Authenticate with existing Passkey
      const credential = await passkeyService.authenticateWithPasskey();
      
      // Derive encryption key from Passkey
      const encryptionKey = await passkeyService.deriveKeyFromPasskey(credential);
      
      // Retrieve wallet using Passkey-derived key
      const walletInfo = await walletService.retrieveWalletWithPasskey();
      
      if (walletInfo) {
        onWalletReady(walletInfo);
      } else {
        throw new Error('Failed to retrieve wallet data');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Failed to authenticate with Passkey. Please try manual seed entry.');
    }
  };

  const createWalletWithPasskey = async () => {
    try {
      // Generate new wallet
      const walletInfo = walletService.generateWallet();
      
      // Store the wallet info and show backup screen
      setPendingWalletInfo(walletInfo);
      setCurrentFlow('seedBackup');
    } catch (error) {
      console.error('Wallet creation error:', error);
      throw new Error('Failed to create new wallet');
    }
  };

  const handleSeedBackupComplete = async (verified: boolean) => {
    if (!pendingWalletInfo) {
      console.error('No pending wallet info');
      return;
    }

    try {
      if (deviceCapabilities?.supportsPasskeys) {
        // Register Passkey for the new wallet
        const credential = await passkeyService.registerPasskey(
          pendingWalletInfo.address,
          'Capsula Wallet'
        );
      }
      
      // Store wallet with Passkey authentication (or fallback storage)
      const success = await walletService.storeWalletWithPasskey(pendingWalletInfo);
      
      if (success) {
        onWalletReady(pendingWalletInfo);
      } else {
        throw new Error('Failed to store wallet securely');
      }
    } catch (error) {
      console.error('Wallet finalization error:', error);
      
      if (Platform.OS === 'web') {
        window.alert('Failed to finalize wallet setup. Please try again.');
      } else {
        Alert.alert(
          'Setup Failed',
          'Failed to finalize wallet setup. Please try again.',
          [{ text: 'OK' }]
        );
      }
      
      // Reset to onboarding flow
      setCurrentFlow('onboarding');
      setPendingWalletInfo(null);
    }
  };

  const handleSeedBackupCancel = () => {
    setCurrentFlow('onboarding');
    setPendingWalletInfo(null);
  };

  const handleManualSeedFlow = async () => {
    setIsLoading(true);
    
    try {
      const securityLevel = await deviceCapabilityService.getSecurityLevel();
      const securityWarning = securityLevel === 'low'
        ? '\n\n⚠️ Your device has limited security features. Please ensure you store your recovery phrase in a very secure location.'
        : '';
      
      if (Platform.OS === 'web') {
        // Use browser-native alert for web
        const message = `📝 Manual Seed Entry\n\n${hasExistingWallet
          ? 'Enter your 12-word recovery phrase to restore your wallet.'
          : 'You can either create a new wallet or restore an existing one using your recovery phrase.'
        }${securityWarning}`;
        
        const proceed = window.confirm(message + '\n\nClick OK to continue or Cancel to go back.');
        
        if (proceed) {
          window.alert('🚧 Coming Soon\n\nManual seed entry will be implemented in the next phase!');
        }
        setIsLoading(false);
      } else {
        // Use React Native Alert for mobile
        Alert.alert(
          '📝 Manual Seed Entry',
          `${hasExistingWallet
            ? 'Enter your 12-word recovery phrase to restore your wallet.'
            : 'You can either create a new wallet or restore an existing one using your recovery phrase.'
          }${securityWarning}`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setIsLoading(false) },
            {
              text: hasExistingWallet ? 'Enter Recovery Phrase' : 'Create New Wallet',
              onPress: () => {
                setIsLoading(false);
                // This will be implemented in the next task
                Alert.alert('🚧 Coming Soon', 'Manual seed entry will be implemented in the next phase!');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error in manual seed flow:', error);
      setIsLoading(false);
    }
  };

  const getPasskeyButtonText = () => {
    if (isLoading) return 'Loading...';
    if (!deviceCapabilities?.supportsPasskeys) {
      return deviceCapabilities?.supportsBiometrics ? 'Biometrics Available' : 'Limited Security';
    }
    if (hasExistingWallet) return 'Enter with Passkey';
    return 'Create Wallet with Passkey';
  };

  const getPasskeyButtonDescription = () => {
    if (!deviceCapabilities) return 'Checking device capabilities...';
    
    if (!deviceCapabilities.supportsPasskeys) {
      if (deviceCapabilities.supportsBiometrics) {
        return 'Passkeys not available, but biometric authentication is supported';
      }
      return 'Limited security features available on this device';
    }
    
    if (hasExistingWallet) return 'Use Passkey authentication to access your existing wallet';
    return 'Create a new wallet secured with Passkey authentication';
  };

  const getSecurityIndicator = () => {
    if (!deviceCapabilities) return null;
    
    const securityLevel = deviceCapabilities.supportsPasskeys ? 'high' :
                         deviceCapabilities.supportsBiometrics ? 'medium' : 'low';
    
    const colors = {
      high: '#4CAF50',
      medium: '#FF9800',
      low: '#F44336'
    };
    
    const labels = {
      high: '🔒 High Security',
      medium: '🔐 Medium Security',
      low: '⚠️ Basic Security'
    };
    
    return (
      <View style={[styles.securityIndicator, { backgroundColor: colors[securityLevel] + '20' }]}>
        <Text style={[styles.securityIndicatorText, { color: colors[securityLevel] }]}>
          {labels[securityLevel]}
        </Text>
      </View>
    );
  };

  // Show seed backup screen if in that flow
  if (currentFlow === 'seedBackup' && pendingWalletInfo) {
    return (
      <SeedPhraseBackupScreen
        seedPhrase={pendingWalletInfo.mnemonic}
        onBackupComplete={handleSeedBackupComplete}
        onCancel={handleSeedBackupCancel}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🌱</Text>
          <Text style={styles.appName}>Capsula</Text>
        </View>

        {/* Welcome content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('onboarding.welcome.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.welcome.subtitle')}</Text>
          <Text style={styles.description}>
            {hasExistingWallet 
              ? 'Welcome back! Choose how you\'d like to access your wallet.'
              : t('onboarding.welcome.description')
            }
          </Text>
        </View>

        {/* Security indicator */}
        {getSecurityIndicator()}

        {/* Capability summary */}
        {capabilitySummary && (
          <View style={styles.capabilitySummary}>
            <Text style={styles.capabilitySummaryText}>{capabilitySummary}</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          {/* Primary Passkey Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !deviceCapabilities?.supportsPasskeys && styles.disabledButton
            ]}
            onPress={handlePasskeyFlow}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>🔐</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={[
                  styles.primaryButtonText,
                  !deviceCapabilities?.supportsPasskeys && styles.disabledButtonText
                ]}>
                  {getPasskeyButtonText()}
                </Text>
                <Text style={[
                  styles.buttonDescription,
                  !deviceCapabilities?.supportsPasskeys && styles.disabledButtonText
                ]}>
                  {getPasskeyButtonDescription()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Secondary Manual Seed Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleManualSeedFlow}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>📝</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.secondaryButtonText}>
                  {hasExistingWallet ? 'Enter with Recovery Phrase' : 'Manual Setup'}
                </Text>
                <Text style={styles.buttonDescription}>
                  {hasExistingWallet 
                    ? 'Use your 12-word recovery phrase to restore your wallet'
                    : 'Create or restore wallet using recovery phrase'
                  }
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Security note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityNoteIcon}>🛡️</Text>
          <Text style={styles.securityNoteText}>
            Your wallet data is encrypted and stored securely on your device. 
            Capsula never has access to your private keys or recovery phrase.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT.padding.lg,
    paddingTop: LAYOUT.padding.xl,
    paddingBottom: LAYOUT.padding.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: LAYOUT.padding.xl * 2,
  },
  logoText: {
    fontSize: 80,
    marginBottom: LAYOUT.padding.md,
  },
  appName: {
    fontSize: LAYOUT.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: LAYOUT.padding.xl * 2,
  },
  title: {
    fontSize: LAYOUT.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: LAYOUT.padding.md,
  },
  subtitle: {
    fontSize: LAYOUT.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.padding.lg,
  },
  description: {
    fontSize: LAYOUT.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: LAYOUT.padding.lg,
    marginBottom: LAYOUT.padding.xl,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: LAYOUT.padding.lg,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: LAYOUT.padding.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledButton: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: LAYOUT.padding.md,
  },
  buttonTextContainer: {
    flex: 1,
  },
  primaryButtonText: {
    fontSize: LAYOUT.fontSize.lg,
    fontWeight: '600',
    color: Colors.surface,
    marginBottom: LAYOUT.padding.xs,
  },
  secondaryButtonText: {
    fontSize: LAYOUT.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: LAYOUT.padding.xs,
  },
  disabledButtonText: {
    color: Colors.surface,
    opacity: 0.8,
  },
  buttonDescription: {
    fontSize: LAYOUT.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  securityNote: {
    backgroundColor: Colors.primaryLight,
    borderRadius: LAYOUT.borderRadius.md,
    padding: LAYOUT.padding.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 'auto',
  },
  securityNoteIcon: {
    fontSize: 20,
    marginRight: LAYOUT.padding.sm,
    marginTop: 2,
  },
  securityNoteText: {
    flex: 1,
    fontSize: LAYOUT.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  securityIndicator: {
    borderRadius: LAYOUT.borderRadius.md,
    padding: LAYOUT.padding.sm,
    marginBottom: LAYOUT.padding.md,
    alignItems: 'center',
  },
  securityIndicatorText: {
    fontSize: LAYOUT.fontSize.sm,
    fontWeight: '600',
  },
  capabilitySummary: {
    backgroundColor: Colors.surface,
    borderRadius: LAYOUT.borderRadius.md,
    padding: LAYOUT.padding.md,
    marginBottom: LAYOUT.padding.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  capabilitySummaryText: {
    fontSize: LAYOUT.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
    textAlign: 'center',
  },
});