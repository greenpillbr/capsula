import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { keyManager } from '@/lib/crypto/keyManager';
import { Shield } from '@/lib/icons/Shield';
import { Trash } from '@/lib/icons/Trash';
import { Wallet } from '@/lib/icons/Wallet';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNetworkStore } from '@/lib/stores/networkStore';
import { useWalletStore } from '@/lib/stores/walletStore';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  
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

  const handleDeleteWallet = (walletId: string, walletName: string) => {
    Alert.alert(
      '⚠️ Delete Wallet',
      `Are you sure you want to permanently delete "${walletName}"?\n\n• This action is FINAL and NOT REVERSIBLE\n• Make sure you have backed up your seed phrase\n• All wallet data will be permanently lost`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
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


  const handleCreateNewWallet = () => {
    setShowNameInput(true);
    setNewWalletName(`Wallet ${wallets.length + 1}`);
  };

  const handleConfirmCreateWallet = async () => {
    if (!newWalletName.trim()) {
      Alert.alert('Error', 'Please enter a wallet name');
      return;
    }

    try {
      const result = await keyManager.createWallet(newWalletName.trim());
      
      if (result.success) {
        setShowNameInput(false);
        setNewWalletName('');
        Alert.alert('Success', 'New wallet created successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to create wallet');
      }
    } catch (error) {
      console.error('Failed to create wallet:', error);
      Alert.alert('Error', 'Failed to create wallet');
    }
  };

  const handleLockWallet = () => {
    Alert.alert(
      'Lock Wallet',
      'Are you sure you want to lock your wallet? You will need to authenticate again to access it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock Wallet',
          onPress: () => {
            logout();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const handleCopyMnemonic = async () => {
    try {
      await Clipboard.setStringAsync(seedPhrase);
      Alert.alert('Success', 'Recovery phrase copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy recovery phrase');
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderSeedPhraseModal = () => {
    if (!showSeedPhrase) return null;
    const words = seedPhrase.split(' ');

    return (
      <View className="absolute inset-0 bg-background">
        <ScrollView className="flex-1 p-6">
          {/* Header */}
          <View className="mb-6 pt-8">
            <Text className="text-2xl font-bold text-center text-foreground mb-2">
              Backup Your Wallet
            </Text>
            <Text className="text-center text-muted-foreground px-4">
              Write down these {words.length} words in order and store them safely.
              This is your recovery phrase.
            </Text>
          </View>

          {/* Educational Section */}
          <Card className="p-4 mb-6 border-warning">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Why Your Seed Phrase Matters
            </Text>
            <Text className="text-muted-foreground text-sm leading-5 mb-4">
              Your {words.length}-word seed phrase is the master key to your wallet.
              It's crucial for restoring access to your funds if you lose your device.
            </Text>
            <Text className="text-muted-foreground text-sm leading-5">
              • Store it offline, in a secure place
              • Never share it with anyone
              • Anyone with these words can access your wallet
              • Capsula cannot recover it for you if lost
            </Text>
          </Card>

          {/* Mnemonic Display */}
          <Card className="p-4 mb-6">
            <View className="flex-row flex-wrap">
              {words.map((word, index) => (
                <View
                  key={index}
                  className="w-1/3 p-2"
                >
                  <View className="bg-muted p-3 rounded-lg items-center">
                    <Text className="text-xs text-muted-foreground mb-1">
                      {index + 1}
                    </Text>
                    <Text className="text-foreground font-medium">
                      {word}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Copy Button */}
          <Button
            variant="outline"
            onPress={handleCopyMnemonic}
            className="w-full mb-4"
          >
            <Text className="text-primary font-medium">Copy to Clipboard</Text>
          </Button>

          {/* Close Button */}
          <Button
            onPress={() => {
              setShowSeedPhrase(false);
              setSeedPhrase('');
            }}
            className="w-full bg-primary"
          >
            <Text className="text-primary-foreground font-medium">Done</Text>
          </Button>
        </ScrollView>
      </View>
    );
  };

  const renderNameInputModal = () => {
    if (!showNameInput) return null;

    return (
      <View className="absolute inset-0 bg-black/50 justify-center items-center p-6">
        <Card className="w-full max-w-sm p-6">
          <Text className="text-lg font-bold text-foreground mb-4 text-center">
            Create New Wallet
          </Text>
          
          <Text className="text-sm text-muted-foreground mb-4">
            Enter a name for your new wallet:
          </Text>
          
          <TextInput
            value={newWalletName}
            onChangeText={setNewWalletName}
            placeholder="Wallet name"
            className="border border-border rounded-lg p-3 mb-6 text-foreground"
            autoFocus
          />
          
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              onPress={() => {
                setShowNameInput(false);
                setNewWalletName('');
              }}
              className="flex-1"
            >
              <Text className="text-primary">Cancel</Text>
            </Button>
            
            <Button
              onPress={handleConfirmCreateWallet}
              className="flex-1 bg-primary"
            >
              <Text className="text-primary-foreground">Create</Text>
            </Button>
          </View>
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
                      Create a new wallet with custom name.
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
                  
                  <View className="flex-row gap-2">
                    {wallet.id !== activeWallet?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => handleSwitchWallet(wallet.id)}
                      >
                        <Text className="text-primary text-xs">Switch</Text>
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleDeleteWallet(wallet.id, wallet.name)}
                      className="border-error"
                    >
                      <Trash className="text-error" size={12} />
                    </Button>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}


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

        {/* Lock Wallet Button */}
        <View className="p-4 pb-8">
          <Button
            variant="outline"
            onPress={handleLockWallet}
            className="w-full border-error"
          >
            <Text className="text-error font-medium">Lock Your Wallet</Text>
          </Button>
        </View>
      </ScrollView>

      {/* Seed Phrase Modal */}
      {renderSeedPhraseModal()}
      
      {/* Name Input Modal */}
      {renderNameInputModal()}
    </View>
  );
}