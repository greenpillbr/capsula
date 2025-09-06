import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { Transaction } from '@/db/schema';
import { ethersService } from '@/lib/blockchain/ethersService';
import { Globe } from '@/lib/icons/Globe';
import { Send } from '@/lib/icons/Send';
import { useNetworkStore } from '@/lib/stores/networkStore';
import { useWalletStore } from '@/lib/stores/walletStore';
import React, { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

export default function ActivityScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const { 
    activeWallet, 
    recentTransactions, 
    pendingTransactions,
    getTransactionsForActiveWallet 
  } = useWalletStore();
  
  const { activeNetwork } = useNetworkStore();

  useEffect(() => {
    loadTransactions();
  }, [activeWallet, activeNetwork]);

  const loadTransactions = async () => {
    if (!activeWallet || !activeNetwork) return;

    try {
      // Get transactions from store
      const storeTransactions = getTransactionsForActiveWallet();
      
      // Combine with pending transactions
      const allTransactions = [...pendingTransactions, ...storeTransactions];
      
      // Sort by timestamp (most recent first)
      const sortedTransactions = allTransactions.sort((a, b) => 
        new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
      );

      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // TODO: Fetch latest transactions from blockchain
      if (activeWallet && activeNetwork) {
        const history = await ethersService.getTransactionHistory(
          activeWallet.address,
          0,
          'latest',
          activeNetwork.chainId
        );
        
        // Convert ethers transactions to our Transaction type
        // This would be implemented when we have real blockchain data
        console.log('Fetched transaction history:', history.length);
      }
      
      await loadTransactions();
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getFilteredTransactions = () => {
    switch (filter) {
      case 'sent':
        return transactions.filter(tx => tx.isOutgoing);
      case 'received':
        return transactions.filter(tx => !tx.isOutgoing);
      default:
        return transactions;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getTransactionIcon = (tx: Transaction) => {
    if (tx.status === 'Pending') {
      return <View className="w-2 h-2 bg-warning rounded-full animate-pulse" />;
    }
    if (tx.status === 'Failed') {
      return <View className="w-2 h-2 bg-error rounded-full" />;
    }
    return tx.isOutgoing 
      ? <Send className="text-muted-foreground" size={16} />
      : <View className="w-2 h-2 bg-primary rounded-full" />;
  };

  const getTransactionTitle = (tx: Transaction) => {
    if (tx.type === 'Native Transfer') {
      return tx.isOutgoing ? 'Sent' : 'Received';
    }
    if (tx.type === 'ERC20 Transfer') {
      return tx.isOutgoing ? 'Sent Token' : 'Received Token';
    }
    return tx.type;
  };

  const getTransactionAmount = (tx: Transaction) => {
    const symbol = tx.tokenSymbol || activeNetwork?.nativeCurrencySymbol || 'ETH';
    const amount = tx.tokenAmount || tx.value;
    const sign = tx.isOutgoing ? '-' : '+';
    
    return `${sign}${parseFloat(amount).toFixed(6)} ${symbol}`;
  };

  const getTransactionAmountColor = (tx: Transaction) => {
    if (tx.status === 'Failed') return 'text-muted-foreground';
    return tx.isOutgoing ? 'text-muted-foreground' : 'text-primary';
  };

  const renderTransactionItem = (tx: Transaction) => (
    <Card key={tx.id} className="p-4 mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-muted rounded-full items-center justify-center mr-3">
            {getTransactionIcon(tx)}
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-foreground font-medium mr-2">
                {getTransactionTitle(tx)}
              </Text>
              <Badge variant={tx.status === 'Pending' ? 'secondary' : tx.status === 'Failed' ? 'destructive' : 'default'}>
                <Text className="text-xs">{tx.status}</Text>
              </Badge>
            </View>
            
            <Text className="text-muted-foreground text-sm">
              {tx.isOutgoing 
                ? `To ${tx.toAddress.slice(0, 8)}...${tx.toAddress.slice(-6)}`
                : `From ${tx.fromAddress.slice(0, 8)}...${tx.fromAddress.slice(-6)}`
              }
            </Text>
            
            <Text className="text-muted-foreground text-xs">
              {formatDate(tx.timestamp || '')}
            </Text>
          </View>
        </View>
        
        <View className="items-end">
          <Text className={`font-medium ${getTransactionAmountColor(tx)}`}>
            {getTransactionAmount(tx)}
          </Text>
          {tx.status === 'Confirmed' && (
            <Text className="text-muted-foreground text-xs">
              Block #{tx.blockNumber}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );

  const filteredTransactions = getFilteredTransactions();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="p-4 pt-12">
        <Text className="text-2xl font-bold text-foreground mb-4">Activity</Text>
        
        {/* Network Info */}
        <View className="flex-row items-center mb-4">
          <Globe className="text-muted-foreground mr-2" size={16} />
          <Text className="text-muted-foreground">
            {activeNetwork?.name || 'No Network Selected'}
          </Text>
        </View>

        {/* Filter Buttons */}
        <View className="flex-row gap-2 mb-4">
          {(['all', 'sent', 'received'] as const).map((filterType) => (
            <Pressable
              key={filterType}
              onPress={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-full ${
                filter === filterType 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`}
            >
              <Text className={`text-sm font-medium ${
                filter === filterType 
                  ? 'text-primary-foreground' 
                  : 'text-muted-foreground'
              }`}>
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredTransactions.length > 0 ? (
          <View className="pb-8">
            {filteredTransactions.map(renderTransactionItem)}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-16">
            <Send className="text-muted-foreground mb-4" size={48} />
            <Text className="text-center text-muted-foreground mb-2">
              No {filter === 'all' ? '' : filter} transactions yet
            </Text>
            <Text className="text-center text-muted-foreground text-sm px-8">
              Your transaction history will appear here once you start using your wallet.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Wallet Info Footer */}
      {activeWallet && (
        <View className="p-4 border-t border-border">
          <Text className="text-xs text-muted-foreground text-center">
            Wallet: {activeWallet.address.slice(0, 10)}...{activeWallet.address.slice(-8)}
          </Text>
        </View>
      )}
    </View>
  );
}