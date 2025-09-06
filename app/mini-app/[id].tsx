import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { MiniAppErrorBoundary, MiniAppHost } from '@/lib/mini-apps/host/MiniAppHost';
import { MiniAppProvider } from '@/lib/mini-apps/sdk';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function MiniAppScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleError = (error: Error) => {
    console.error('Mini-app error boundary caught:', error);
  };

  if (!id) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6">
        <Text className="text-error text-lg font-semibold text-center mb-4">
          Invalid Mini-App
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          No mini-app ID provided
        </Text>
        <Button onPress={handleClose}>
          <Text className="text-primary-foreground">Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <MiniAppProvider>
      <MiniAppErrorBoundary miniAppId={id} onError={handleError}>
        <MiniAppHost
          miniAppId={id}
          onClose={handleClose}
        />
      </MiniAppErrorBoundary>
    </MiniAppProvider>
  );
}