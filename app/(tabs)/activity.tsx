import { Text } from '@/components/ui/text';
import React from 'react';
import { View } from 'react-native';

export default function ActivityScreen() {
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-semibold text-foreground mb-4">Activity</Text>
      <Text className="text-muted-foreground">Transaction history will be displayed here.</Text>
    </View>
  );
}