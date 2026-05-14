import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { keyManager } from '@/lib/crypto/keyManager';
import { Check } from '@/lib/icons/Check';
import { Shield } from '@/lib/icons/Shield';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

type PasskeySetupStepProps = {
  biometricType: string;
  onWalletCreated: (mnemonic: string) => void;
  onBack: () => void;
};

export function PasskeySetupStep({ biometricType, onWalletCreated, onBack }: PasskeySetupStepProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateWallet = async () => {
    setIsLoading(true);
    try {
      const result = await keyManager.createWallet('Capsula Wallet');

      if (result.success && result.data) {
        onWalletCreated(result.data.mnemonic);
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

  return (
    <View className="flex-1 p-6">
      <View className="flex-1 justify-center">
        <View className="items-center mb-8">
          <Shield className="text-primary mb-4" size={64} />
          <Text className="text-2xl font-bold text-center text-foreground mb-2">
            Secure with {biometricType}
          </Text>
          <Text className="text-center text-muted-foreground px-4">
            Your wallet will be protected by your device's biometric authentication. This is the most secure way to protect your assets.
          </Text>
        </View>

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

        <Button onPress={handleCreateWallet} className="w-full bg-primary" disabled={isLoading}>
          <Text className="text-primary-foreground font-medium">
            {isLoading ? 'Creating Wallet...' : `Create Secure Wallet`}
          </Text>
        </Button>
      </View>

      <Button variant="ghost" onPress={onBack} className="mt-4">
        <Text className="text-muted-foreground">Back</Text>
      </Button>
    </View>
  );
}
