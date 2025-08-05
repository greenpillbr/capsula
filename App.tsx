import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/localization/i18n';
import { CreateOrImportScreen } from './src/screens/onboarding/CreateOrImportScreen';
import { CreateWalletScreen } from './src/screens/onboarding/CreateWalletScreen';
import { WalletInfo } from './src/services/WalletService';
import './src/utils/crypto-polyfill';

type AppStep = 'welcome' | 'createOrImport' | 'createWallet' | 'importPasskey' | 'importPhrase' | 'walletCreated';

export default function App() {
  const [currentStep, setCurrentStep] = React.useState<AppStep>('welcome');
  const [isLoading, setIsLoading] = React.useState(false);
  const [walletInfo, setWalletInfo] = React.useState<WalletInfo | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleGetStarted = () => {
    animateTransition(() => setCurrentStep('createOrImport'));
  };

  const handleBack = () => {
    animateTransition(() => setCurrentStep('welcome'));
  };

  const handleBackToCreateOrImport = () => {
    animateTransition(() => setCurrentStep('createOrImport'));
  };

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(callback, 150);
  };

  const handleCreateNew = () => {
    animateTransition(() => setCurrentStep('createWallet'));
  };

  const handleImportPasskey = () => {
    setIsLoading(true);
    Alert.alert(
      '🔐 Import with Passkey',
      'This feature uses your device\'s biometric authentication to securely restore your wallet. Your passkey is stored locally on your device.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setIsLoading(false) },
        { 
          text: 'Continue', 
          onPress: () => {
            setIsLoading(false);
            animateTransition(() => setCurrentStep('importPasskey'));
          }
        }
      ]
    );
  };

  const handleImportSeedPhrase = () => {
    setIsLoading(true);
    Alert.alert(
      '📝 Import Recovery Phrase',
      'Enter your 12-word recovery phrase to restore your existing wallet. Make sure you\'re in a private location.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setIsLoading(false) },
        { 
          text: 'Continue', 
          onPress: () => {
            setIsLoading(false);
            animateTransition(() => setCurrentStep('importPhrase'));
          }
        }
      ]
    );
  };

  const handleWalletCreated = (newWalletInfo: WalletInfo) => {
    setWalletInfo(newWalletInfo);
    animateTransition(() => setCurrentStep('walletCreated'));
  };

  const renderContent = () => {
    if (currentStep === 'welcome') {
      return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <StatusBar style="dark" />
          
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🌱</Text>
            <Text style={styles.appName}>Capsula</Text>
          </View>

          {/* Welcome content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome to Capsula</Text>
            <Text style={styles.subtitle}>Your regenerative wallet for the future economy</Text>
            <Text style={styles.description}>
              Manage your digital assets and participate in regenerative communities simply and securely.
            </Text>
          </View>

          {/* Action button */}
          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (currentStep === 'createOrImport') {
      return (
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
          <StatusBar style="dark" />
          <CreateOrImportScreen
            onCreateNew={handleCreateNew}
            onImportPasskey={handleImportPasskey}
            onImportSeedPhrase={handleImportSeedPhrase}
            onBack={handleBack}
          />
        </Animated.View>
      );
    }

    if (currentStep === 'createWallet') {
      return (
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
          <StatusBar style="dark" />
          <CreateWalletScreen
            onWalletCreated={handleWalletCreated}
            onBack={handleBackToCreateOrImport}
          />
        </Animated.View>
      );
    }

    if (currentStep === 'walletCreated') {
      return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <StatusBar style="dark" />
          
          {/* Success content */}
          <View style={styles.successContainer}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Wallet Created Successfully!</Text>
            <Text style={styles.successSubtitle}>
              Your Capsula wallet is ready to use
            </Text>
            
            <View style={styles.walletInfoCard}>
              <Text style={styles.walletInfoTitle}>Your Wallet Address</Text>
              <Text style={styles.walletAddress}>{walletInfo?.address}</Text>
            </View>

            <View style={styles.nextStepsContainer}>
              <Text style={styles.nextStepsTitle}>What's Next?</Text>
              <View style={styles.nextStepItem}>
                <Text style={styles.nextStepEmoji}>💰</Text>
                <Text style={styles.nextStepText}>Add tokens and start managing your assets</Text>
              </View>
              <View style={styles.nextStepItem}>
                <Text style={styles.nextStepEmoji}>🎨</Text>
                <Text style={styles.nextStepText}>Explore NFT collections</Text>
              </View>
              <View style={styles.nextStepItem}>
                <Text style={styles.nextStepEmoji}>👥</Text>
                <Text style={styles.nextStepText}>Connect with regenerative communities</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => Alert.alert('🚧 Coming Soon', 'The main wallet interface will be implemented in the next phase!')}>
            <Text style={styles.buttonText}>Enter Wallet</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (currentStep === 'importPasskey') {
      return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <StatusBar style="dark" />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToCreateOrImport}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}>🔐 Import with Passkey</Text>
              <Text style={styles.subtitle}>Use biometric authentication to restore your wallet</Text>
            </View>
          </View>

          <View style={styles.featureContainer}>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>👆</Text>
              <Text style={styles.featureText}>Fingerprint or Face ID authentication</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🔒</Text>
              <Text style={styles.featureText}>Secure local storage</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>⚡</Text>
              <Text style={styles.featureText}>Quick and convenient access</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => Alert.alert('🚧 Coming Soon', 'Passkey import will be implemented in the next phase!')}>
            <Text style={styles.buttonText}>Authenticate</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (currentStep === 'importPhrase') {
      return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <StatusBar style="dark" />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToCreateOrImport}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}>📝 Import Recovery Phrase</Text>
              <Text style={styles.subtitle}>Enter your 12-word recovery phrase</Text>
            </View>
          </View>

          <View style={styles.featureContainer}>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🔤</Text>
              <Text style={styles.featureText}>Enter each word in the correct order</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🔍</Text>
              <Text style={styles.featureText}>We'll validate each word as you type</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🛡️</Text>
              <Text style={styles.featureText}>Your phrase never leaves this device</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => Alert.alert('🚧 Coming Soon', 'Recovery phrase import will be implemented in the next phase!')}>
            <Text style={styles.buttonText}>Import Wallet</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return null;
  };

  return (
    <SafeAreaProvider>
      {renderContent()}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  logoText: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5A27',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#2D5A27',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 12,
    minWidth: 200,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    marginBottom: 64,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2D5A27',
    fontWeight: '500',
  },
  titleContainer: {
    alignItems: 'center',
  },
  featureContainer: {
    gap: 24,
    marginBottom: 64,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8F5E8',
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 22,
  },
  successContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5A27',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 32,
  },
  walletInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8F5E8',
  },
  walletInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  walletAddress: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    fontFamily: 'monospace',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  nextStepsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  nextStepEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  nextStepText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
});
