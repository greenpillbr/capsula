import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/localization/i18n';
import { SimplifiedOnboardingScreen } from './src/screens/onboarding/SimplifiedOnboardingScreen';
import { WalletInfo } from './src/services/WalletService';
import './src/utils/crypto-polyfill';

type AppStep = 'onboarding' | 'walletReady';

export default function App() {
  const [currentStep, setCurrentStep] = React.useState<AppStep>('onboarding');
  const [walletInfo, setWalletInfo] = React.useState<WalletInfo | null>(null);

  const handleWalletReady = (newWalletInfo: WalletInfo) => {
    setWalletInfo(newWalletInfo);
    setCurrentStep('walletReady');
  };

  const handleBackToOnboarding = () => {
    setCurrentStep('onboarding');
    setWalletInfo(null);
  };

  const renderContent = () => {
    if (currentStep === 'onboarding') {
      return (
        <>
          <StatusBar style="dark" />
          <SimplifiedOnboardingScreen onWalletReady={handleWalletReady} />
        </>
      );
    }

    if (currentStep === 'walletReady') {
      return (
        <>
          <StatusBar style="dark" />
          <View style={styles.container}>
            {/* Success content */}
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successTitle}>Wallet Ready!</Text>
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

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => Alert.alert('🚧 Coming Soon', 'The main wallet interface will be implemented in the next phase!')}
              >
                <Text style={styles.buttonText}>Enter Wallet</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={handleBackToOnboarding}
              >
                <Text style={styles.secondaryButtonText}>Back to Setup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
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
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#2D5A27',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D5A27',
  },
  secondaryButtonText: {
    color: '#2D5A27',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
