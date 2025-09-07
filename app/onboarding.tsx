import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { passkeyService } from '@/lib/auth/passkeyService';
import { keyManager } from '@/lib/crypto/keyManager';
import { Check } from '@/lib/icons/Check';
import { Shield } from '@/lib/icons/Shield';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNetworkStore } from '@/lib/stores/networkStore';
import { useWalletStore } from '@/lib/stores/walletStore';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [walletMnemonic, setWalletMnemonic] = useState<string>('');
  
  const { setOnboardingComplete, setAuthenticated } = useAuthStore();
  const { initializeDefaultNetworks } = useNetworkStore();
  const { wallets } = useWalletStore();

  // Check biometric support on mount
  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const isSupported = await passkeyService.isPasskeySupported();
      if (isSupported) {
        const types = await passkeyService.getAvailableBiometrics();
        const typeName = passkeyService.getBiometricTypeName(types);
        setBiometricType(typeName);
      }
    } catch (error) {
      console.error('Failed to check biometric support:', error);
    }
  };

  const handleEnterWithPasskey = async () => {
    setIsLoading(true);
    try {
      // Check if any wallets exist
      if (wallets.length > 0) {
        // User has existing wallets, authenticate and proceed to main app
        const authResult = await passkeyService.authenticateWithPasskey(
          'Authenticate to access your Capsula wallet'
        );
        
        if (authResult.success) {
          handleCompleteOnboarding();
        } else {
          Alert.alert('Authentication Failed', 'Please try again.');
        }
      } else {
        // No wallets exist, proceed to wallet creation
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Enter with Passkey error:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    setIsLoading(true);
    try {
      const result = await keyManager.createWallet('Capsula Wallet');
      
      if (result.success && result.data) {
        setWalletMnemonic(result.data.mnemonic);
        // Skip backup screen for now - go directly to main app
        handleCompleteOnboarding();
      } else {
        Alert.alert(
          'Wallet Creation Failed',
          result.error || 'Failed to create wallet. Please try again.'
        );
      }
    } catch (error) {
      console.error('Wallet creation error:', error);
      Alert.alert('Error', 'An unexpected error occurred while creating your wallet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportWallet = () => {
    router.push('/import-wallet');
  };

  const handleCopyMnemonic = async () => {
    try {
      await Clipboard.setStringAsync(walletMnemonic);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy recovery phrase');
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      // Initialize default networks
      initializeDefaultNetworks();
      
      // Mark onboarding as complete
      setOnboardingComplete(true);
      setAuthenticated(true);
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    }
  };

  const renderWelcomeStep = () => (
    <View className="flex-1 justify-center items-center p-6">
      {/* Logo */}
      <View className="mb-8">
        <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4">
          <View className="w-16 h-12 bg-background rounded-lg items-center justify-center">
            <View className="w-8 h-2 bg-primary rounded-full mb-1" />
            <View className="w-6 h-2 bg-primary rounded-full" />
          </View>
        </View>
      </View>

      {/* Title */}
      <Text className="text-3xl font-bold text-center text-foreground mb-2">
        Capsula
      </Text>
      <Text className="text-lg text-center text-foreground mb-4">
        Regenerative Wallet
      </Text>

      {/* Subtitle */}
      <Text className="text-center text-muted-foreground mb-8 px-4">
        Personal and community resources and apps easily available
      </Text>

      {/* Features */}
      <View className="mb-12 px-4">
        <Text className="text-center text-muted-foreground mb-4">
          Simplify your crypto journey. With Passkey, your wallet is secured by your device's biometrics.
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="w-full max-w-sm">
        <Button
          onPress={handleEnterWithPasskey}
          className="w-full mb-4 bg-primary"
          disabled={!biometricType}
        >
          <Text className="text-primary-foreground font-medium">
            {biometricType ? `Enter with ${biometricType}` : 'Create Wallet'}
          </Text>
        </Button>
        
        <Button 
          variant="outline" 
          onPress={handleImportWallet}
          className="w-full"
        >
          <Text className="text-primary font-medium">Recover Wallet</Text>
        </Button>
      </View>

      {/* Footer */}
      <View className="absolute bottom-8">
        <Text className="text-xs text-muted-foreground">
          Made with ❤️ for Greenpill BR
        </Text>
      </View>
    </View>
  );

  const renderPasskeySetupStep = () => (
    <View className="flex-1 p-6">
      <View className="flex-1 justify-center">
        {/* Header */}
        <View className="items-center mb-8">
          <Shield className="text-primary mb-4" size={64} />
          <Text className="text-2xl font-bold text-center text-foreground mb-2">
            Secure with {biometricType}
          </Text>
          <Text className="text-center text-muted-foreground px-4">
            Your wallet will be protected by your device's biometric authentication. 
            This is the most secure way to protect your assets.
          </Text>
        </View>

        {/* Security Features */}
        <Card className="p-4 mb-8">
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Check className="text-primary mr-3" size={20} />
              <Text className="flex-1 text-foreground">No passwords to remember</Text>
            </View>
            <View className="flex-row items-center">
              <Check className="text-primary mr-3" size={20} />
              <Text className="flex-1 text-foreground">Biometric protection</Text>
            </View>
            <View className="flex-row items-center">
              <Check className="text-primary mr-3" size={20} />
              <Text className="flex-1 text-foreground">Secure on-device storage</Text>
            </View>
            <View className="flex-row items-center">
              <Check className="text-primary mr-3" size={20} />
              <Text className="flex-1 text-foreground">Recovery phrase backup</Text>
            </View>
          </View>
        </Card>

        {/* Action Button */}
        <Button 
          onPress={handleCreateWallet}
          className="w-full bg-primary"
          disabled={isLoading}
        >
          <Text className="text-primary-foreground font-medium">
            {isLoading ? 'Creating Wallet...' : `Create Secure Wallet`}
          </Text>
        </Button>
      </View>

      {/* Back Button */}
      <Button 
        variant="ghost" 
        onPress={() => setCurrentStep(0)}
        className="mt-4"
      >
        <Text className="text-muted-foreground">Back</Text>
      </Button>
    </View>
  );

  const renderMnemonicStep = () => (
    <ScrollView className="flex-1 p-6">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-center text-foreground mb-2">
          Backup Your Wallet
        </Text>
        <Text className="text-center text-muted-foreground px-4">
          Write down these {walletMnemonic.split(' ').length} words in order and store them safely.
          This is your recovery phrase.
        </Text>
      </View>

      {/* Warning */}
      <Card className="p-4 mb-6 border-warning">
        <Text className="text-warning font-medium mb-2">⚠️ Important</Text>
        <Text className="text-muted-foreground text-sm">
          • Never share your recovery phrase with anyone
          • Store it offline in a secure location
          • Anyone with these words can access your wallet
          • Capsula cannot recover this for you if lost
        </Text>
      </Card>

      {/* Mnemonic Display */}
      <Card className="p-4 mb-6">
        <View className="flex-row flex-wrap">
          {walletMnemonic.split(' ').map((word, index) => (
            <View 
              key={index} 
              className="w-1/3 p-2"
            >
              <View className="bg-muted p-3 rounded-lg items-center">
                <Text className="text-xs text-muted-foreground mb-1">
                  {index + 1}
                </Text>
                <Text className="text-foreground font-medium">
                  {word}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Copy Button */}
      <Button
        variant="outline"
        onPress={handleCopyMnemonic}
        className="w-full mb-4"
      >
        <Text className="text-primary font-medium">Copy to Clipboard</Text>
      </Button>

      {/* Action Buttons */}
      <View className="space-y-3">
        <Button
          onPress={handleCompleteOnboarding}
          className="w-full bg-primary"
        >
          <Text className="text-primary-foreground font-medium">
            I've Safely Stored My Recovery Phrase
          </Text>
        </Button>
        
        <Button
          variant="outline"
          onPress={() => setCurrentStep(1)}
        >
          <Text className="text-primary font-medium">Back</Text>
        </Button>
      </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-background">
      {currentStep === 0 && renderWelcomeStep()}
      {currentStep === 1 && renderPasskeySetupStep()}
      {currentStep === 2 && renderMnemonicStep()}
    </View>
  );
}