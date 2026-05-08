import { Text } from '@/components/ui/text';
import { Globe } from '@/lib/icons';
import React from 'react';
import { Pressable, View } from 'react-native';

type MiniAppsHeaderProps = {
  currentNetworkName: string;
  onPressNetwork: () => void;
};

export function MiniAppsHeader({ currentNetworkName, onPressNetwork }: MiniAppsHeaderProps) {
  return (
    <>
      <View className="p-4 pt-12 pb-6 border-b border-border">
        <Text className="text-xl font-bold text-foreground text-center">Mini-apps</Text>
      </View>

      <View className="px-4 mt-4 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted-foreground">Showing apps for:</Text>
          <Pressable onPress={onPressNetwork} className="flex-row items-center">
            <Globe className="text-primary mr-1" size={14} />
            <Text className="text-primary text-sm font-medium">{currentNetworkName}</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
