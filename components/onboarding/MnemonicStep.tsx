import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNetworkStore } from '@/lib/stores/networkStore';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, View } from 'react-native';

export async function completeOnboarding(): Promise<void> {
  try {
    useNetworkStore.getState().initializeDefaultNetworks();
    const { setOnboardingComplete, setAuthenticated } = useAuthStore.getState();
    setOnboardingComplete(true);
    setAuthenticated(true);
    router.replace('/(tabs)');
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
    Alert.alert('Error', 'Failed to complete setup. Please try again.');
  }
}

type MnemonicStepProps = {
  walletMnemonic: string;
  onBack: () => void;
};

export function MnemonicStep({ walletMnemonic, onBack }: MnemonicStepProps) {
  const words = walletMnemonic.split(' ');

  const handleCopyMnemonic = async () => {
    try {
      await Clipboard.setStringAsync(walletMnemonic);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy recovery phrase');
    }
  };

  return (
    <ScrollView className="flex-1 p-6">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-center text-foreground mb-2">
          Backup Your Wallet
        </Text>
        <Text className="text-center text-muted-foreground px-4">
          Write down these {words.length} words in order and store them safely. This is your recovery phrase.
        </Text>
      </View>

      <Card className="p-4 mb-6 border-warning">
        <Text className="text-warning font-medium mb-2">⚠️ Important</Text>
        <Text className="text-muted-foreground text-sm">
          • Never share your recovery phrase with anyone
          {'\n'}• Store it offline in a secure location
          {'\n'}• Anyone with these words can access your wallet
          {'\n'}• Capsula cannot recover this for you if lost
        </Text>
      </Card>

      <Card className="p-4 mb-6">
        <View className="flex-row flex-wrap">
          {words.map((word, index) => (
            <View key={index} className="w-1/3 p-2">
              <View className="bg-muted p-3 rounded-lg items-center">
                <Text className="text-xs text-muted-foreground mb-1">{index + 1}</Text>
                <Text className="text-foreground font-medium">{word}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Button variant="outline" onPress={handleCopyMnemonic} className="w-full mb-4">
        <Text className="text-primary font-medium">Copy to Clipboard</Text>
      </Button>

      <View className="space-y-3">
        <Button onPress={() => void completeOnboarding()} className="w-full bg-primary">
          <Text className="text-primary-foreground font-medium">
            I've Safely Stored My Recovery Phrase
          </Text>
        </Button>

        <Button variant="outline" onPress={onBack}>
          <Text className="text-primary font-medium">Back</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
