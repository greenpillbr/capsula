import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { keyManager } from '@/lib/crypto/keyManager';
import { Bell } from '@/lib/icons/Bell';
import { Globe } from '@/lib/icons/Globe';
import { Send } from '@/lib/icons/Send';
import { useAuthStore } from '@/lib/stores/authStore';
import { useMiniAppStore } from '@/lib/stores/miniAppStore';
import { useNetworkStore } from '@/lib/stores/networkStore';
import { useWalletStore } from '@/lib/stores/walletStore';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, View } from 'react-native';

export default function WalletHomeScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balance, setBalance] = useState('0.0');
  const [balanceUSD, setBalanceUSD] = useState('$0.00');
  
  const {
    activeWallet,
    tokens,
    getActiveWalletBalance,
    getTokensForActiveWallet,
    refreshBalances,
    isLoadingBalance
  } = useWalletStore();
  
  const { activeNetwork, getNetworkByChainId } = useNetworkStore();
  const { activeWalletId } = useAuthStore();
  
  const {
    initializeBuiltInMiniApps,
    getMiniAppsForNetwork,
    launchMiniApp,
    availableMiniAppsForNetwork,
    refreshAvailableMiniApps,
  } = useMiniAppStore();

  // Initialize mini-apps and load wallet data on mount
  useEffect(() => {
    initializeBuiltInMiniApps();
  }, []);

  // Load wallet data on mount and when active wallet changes
  useEffect(() => {
    if (activeWallet && activeNetwork) {
      loadWalletData();
      refreshAvailableMiniApps(activeNetwork.chainId);
    }
  }, [activeWallet, activeNetwork]);

  const loadWalletData = async () => {
    if (!activeWallet || !activeNetwork) return;

    try {
      // Get balance from key manager
      const balanceResult = await keyManager.getWalletBalance(
        activeWallet.id, 
        activeNetwork.chainId
      );
      
      if (balanceResult.success && balanceResult.data) {
        setBalance(balanceResult.data.balance);
        const usdValue = parseFloat(balanceResult.data.balance) * 2500; // ETH price placeholder
        setBalanceUSD(`$${usdValue.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadWalletData();
      await refreshBalances();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSend = () => {
    router.push('send' as any);
  };

  const handleReceive = () => {
    router.push('receive' as any);
  };

  const handleNetworkSwitch = () => {
    Alert.alert(
      'Switch Network',
      'Network selector will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications',
      'Notifications feature will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handleCopyAddress = async () => {
    if (!activeWallet?.address) {
      Alert.alert('Error', 'No wallet address available');
      return;
    }
    
    try {
      await Clipboard.setStringAsync(activeWallet.address);
      Alert.alert('Success', 'Address copied to clipboard');
    } catch (error) {
      console.error('Failed to copy address:', error);
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  const handleCreateWallet = () => {
    router.push('/onboarding');
  };


  const handleLaunchMiniApp = async (miniAppId: string) => {
    try {
      const success = await launchMiniApp(miniAppId);
      if (success) {
        router.push(`mini-app/${miniAppId}` as any);
      } else {
        console.error('Failed to launch mini-app:', miniAppId);
      }
    } catch (error) {
      console.error('Error launching mini-app:', error);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const walletTokens = getTokensForActiveWallet();
  const walletTransactions = useWalletStore.getState().getTransactionsForActiveWallet();

  return (
    <ScrollView 
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 pt-12">
        <Text className="text-xl font-semibold text-foreground">Capsula</Text>
        <Pressable onPress={handleNotifications}>
          <Bell className="text-foreground" size={24} />
        </Pressable>
      </View>

      {/* Network & Address */}
      <View className="px-4 mb-4">
        <Pressable 
          onPress={handleNetworkSwitch}
          className="flex-row items-center mb-2"
        >
          <Globe className="text-muted-foreground mr-2" size={16} />
          <Text className="text-sm text-muted-foreground">
            {activeNetwork?.name || 'No Network'}
          </Text>
        </Pressable>
        
        <Pressable onPress={handleCopyAddress}>
          <Text className="text-base font-medium text-foreground">
            {activeWallet ? formatAddress(activeWallet.address) : 'No Wallet'}
          </Text>
        </Pressable>
      </View>

      {/* Balance Section */}
      <View className="px-4 mb-8">
        <Text className="text-4xl font-bold text-primary mb-2">
          {isLoadingBalance ? '...' : `${parseFloat(balance).toFixed(6)} ${activeNetwork?.nativeCurrencySymbol || 'ETH'}`}
        </Text>
        <Text className="text-lg text-muted-foreground">
          {balanceUSD}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row px-4 mb-8 gap-4">
        <Button 
          onPress={handleSend}
          className="flex-1 bg-primary"
          disabled={!activeWallet || isLoadingBalance}
        >
          <View className="flex-row items-center">
            <Send className="text-primary-foreground mr-2" size={16} />
            <Text className="text-primary-foreground font-medium">Send</Text>
          </View>
        </Button>
        
        <Button 
          variant="outline" 
          onPress={handleReceive}
          className="flex-1"
          disabled={!activeWallet}
        >
          <Text className="text-primary font-medium">Receive</Text>
        </Button>
      </View>

      {/* Token List */}
      {walletTokens.length > 0 && (
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Tokens</Text>
          {walletTokens.map((token) => (
            <Card key={token.id} className="p-4 mb-3">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-foreground font-medium">{token.symbol}</Text>
                  <Text className="text-muted-foreground text-sm">{token.name}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-foreground font-medium">
                    {token.balance || '0.0'}
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    ${(parseFloat(token.balance || '0') * 100).toFixed(2)}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Mini-Apps Section */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-semibold text-foreground mb-4">
          Mini-Apps
        </Text>
        
        <View className="flex-row flex-wrap gap-4">
          {availableMiniAppsForNetwork.map((miniApp) => (
            <Pressable
              key={miniApp.id}
              onPress={() => handleLaunchMiniApp(miniApp.id)}
              className="w-20 items-center"
            >
              <View className="w-16 h-16 bg-primary/10 rounded-lg mb-2 items-center justify-center">
                <Text className="text-primary text-lg font-medium">
                  {miniApp.title[0]}
                </Text>
              </View>
              <Text className="text-xs text-foreground text-center">{miniApp.title}</Text>
            </Pressable>
          ))}
          
          {/* Add More Button (Future: Mini-App Marketplace) */}
          <Pressable
            onPress={() => console.log('Future: Open mini-apps marketplace')}
            className="w-20 items-center"
          >
            <View className="w-16 h-16 bg-muted border-2 border-dashed border-muted-foreground rounded-lg mb-2 items-center justify-center">
              <Text className="text-muted-foreground text-xl">+</Text>
            </View>
            <Text className="text-xs text-muted-foreground text-center">More</Text>
          </Pressable>
        </View>
        
        {/* No Mini-Apps Message */}
        {availableMiniAppsForNetwork.length === 0 && (
          <Card className="p-4">
            <Text className="text-center text-muted-foreground text-sm">
              No mini-apps available for {activeNetwork?.name || 'this network'}
            </Text>
          </Card>
        )}
      </View>

      {/* Recent Activity Preview */}
      <View className="px-4 mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-foreground">Recent Activity</Text>
          <Pressable onPress={() => router.push('/(tabs)/activity')}>
            <Text className="text-primary text-sm">View All</Text>
          </Pressable>
        </View>
        
        {/* Real transaction history */}
        {walletTransactions.length > 0 ? (
          walletTransactions.slice(0, 3).map((transaction) => (
            <Card key={transaction.id} className="p-4 mb-3">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-foreground font-medium">
                    {transaction.isOutgoing ? 'Sent' : 'Received'} {transaction.tokenSymbol || activeNetwork?.nativeCurrencySymbol || 'ETH'}
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    {transaction.timestamp ? new Date(transaction.timestamp).toLocaleDateString() : 'Pending'}
                  </Text>
                </View>
                <Text className={`font-medium ${
                  !transaction.isOutgoing ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {!transaction.isOutgoing ? '+' : '-'}{transaction.tokenAmount || transaction.value} {transaction.tokenSymbol || activeNetwork?.nativeCurrencySymbol || 'ETH'}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <Card className="p-4">
            <Text className="text-center text-muted-foreground text-sm">
              No transactions yet
            </Text>
          </Card>
        )}
      </View>

      {/* Empty State for New Wallets */}
      {!activeWallet && (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-center text-muted-foreground mb-4">
            No wallet selected. Please create or import a wallet to get started.
          </Text>
          <Button onPress={handleCreateWallet}>
            <Text className="text-primary-foreground">Create Wallet</Text>
          </Button>
        </View>
      )}
    </ScrollView>
  );
}
