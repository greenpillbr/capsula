import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Globe } from '@/lib/icons/Globe';
import { useNetworkStore } from '@/lib/stores/networkStore';
import { useWalletStore } from '@/lib/stores/walletStore';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, Share, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function ReceiveScreen() {
  const router = useRouter();
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
  const { activeWallet } = useWalletStore();
  const { activeNetwork } = useNetworkStore();

  // Show error if no active wallet
  if (!activeWallet) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-center text-muted-foreground mb-4">
          No active wallet found. Please create or select a wallet first.
        </Text>
        <Button onPress={() => router.back()}>
          <Text className="text-primary-foreground">Go Back</Text>
        </Button>
      </View>
    );
  }

  const handleCopyAddress = async () => {
    try {
      await Clipboard.setStringAsync(activeWallet.address);
      setCopiedToClipboard(true);
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopiedToClipboard(false), 3000);
      
      // Show toast-like feedback
      Alert.alert('Copied!', 'Address copied to clipboard');
    } catch (error) {
      console.error('Failed to copy address:', error);
      Alert.alert('Error', 'Failed to copy address to clipboard');
    }
  };

  const handleShareAddress = async () => {
    try {
      const result = await Share.share({
        message: `My ${activeNetwork?.name || 'Ethereum'} wallet address: ${activeWallet.address}`,
        title: 'Share Wallet Address',
      });

      if (result.action === Share.sharedAction) {
        console.log('Address shared successfully');
      }
    } catch (error) {
      console.error('Failed to share address:', error);
      Alert.alert('Error', 'Failed to share address');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  // Create QR code data with wallet address
  const qrCodeValue = activeWallet.address;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 pt-12">
        <Text className="text-xl font-semibold text-foreground">Receive</Text>
        <Pressable onPress={() => router.back()}>
          <X className="text-muted-foreground" size={24} />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center p-6">
        {/* Network Info */}
        <View className="flex-row items-center mb-6">
          <Globe className="text-muted-foreground mr-2" size={16} />
          <Text className="text-muted-foreground">
            {activeNetwork?.name || 'Ethereum Mainnet'}
          </Text>
        </View>

        {/* QR Code */}
        <Card className="p-6 mb-6 items-center">
          <View className="mb-4">
            <QRCode
              value={qrCodeValue}
              size={200}
              color="#1A237E" // Capsula dark blue
              backgroundColor="#FFFFFF"
              logo={undefined} // TODO: Add Capsula logo when available
              logoSize={30}
              logoBackgroundColor="transparent"
            />
          </View>
          
          <Text className="text-center text-muted-foreground text-sm">
            Scan this QR code to send {activeNetwork?.nativeCurrencySymbol || 'ETH'} to your wallet
          </Text>
        </Card>

        {/* Address Display */}
        <Card className="p-4 mb-6 w-full">
          <Text className="text-sm text-muted-foreground mb-2">Your Address</Text>
          <Pressable onPress={handleCopyAddress}>
            <Text className="text-foreground font-mono text-center break-all mb-2">
              {activeWallet.address}
            </Text>
            <Text className="text-center text-muted-foreground text-xs">
              {copiedToClipboard ? '✓ Copied to clipboard' : 'Tap to copy'}
            </Text>
          </Pressable>
        </Card>

        {/* Warning */}
        <Card className="p-4 mb-8 border-warning">
          <Text className="text-warning font-medium mb-2">⚠️ Important</Text>
          <Text className="text-muted-foreground text-sm">
            • Only send {activeNetwork?.nativeCurrencySymbol || 'ETH'} and {activeNetwork?.name || 'Ethereum'}-compatible tokens to this address
            • Sending other cryptocurrencies may result in permanent loss
            • Double-check the network before sharing this address
          </Text>
        </Card>
      </View>

      {/* Action Buttons */}
      <View className="p-6 space-y-3">
        <Button 
          onPress={handleCopyAddress}
          className="w-full bg-primary"
        >
          <Text className="text-primary-foreground font-medium">
            {copiedToClipboard ? '✓ Copied!' : 'Copy Address'}
          </Text>
        </Button>
        
        <Button 
          variant="outline" 
          onPress={handleShareAddress}
          className="w-full"
        >
          <Text className="text-primary font-medium">Share Address</Text>
        </Button>
      </View>
    </View>
  );
}