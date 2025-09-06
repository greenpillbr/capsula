import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Bell } from '@/lib/icons/Bell';
import { Send } from '@/lib/icons/Send';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function WalletHomeScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 pt-12">
        <Text className="text-xl font-semibold text-foreground">Capsula</Text>
        <Bell className="text-foreground" size={24} />
      </View>

      {/* Wallet Address */}
      <View className="px-4 mb-4">
        <Text className="text-sm text-muted-foreground mb-1">Ethereum Mainnet</Text>
        <Text className="text-base font-medium text-foreground">0x8E1C...E8I</Text>
      </View>

      {/* Balance Section */}
      <View className="px-4 mb-6">
        <Text className="text-3xl font-bold text-primary mb-1">123.456789000... ETH</Text>
        <Text className="text-lg text-muted-foreground">$456,789.01 USD</Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row px-4 mb-8 gap-4">
        <Button className="flex-1 bg-primary">
          <Send className="text-primary-foreground mr-2" size={16} />
          <Text className="text-primary-foreground font-medium">Send</Text>
        </Button>
        <Button variant="outline" className="flex-1">
          <Text className="text-primary font-medium">Receive</Text>
        </Button>
      </View>

      {/* Mini-Apps Section */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-semibold text-foreground mb-4">Installed Mini-apps</Text>
        <View className="flex-row flex-wrap gap-4">
          {['Tokens', 'Contacts', 'NFTs', 'CookieJar', 'Gardens', 'Add more'].map((app) => (
            <View key={app} className="w-20 items-center">
              <View className="w-16 h-16 bg-muted rounded-lg mb-2 items-center justify-center">
                <Text className="text-muted-foreground text-xs">{app[0]}</Text>
              </View>
              <Text className="text-xs text-foreground text-center">{app}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
