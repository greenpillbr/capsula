import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { passkeyService } from '@/lib/auth/passkeyService';
import { pinService } from '@/lib/auth/pinService';
import { keyManager } from '@/lib/crypto/keyManager';
import { ChevronLeft } from '@/lib/icons/ChevronLeft';
import { Shield } from '@/lib/icons/Shield';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

export default function ImportWalletScreen() {
  const router = useRouter();
  const [walletName, setWalletName] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [isPasskeySupported, setIsPasskeySupported] = useState(true);
  
  const { passkeyEnabled, setPinEnabled } = useAuthStore();

  // Check if Passkey is supported on mount
  useEffect(() => {
    checkPasskeySupport();
  }, []);

  const checkPasskeySupport = async () => {
    try {
      const supported = await passkeyService.isPasskeySupported();
      setIsPasskeySupported(supported);
      
      // If Passkey is not supported, show PIN setup immediately
      if (!supported) {
        setShowPinSetup(true);
      }
    } catch (error) {
      console.error('Failed to check Passkey support:', error);
      setIsPasskeySupported(false);
      setShowPinSetup(true);
    }
  };

  const validateInputs = (): string | null => {
    if (!walletName.trim()) {
      return 'Please enter a wallet name';
    }

    if (!seedPhrase.trim()) {
      return 'Please enter your recovery phrase';
    }
    
    // Clean and normalize the mnemonic for validation
    const cleanMnemonic = seedPhrase.trim().toLowerCase().replace(/\s+/g, ' ');
    const words = cleanMnemonic.split(' ');
    
    if (words.length !== 12 && words.length !== 24) {
      return 'Recovery phrase must be 12 or 24 words';
    }
    
    // Check if all words are non-empty
    if (words.some(word => !word || word.length === 0)) {
      return 'Please ensure all words are valid and separated by spaces';
    }

    // Validate PIN if Passkey is not supported
    if (!isPasskeySupported || showPinSetup) {
      if (!pin) {
        return 'Please enter a PIN for transaction authorization';
      }
      
      if (pin.length < 4) {
        return 'PIN must be at least 4 digits';
      }
      
      if (pin !== confirmPin) {
        return 'PINs do not match';
      }
    }

    return null;
  };

  const handleImportWallet = async () => {
    const validationError = validateInputs();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsLoading(true);
    
    try {
      // Clean and normalize the mnemonic
      const cleanMnemonic = seedPhrase.trim().toLowerCase().replace(/\s+/g, ' ');
      
      // Prepare import data with seed phrase only
      const importData = { mnemonic: cleanMnemonic };

      // Import wallet
      const result = await keyManager.importWallet(importData, walletName.trim());
      
      if (result.success) {
        // If PIN was set and Passkey is not supported, store PIN securely
        if (!isPasskeySupported && pin) {
          const pinResult = await pinService.storePin(pin);
          if (pinResult.success) {
            setPinEnabled(true);
          } else {
            console.error('Failed to store PIN:', pinResult.error);
            Alert.alert('Warning', 'Wallet imported but PIN setup failed. You may need to set up PIN later.');
          }
        }
        
        // Navigate back to profile or main app
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      } else {
        Alert.alert('Import Failed', result.error || 'Failed to import wallet');
      }
    } catch (error) {
      console.error('Failed to import wallet:', error);
      Alert.alert('Error', 'An unexpected error occurred while importing your wallet');
    } finally {
      setIsLoading(false);
    }
  };


  const renderSecurityWarning = () => (
    <Card className="p-4 mb-6 border-warning">
      <View className="flex-row items-start">
        <Text className="text-warning mr-2">⚠️</Text>
        <View className="flex-1">
          <Text className="text-warning font-medium mb-2">Security Warning</Text>
          <Text className="text-muted-foreground text-sm leading-5">
            • Only import wallets you trust and own{'\n'}
            • Never share your recovery phrase with anyone{'\n'}
            • Make sure you're in a private, secure location{'\n'}
            • Capsula will securely encrypt and store your keys
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderWalletNameInput = () => (
    <View className="mb-6">
      <Text className="text-sm font-medium text-foreground mb-2">Wallet Name</Text>
      <Input
        value={walletName}
        onChangeText={setWalletName}
        placeholder="Enter a name for this wallet"
        className="w-full"
        autoCapitalize="words"
      />
      <Text className="text-xs text-muted-foreground mt-1">
        Give your wallet a memorable name
      </Text>
    </View>
  );

  const renderSeedPhraseInput = () => (
    <View className="mb-6">
      <Text className="text-sm font-medium text-foreground mb-2">Recovery Phrase</Text>
      <Textarea
        value={seedPhrase}
        onChangeText={setSeedPhrase}
        placeholder="Enter your 12 or 24 word recovery phrase separated by spaces"
        className="w-full h-32"
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        textAlignVertical="top"
      />
      <Text className="text-xs text-muted-foreground mt-1">
        Typically 12 or 24 words separated by spaces
      </Text>
    </View>
  );


  const renderPinSetup = () => {
    if (!showPinSetup) return null;

    return (
      <View className="mb-6">
        <Text className="text-lg font-semibold text-foreground mb-2">Transaction Authorization</Text>
        <Text className="text-sm text-muted-foreground mb-4">
          Since Passkey is not available, set up a PIN to authorize transactions
        </Text>
        
        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Create PIN</Text>
            <Input
              value={pin}
              onChangeText={setPin}
              placeholder="Enter 4-8 digit PIN"
              secureTextEntry
              keyboardType="numeric"
              maxLength={8}
              className="w-full"
            />
          </View>
          
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Confirm PIN</Text>
            <Input
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder="Re-enter your PIN"
              secureTextEntry
              keyboardType="numeric"
              maxLength={8}
              className="w-full"
            />
          </View>
        </View>
      </View>
    );
  };

  const renderPasskeyInfo = () => {
    if (!isPasskeySupported) return null;

    return (
      <Card className="p-4 mb-6">
        <View className="flex-row items-start">
          <Shield className="text-primary mr-3 mt-1" size={20} />
          <View className="flex-1">
            <Text className="text-foreground font-medium mb-1">Passkey Protection</Text>
            <Text className="text-muted-foreground text-sm">
              Your imported wallet will be protected by your device's biometric authentication for maximum security.
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center p-4 pt-12">
          <Pressable 
            onPress={() => router.back()} 
            className="mr-4 p-2 -m-2"
          >
            <ChevronLeft className="text-foreground" size={24} />
          </Pressable>
          <Text className="text-xl font-bold text-foreground">Import Wallet</Text>
        </View>

        <View className="p-4">
          {/* Security Warning */}
          {renderSecurityWarning()}

          {/* Wallet Name Input */}
          {renderWalletNameInput()}

          {/* Seed Phrase Input */}
          {renderSeedPhraseInput()}

          {/* Passkey Info or PIN Setup */}
          {isPasskeySupported ? renderPasskeyInfo() : renderPinSetup()}

          {/* Import Button */}
          <Button
            onPress={handleImportWallet}
            disabled={isLoading}
            className="w-full bg-primary mt-4"
          >
            <Text className="text-primary-foreground font-medium">
              {isLoading ? 'Importing Wallet...' : 'Import Wallet'}
            </Text>
          </Button>

          {/* Additional Security Info */}
          <Card className="p-4 mt-6">
            <Text className="text-foreground font-medium mb-2">How We Protect Your Wallet</Text>
            <View className="space-y-2">
              <Text className="text-muted-foreground text-sm">
                • Your private keys are encrypted and stored securely on your device
              </Text>
              <Text className="text-muted-foreground text-sm">
                • {isPasskeySupported 
                    ? 'Biometric authentication required for all transactions' 
                    : 'PIN required for all transactions'}
              </Text>
              <Text className="text-muted-foreground text-sm">
                • No data is sent to external servers
              </Text>
              <Text className="text-muted-foreground text-sm">
                • You maintain full control of your assets
              </Text>
            </View>
          </Card>

          {/* Help Text */}
          <View className="mt-6 mb-8">
            <Text className="text-xs text-muted-foreground text-center">
              Need help? Make sure your recovery phrase is from a trusted source.
              If you're unsure, contact support before proceeding.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}