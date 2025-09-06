import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useNetworkStore } from '@/lib/stores';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import type { MiniAppProps } from '../../sdk/types';

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  isCustom: boolean;
}

// Curated ERC-20 tokens for different networks
const CURATED_TOKENS: Record<number, TokenData[]> = {
  1: [ // Ethereum Mainnet
    {
      address: '0xA0b86a33E6414141b0Fa82Ac1BE9738E0aaC8a34A',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      balance: '0',
      isCustom: false,
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18,
      balance: '0',
      isCustom: false,
    },
  ],
  42220: [ // CELO Mainnet
    {
      address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
      name: 'Celo Dollar',
      symbol: 'cUSD',
      decimals: 18,
      balance: '0',
      isCustom: false,
    },
  ],
  100: [ // Gnosis Chain
    {
      address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
      name: 'USD Coin on Gnosis',
      symbol: 'USDC',
      decimals: 6,
      balance: '0',
      isCustom: false,
    },
  ],
};

export default function TokensModule({ sdk, onClose, isActive }: MiniAppProps) {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  
  const { activeNetwork } = useNetworkStore();

  // Load curated tokens for current network
  useEffect(() => {
    if (activeNetwork && CURATED_TOKENS[activeNetwork.chainId]) {
      setTokens(CURATED_TOKENS[activeNetwork.chainId]);
      loadTokenBalances();
    } else {
      setTokens([]);
    }
  }, [activeNetwork]);

  // Load token balances
  const loadTokenBalances = async () => {
    if (!activeNetwork || !sdk.wallet.getActiveWallet()) return;

    setIsLoadingBalances(true);
    try {
      const updatedTokens = await Promise.all(
        tokens.map(async (token) => {
          try {
            const balance = await sdk.wallet.getBalance(token.address);
            return { ...token, balance };
          } catch (error) {
            console.error(`Failed to get balance for ${token.symbol}:`, error);
            return token;
          }
        })
      );
      
      setTokens(updatedTokens);
    } catch (error) {
      console.error('Failed to load token balances:', error);
      sdk.ui.showToast('Failed to load token balances', 'error');
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Add custom token
  const handleAddCustomToken = async () => {
    if (!customTokenAddress.trim() || !activeNetwork) return;

    // Validate address format
    if (!customTokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      Alert.alert('Invalid Address', 'Please enter a valid Ethereum address');
      return;
    }

    setIsAddingToken(true);
    try {
      // Get token info from contract
      const tokenInfo = await sdk.network.readContract({
        contractAddress: customTokenAddress,
        abi: [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
        ],
        functionName: 'name',
        args: [],
      });

      const symbol = await sdk.network.readContract({
        contractAddress: customTokenAddress,
        abi: [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
        ],
        functionName: 'symbol',
        args: [],
      });

      const decimals = await sdk.network.readContract({
        contractAddress: customTokenAddress,
        abi: [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
        ],
        functionName: 'decimals',
        args: [],
      });

      // Get balance
      const balance = await sdk.wallet.getBalance(customTokenAddress);

      const newToken: TokenData = {
        address: customTokenAddress,
        name: tokenInfo,
        symbol: symbol,
        decimals: Number(decimals),
        balance,
        isCustom: true,
      };

      // Check if token already exists
      const tokenExists = tokens.some(token => 
        token.address.toLowerCase() === customTokenAddress.toLowerCase()
      );

      if (tokenExists) {
        Alert.alert('Token Already Added', 'This token is already in your list');
        return;
      }

      // Add to list
      setTokens(prev => [...prev, newToken]);
      setCustomTokenAddress('');
      setShowAddCustom(false);
      
      sdk.ui.showToast(`${symbol} token added successfully!`, 'success');

    } catch (error) {
      console.error('Failed to add custom token:', error);
      Alert.alert(
        'Failed to Add Token',
        'Please check the contract address and make sure it\'s a valid ERC-20 token on the current network.'
      );
    } finally {
      setIsAddingToken(false);
    }
  };

  // Remove custom token
  const handleRemoveToken = (tokenAddress: string) => {
    const token = tokens.find(t => t.address === tokenAddress);
    if (!token?.isCustom) return;

    Alert.alert(
      'Remove Token',
      `Are you sure you want to remove ${token.symbol} from your token list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setTokens(prev => prev.filter(t => t.address !== tokenAddress));
            sdk.ui.showToast(`${token.symbol} removed`, 'info');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pt-12 border-b border-border">
        <Text className="text-xl font-semibold text-foreground">Tokens</Text>
        <Button variant="outline" size="sm" onPress={onClose}>
          <Text className="text-foreground">Close</Text>
        </Button>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Network Info */}
        <Card className="p-4 mb-4">
          <Text className="text-sm text-muted-foreground mb-1">Current Network</Text>
          <Text className="text-foreground font-medium">
            {activeNetwork?.name || 'Unknown Network'}
          </Text>
        </Card>

        {/* Token List */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">Your Tokens</Text>
            <Button
              variant="outline"
              size="sm"
              onPress={() => loadTokenBalances()}
              disabled={isLoadingBalances}
            >
              {isLoadingBalances ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Text className="text-primary">Refresh</Text>
              )}
            </Button>
          </View>

          {tokens.length === 0 ? (
            <Card className="p-6">
              <Text className="text-center text-muted-foreground">
                No tokens available for {activeNetwork?.name || 'this network'}
              </Text>
            </Card>
          ) : (
            tokens.map((token) => (
              <Card key={token.address} className="p-4 mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-foreground font-medium mr-2">
                        {token.symbol}
                      </Text>
                      {token.isCustom && (
                        <View className="bg-primary/10 px-2 py-1 rounded">
                          <Text className="text-primary text-xs">Custom</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-muted-foreground text-sm">
                      {token.name}
                    </Text>
                    <Text className="text-muted-foreground text-xs mt-1">
                      {`${token.address.slice(0, 6)}...${token.address.slice(-4)}`}
                    </Text>
                  </View>
                  
                  <View className="items-end">
                    <Text className="text-foreground font-medium">
                      {parseFloat(token.balance).toFixed(4)} {token.symbol}
                    </Text>
                    {token.isCustom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => handleRemoveToken(token.address)}
                        className="mt-1 p-1"
                      >
                        <Text className="text-error text-xs">Remove</Text>
                      </Button>
                    )}
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Add Custom Token Section */}
        <Card className="p-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Add Custom Token
          </Text>
          
          {!showAddCustom ? (
            <Button onPress={() => setShowAddCustom(true)}>
              <Text className="text-primary-foreground">Add Custom ERC-20 Token</Text>
            </Button>
          ) : (
            <View className="space-y-4">
              <View>
                <Text className="text-sm text-muted-foreground mb-2">
                  Contract Address
                </Text>
                <Input
                  placeholder="0x..."
                  value={customTokenAddress}
                  onChangeText={setCustomTokenAddress}
                  className="mb-2"
                />
                <Text className="text-xs text-muted-foreground">
                  Enter the contract address of the ERC-20 token you want to add
                </Text>
              </View>
              
              <View className="flex-row gap-2">
                <Button
                  variant="outline"
                  onPress={() => {
                    setShowAddCustom(false);
                    setCustomTokenAddress('');
                  }}
                  className="flex-1"
                >
                  <Text className="text-foreground">Cancel</Text>
                </Button>
                <Button
                  onPress={handleAddCustomToken}
                  disabled={!customTokenAddress.trim() || isAddingToken}
                  className="flex-1"
                >
                  {isAddingToken ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-primary-foreground">Add Token</Text>
                  )}
                </Button>
              </View>
            </View>
          )}
        </Card>

        {/* Help Section */}
        <Card className="p-4 mt-4 mb-8">
          <Text className="text-sm font-medium text-foreground mb-2">
            About ERC-20 Tokens
          </Text>
          <Text className="text-xs text-muted-foreground leading-4">
            ERC-20 tokens are digital assets built on Ethereum and compatible networks. 
            You can add any ERC-20 token by entering its contract address. 
            Always verify the contract address from a trusted source before adding tokens.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}