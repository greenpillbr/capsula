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
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

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
        // TODO: Convert to USD using price API
        const usdValue = parseFloat(balanceResult.data.balance) * 2500; // Mock ETH price
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
    // TODO: Navigate to network selector when created
    console.log('Open network selector');
  };

  const handleNotifications = () => {
    // TODO: Navigate to notifications when created
    console.log('Open notifications');
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
        
        <Pressable 
          onPress={() => {
            // TODO: Copy address to clipboard
            console.log('Copy address:', activeWallet?.address);
          }}
        >
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
          <Pressable onPress={() => console.log('Navigate to activity tab')}>
            <Text className="text-primary text-sm">View All</Text>
          </Pressable>
        </View>
        
        {/* Mock recent transactions */}
        <Card className="p-4 mb-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-foreground font-medium">Received ETH</Text>
              <Text className="text-muted-foreground text-sm">2 hours ago</Text>
            </View>
            <Text className="text-primary font-medium">+0.05 ETH</Text>
          </View>
        </Card>
        
        <Card className="p-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-foreground font-medium">Sent ETH</Text>
              <Text className="text-muted-foreground text-sm">1 day ago</Text>
            </View>
            <Text className="text-muted-foreground font-medium">-0.1 ETH</Text>
          </View>
        </Card>
      </View>

      {/* Empty State for New Wallets */}
      {!activeWallet && (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-center text-muted-foreground mb-4">
            No wallet selected. Please create or import a wallet to get started.
          </Text>
          <Button onPress={() => console.log('Navigate to onboarding')}>
            <Text className="text-primary-foreground">Create Wallet</Text>
          </Button>
        </View>
      )}
    </ScrollView>
  );
}
