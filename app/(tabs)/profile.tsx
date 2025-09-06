import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { keyManager } from '@/lib/crypto/keyManager';
import { Shield } from '@/lib/icons/Shield';
import { Wallet } from '@/lib/icons/Wallet';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNetworkStore } from '@/lib/stores/networkStore';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  
  const { 
    wallets, 
    activeWallet, 
    setActiveWallet,
    removeWallet 
  } = useWalletStore();
  
  const { 
    isAuthenticated,
    passkeyEnabled,
    setPasskeyEnabled,
    logout 
  } = useAuthStore();
  
  const { activeNetwork } = useNetworkStore();

  useEffect(() => {
    setBiometricEnabled(passkeyEnabled);
  }, [passkeyEnabled]);

  const handleExportSeedPhrase = async () => {
    if (!activeWallet) {
      Alert.alert('Error', 'No active wallet found');
      return;
    }

    try {
      const result = await keyManager.exportSeedPhrase(activeWallet.id);
      
      if (result.success && result.data) {
        setSeedPhrase(result.data.mnemonic);
        setShowSeedPhrase(true);
      } else {
        Alert.alert(
          'Export Failed',
          result.error || 'Failed to export seed phrase'
        );
      }
    } catch (error) {
      console.error('Failed to export seed phrase:', error);
      Alert.alert('Error', 'Failed to export seed phrase');
    }
  };

  const handleSwitchWallet = async (walletId: string) => {
    try {
      const result = await keyManager.switchWallet(walletId);
      
      if (result.success) {
        Alert.alert('Success', 'Wallet switched successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to switch wallet');
      }
    } catch (error) {
      console.error('Failed to switch wallet:', error);
      Alert.alert('Error', 'Failed to switch wallet');
    }
  };

  const handleDeleteWallet = (walletId: string) => {
    Alert.alert(
      'Delete Wallet',
      'Are you sure you want to delete this wallet? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await keyManager.deleteWallet(walletId);
              
              if (result.success) {
                Alert.alert('Success', 'Wallet deleted successfully');
              } else {
                Alert.alert('Error', result.error || 'Failed to delete wallet');
              }
            } catch (error) {
              console.error('Failed to delete wallet:', error);
              Alert.alert('Error', 'Failed to delete wallet');
            }
          },
        },
      ]
    );
  };

  const handleCreateNewWallet = async () => {
    try {
      const result = await keyManager.createWallet(`Wallet ${wallets.length + 1}`);
      
      if (result.success) {
        Alert.alert('Success', 'New wallet created successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to create wallet');
      }
    } catch (error) {
      console.error('Failed to create wallet:', error);
      Alert.alert('Error', 'Failed to create wallet');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to authenticate again to access your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('onboarding' as any);
          },
        },
      ]
    );
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderSeedPhraseModal = () => {
    if (!showSeedPhrase) return null;

    return (
      <View className="absolute inset-0 bg-black/50 justify-center items-center p-6">
        <Card className="w-full max-w-sm p-6">
          <Text className="text-lg font-bold text-foreground mb-4 text-center">
            Recovery Phrase
          </Text>
          
          <Text className="text-sm text-muted-foreground mb-4 text-center">
            Write down these 12 words in order and store them safely.
          </Text>
          
          <View className="bg-muted p-4 rounded-lg mb-6">
            <Text className="text-foreground font-mono text-sm leading-6">
              {seedPhrase}
            </Text>
          </View>
          
          <Text className="text-xs text-warning text-center mb-6">
            ⚠️ Never share your recovery phrase with anyone. 
            Anyone with these words can access your wallet.
          </Text>
          
          <Button 
            onPress={() => {
              setShowSeedPhrase(false);
              setSeedPhrase('');
            }}
            className="w-full"
          >
            <Text className="text-primary-foreground">Done</Text>
          </Button>
        </Card>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 pt-12 items-center">
          <Avatar alt="Profile" className="w-20 h-20 mb-4">
            <Text className="text-2xl">👤</Text>
          </Avatar>
          
          <Text className="text-xl font-bold text-foreground mb-1">
            {activeWallet?.name || 'Capsula User'}
          </Text>
          
          <Text className="text-muted-foreground text-sm">
            {activeWallet ? formatWalletAddress(activeWallet.address) : 'No wallet'}
          </Text>
        </View>

        {/* Wallet Management Section */}
        <View className="p-4">
          <Text className="text-lg font-semibold text-foreground mb-4">Wallet Management</Text>
          
          {/* Add Wallet */}
          <Card className="p-4 mb-3">
            <Pressable onPress={handleCreateNewWallet}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3">
                    <Wallet className="text-primary-foreground" size={20} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-medium">Add Wallet</Text>
                    <Text className="text-muted-foreground text-sm">
                      Switch to another wallet or import an existing one.
                    </Text>
                  </View>
                </View>
                <Text className="text-muted-foreground">›</Text>
              </View>
            </Pressable>
          </Card>

          {/* Export Seed Phrase */}
          <Card className="p-4 mb-4">
            <Pressable onPress={handleExportSeedPhrase}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3">
                    <Shield className="text-primary-foreground" size={20} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-medium">Export Seed Phrase</Text>
                    <Text className="text-muted-foreground text-sm">
                      Securely view your 12-word recovery phrase for backup.
                    </Text>
                  </View>
                </View>
                <Text className="text-muted-foreground">›</Text>
              </View>
            </Pressable>
          </Card>
        </View>

        {/* My Wallets Section */}
        {wallets.length > 1 && (
          <View className="p-4">
            <Text className="text-lg font-semibold text-foreground mb-4">My Wallets</Text>
            
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="p-4 mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-foreground font-medium mr-2">
                        {wallet.name}
                      </Text>
                      {wallet.id === activeWallet?.id && (
                        <Badge variant="default">
                          <Text className="text-xs">Active</Text>
                        </Badge>
                      )}
                    </View>
                    <Text className="text-muted-foreground text-sm">
                      {formatWalletAddress(wallet.address)}
                    </Text>
                  </View>
                  
                  {wallet.id !== activeWallet?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleSwitchWallet(wallet.id)}
                    >
                      <Text className="text-primary text-xs">Switch</Text>
                    </Button>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Security Section */}
        <View className="p-4">
          <Text className="text-lg font-semibold text-foreground mb-4">Security</Text>
          
          <Card className="p-4 mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-foreground font-medium">Biometric Authentication</Text>
                <Text className="text-muted-foreground text-sm">
                  Use fingerprint or face recognition to unlock your wallet
                </Text>
              </View>
              <Switch
                checked={biometricEnabled}
                onCheckedChange={(checked) => {
                  setBiometricEnabled(checked);
                  setPasskeyEnabled(checked);
                }}
              />
            </View>
          </Card>
        </View>

        {/* About Section */}
        <View className="p-4">
          <Text className="text-lg font-semibold text-foreground mb-4">About</Text>
          
          <Card className="p-4 mb-3">
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Version</Text>
                <Text className="text-foreground">1.0.0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Network</Text>
                <Text className="text-foreground">{activeNetwork?.name}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Build</Text>
                <Text className="text-foreground">MVP</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Educational Section */}
        <View className="p-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Why Your Seed Phrase Matters
          </Text>
          
          <Card className="p-4 mb-8">
            <Text className="text-muted-foreground text-sm leading-5 mb-4">
              Your 12-word seed phrase is the master key to your wallet. 
              It's crucial for restoring access to your funds if you lose your device or forget your password.
            </Text>
            
            <Text className="text-muted-foreground text-sm leading-5">
              Store it offline, in a secure place. Never share it with anyone, 
              as it grants full control over your cryptocurrency assets. 
              Capsula cannot recover it for you.
            </Text>
          </Card>
        </View>

        {/* Logout Button */}
        <View className="p-4 pb-8">
          <Button 
            variant="outline" 
            onPress={handleLogout}
            className="w-full border-error"
          >
            <Text className="text-error font-medium">Logout</Text>
          </Button>
        </View>
      </ScrollView>

      {/* Seed Phrase Modal */}
      {renderSeedPhraseModal()}
    </View>
  );
}