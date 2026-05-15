import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import React from 'react';
import { View } from 'react-native';

export function AboutMiniAppsSection() {
  return (
    <View className="p-4 pb-8">
      <Card className="p-4 border-muted">
        <Text className="text-foreground font-medium mb-2">About Mini-Apps</Text>
        <Text className="text-muted-foreground text-sm leading-5">
          • Mini-apps extend your wallet with new functionality{'\n'}
          • Each mini-app is designed for specific networks{'\n'}
          • Built-in apps are pre-installed and verified{'\n'}
          • Community apps are curated for safety and quality
        </Text>
      </Card>
    </View>
  );
}
