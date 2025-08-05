import React, { useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { WalletInfo, walletService } from '../../services/WalletService';

interface CreateWalletScreenProps {
  onWalletCreated: (walletInfo: WalletInfo) => void;
  onBack: () => void;
}

export const CreateWalletScreen: React.FC<CreateWalletScreenProps> = ({
  onWalletCreated,
  onBack,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [step, setStep] = useState<'generate' | 'backup' | 'confirm' | 'store'>('generate');
  const [fadeAnim] = useState(new Animated.Value(1));

  const generateWallet = async () => {
    try {
      setIsCreating(true);
      console.log('Starting wallet generation...');
      
      // Generate new wallet
      const newWallet = walletService.generateWallet();
      console.log('Wallet generated successfully:', newWallet.address);
      setWalletInfo(newWallet);
      setStep('backup');
      
      // Animate transition
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
      
    } catch (error) {
      console.error('Error generating wallet:', error);
      Alert.alert(
        'Error',
        'Failed to generate wallet. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackupConfirmed = () => {
    setStep('store');
    
    // Animate transition
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const storeWalletWithPasskey = async () => {
    if (!walletInfo) return;
    
    try {
      setIsCreating(true);
      
      // Check if biometric authentication is available
      const isBiometricAvailable = await walletService.isBiometricAvailable();
      
      if (!isBiometricAvailable) {
        Alert.alert(
          'Biometric Authentication Required',
          'This device does not support biometric authentication (fingerprint, Face ID, etc.) or it is not set up. Please set up biometric authentication in your device settings to securely store your wallet.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Continue Anyway', 
              onPress: () => {
                // For now, just complete the process
                onWalletCreated(walletInfo);
              }
            }
          ]
        );
        return;
      }

      // Store wallet with passkey
      await walletService.storeWalletWithPasskey(walletInfo);
      
      Alert.alert(
        '🎉 Wallet Created Successfully!',
        'Your wallet has been securely stored with biometric authentication. You can now use your fingerprint or Face ID to access it.',
        [
          {
            text: 'Continue',
            onPress: () => onWalletCreated(walletInfo),
          }
        ]
      );
      
    } catch (error) {
      console.error('Error storing wallet:', error);
      
      let errorMessage = 'Failed to store wallet securely.';
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed')) {
          errorMessage = 'Authentication was cancelled or failed. Your wallet was not stored.';
        } else if (error.message.includes('not available')) {
          errorMessage = 'Biometric authentication is not available on this device.';
        }
      }
      
      Alert.alert(
        'Storage Error',
        errorMessage,
        [
          { text: 'Try Again', onPress: storeWalletWithPasskey },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsCreating(false);
    }
  };

  const renderGenerateStep = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <Text style={styles.title}>🌱 Create New Wallet</Text>
      <Text style={styles.subtitle}>
        Generate a secure crypto wallet with a unique recovery phrase
      </Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>What you'll get:</Text>
        <Text style={styles.infoItem}>• A unique 12-word recovery phrase</Text>
        <Text style={styles.infoItem}>• Secure biometric protection</Text>
        <Text style={styles.infoItem}>• Full control of your funds</Text>
        <Text style={styles.infoItem}>• Compatible with all Ethereum networks</Text>
      </View>

      <View style={styles.warningContainer}>
        <Text style={styles.warningTitle}>🔒 Security Note</Text>
        <Text style={styles.warningText}>
          Your recovery phrase is the master key to your wallet. Keep it safe and never share it with anyone.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={onBack}
        >
          <Text style={styles.secondaryButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.primaryButton,
            isCreating && styles.disabledButton
          ]} 
          onPress={generateWallet}
          disabled={isCreating}
        >
          <Text style={styles.primaryButtonText}>
            {isCreating ? 'Generating...' : 'Generate Wallet'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderBackupStep = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <Text style={styles.title}>📝 Backup Your Recovery Phrase</Text>
      <Text style={styles.subtitle}>
        Write down these 12 words in order and store them safely
      </Text>

      <View style={styles.mnemonicContainer}>
        {walletInfo?.mnemonic.split(' ').map((word, index) => (
          <View key={index} style={styles.mnemonicWord}>
            <Text style={styles.mnemonicIndex}>{index + 1}</Text>
            <Text style={styles.mnemonicText}>{word}</Text>
          </View>
        ))}
      </View>

      <View style={styles.warningContainer}>
        <Text style={styles.warningTitle}>⚠️ Important</Text>
        <Text style={styles.warningText}>
          • Write these words on paper (not digitally)
        </Text>
        <Text style={styles.warningText}>
          • Store in a safe, secure location
        </Text>
        <Text style={styles.warningText}>
          • Never share with anyone
        </Text>
        <Text style={styles.warningText}>
          • You'll need these to recover your wallet
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => setStep('generate')}
        >
          <Text style={styles.secondaryButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={handleBackupConfirmed}
        >
          <Text style={styles.primaryButtonText}>I've Saved It Safely</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderStoreStep = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <Text style={styles.title}>🔐 Secure Your Wallet</Text>
      <Text style={styles.subtitle}>
        Store your wallet securely with biometric authentication
      </Text>

      <View style={styles.walletInfoContainer}>
        <Text style={styles.walletInfoTitle}>Your New Wallet</Text>
        <Text style={styles.walletAddress}>{walletInfo?.address}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Biometric Protection:</Text>
        <Text style={styles.infoItem}>• Use fingerprint or Face ID to access</Text>
        <Text style={styles.infoItem}>• Wallet data encrypted on device</Text>
        <Text style={styles.infoItem}>• No data stored on external servers</Text>
        <Text style={styles.infoItem}>• Complete privacy and control</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => setStep('backup')}
        >
          <Text style={styles.secondaryButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.primaryButton,
            isCreating && styles.disabledButton
          ]} 
          onPress={storeWalletWithPasskey}
          disabled={isCreating}
        >
          <Text style={styles.primaryButtonText}>
            {isCreating ? 'Securing...' : 'Secure with Biometrics'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'generate':
        return renderGenerateStep();
      case 'backup':
        return renderBackupStep();
      case 'store':
        return renderStoreStep();
      default:
        return renderGenerateStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderCurrentStep()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  infoContainer: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
    lineHeight: 20,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
    width: '100%',
    maxWidth: 400,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
    marginBottom: 3,
  },
  mnemonicContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  mnemonicWord: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    margin: 4,
    padding: 8,
    borderRadius: 6,
    minWidth: 80,
  },
  mnemonicIndex: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 6,
    fontWeight: '500',
  },
  mnemonicText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  walletInfoContainer: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  walletInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  walletAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'monospace',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.6,
  },
});
