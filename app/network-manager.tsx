import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Check, ChevronLeft, Globe, Plus } from '@/lib/icons';
import { useNetworkStore } from '@/lib/stores/networkStore';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, TextInput, View } from 'react-native';

interface ChainlistRpcEntry {
  url: string;
  tracking?: string;
}

interface ChainlistNetwork {
  name: string;
  chainId: number;
  rpc: (string | ChainlistRpcEntry)[];
  nativeCurrency: {
    symbol: string;
    name: string;
    decimals: number;
  };
  explorers?: Array<{
    url: string;
    name: string;
  }>;
  icon?: string;
  infoURL?: string;
}

// Simple search component that avoids focus issues by pre-loading data
const NetworkSearch = React.memo(({
  onNetworkAdd,
  existingNetworks,
  chainlistData
}: {
  onNetworkAdd: (network: ChainlistNetwork) => void;
  existingNetworks: any[];
  chainlistData: ChainlistNetwork[];
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Immediate filtering without state updates that cause re-renders
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim() || chainlistData.length === 0) {
      return [];
    }

    const queryLower = searchQuery.toLowerCase();
    return chainlistData
      .filter(network =>
        network.name.toLowerCase().includes(queryLower) ||
        network.nativeCurrency.symbol.toLowerCase().includes(queryLower) ||
        network.chainId.toString().includes(queryLower)
      )
      .slice(0, 8);
  }, [searchQuery, chainlistData]);

  const handleNetworkSelect = useCallback((network: ChainlistNetwork) => {
    onNetworkAdd(network);
    setSearchQuery('');
  }, [onNetworkAdd]);

  return (
    <View>
      <TextInput
        ref={inputRef}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Type network name (e.g., Polygon, Arbitrum)"
        className="border border-border rounded-lg p-3 text-foreground bg-background"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      
      {/* Results shown inline */}
      {searchResults.length > 0 && (
        <View className="mt-4 border border-border rounded-lg overflow-hidden">
          <Text className="text-foreground font-medium p-3 bg-muted">Search Results</Text>
          {searchResults.map((network) => {
            const isAlreadyAdded = existingNetworks.some(n => n.chainId === network.chainId);
            
            return (
              <Pressable
                key={network.chainId}
                onPress={() => !isAlreadyAdded && handleNetworkSelect(network)}
                className={`p-3 border-t border-border flex-row items-center justify-between ${
                  isAlreadyAdded ? 'opacity-50' : 'active:bg-muted'
                }`}
              >
                <View className="flex-1">
                  <Text className="text-foreground font-medium">{network.name}</Text>
                  <Text className="text-muted-foreground text-sm">
                    {network.nativeCurrency.symbol} • Chain ID: {network.chainId}
                  </Text>
                </View>
                
                {isAlreadyAdded ? (
                  <Text className="text-muted-foreground text-xs">Added</Text>
                ) : (
                  <Text className="text-primary text-xs">Tap to add</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
      
      {searchResults.length === 0 && searchQuery.trim() && chainlistData.length > 0 && (
        <View className="mt-4 border border-border rounded-lg p-4">
          <Text className="text-muted-foreground text-sm text-center">
            No networks found for "{searchQuery}"
          </Text>
        </View>
      )}
    </View>
  );
});

export default function NetworkManagerScreen() {
  const router = useRouter();
  const { 
    networks, 
    activeNetwork, 
    setActiveNetwork, 
    addCustomNetwork,
    removeNetwork 
  } = useNetworkStore();

  const [showAddNetwork, setShowAddNetwork] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chainlistNetworks, setChainlistNetworks] = useState<ChainlistNetwork[]>([]);

  // Pre-load chainlist data on component mount to avoid focus issues
  useEffect(() => {
    const loadChainlistData = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://chainlist.org/rpcs.json');
        const data = await response.json();
        
        const validNetworks = Object.values(data as Record<string, ChainlistNetwork>)
          .filter((network: ChainlistNetwork) =>
            network.rpc &&
            network.rpc.length > 0 &&
            network.nativeCurrency &&
            network.name &&
            !network.name.toLowerCase().includes('deprecated')
          )
          .sort((a, b) => a.name.localeCompare(b.name));

        setChainlistNetworks(validNetworks);
      } catch (error) {
        console.error('Failed to fetch chainlist data:', error);
        Alert.alert('Error', 'Failed to load network list from Chainlist.org');
      } finally {
        setLoading(false);
      }
    };

    loadChainlistData();
  }, []);

  const handleNetworkSelect = async (network: any) => {
    try {
      setActiveNetwork(network);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to switch network');
    }
  };

  const handleAddNetwork = useCallback(async (chainlistNetwork: ChainlistNetwork) => {
    try {
      console.log('Adding network:', chainlistNetwork.name, 'Chain ID:', chainlistNetwork.chainId);
      
      // Check if network already exists
      const existingNetwork = networks.find(n => n.chainId === chainlistNetwork.chainId);
      if (existingNetwork) {
        Alert.alert('Network Already Added', `${chainlistNetwork.name} is already in your networks`);
        return;
      }

      // Debug: Log all RPC URLs for this network
      console.log('All RPC URLs for', chainlistNetwork.name, ':', chainlistNetwork.rpc);
      
      // Parse RPC entries and prioritize those with tracking "none" or "limited"
      const rpcCandidates = chainlistNetwork.rpc
        .map(rpc => {
          if (typeof rpc === 'string') {
            return { url: rpc, tracking: 'none' };
          } else if (rpc && typeof rpc === 'object' && rpc.url) {
            return { url: rpc.url, tracking: rpc.tracking || 'none' };
          }
          return null;
        })
        .filter(Boolean)
        .filter(rpc => rpc && rpc.url && typeof rpc.url === 'string')
        .filter(rpc => rpc!.url.trim().length > 0)
        .filter(rpc => !rpc!.url.includes('${'))
        .filter(rpc => !rpc!.url.includes('YOUR_API_KEY'))
        .filter(rpc => !rpc!.url.includes('<api'))
        .filter(rpc => rpc!.url.startsWith('https://'));
      
      
      // Prioritize RPCs with tracking "none"
      const preferredRpc = rpcCandidates.find(rpc =>
        rpc && (rpc.tracking === 'none')
      );
      
      // Fallback to any valid RPC if no preferred tracking found
      const workingRpc = preferredRpc?.url || rpcCandidates[0]?.url;
      

      if (!workingRpc) {
        Alert.alert(
          'No Valid RPC Found',
          `Could not find a working RPC URL for ${chainlistNetwork.name}. This network may not be properly configured in Chainlist.org.`
        );
        return;
      }

      const newNetwork = {
        chainId: chainlistNetwork.chainId,
        name: chainlistNetwork.name,
        rpcUrl: workingRpc,
        explorerUrl: chainlistNetwork.explorers?.[0]?.url || '',
        nativeCurrencySymbol: chainlistNetwork.nativeCurrency.symbol,
        nativeCurrencyDecimals: chainlistNetwork.nativeCurrency.decimals,
        nativeCurrencyName: chainlistNetwork.nativeCurrency.name,
        iconUrl: chainlistNetwork.icon ? `https://icons.llamao.fi/icons/chains/rsz_${chainlistNetwork.icon}.jpg` : '',
        isDefault: false,
        isRecommended: false,
      };

      console.log('Network to add:', newNetwork);

      addCustomNetwork(newNetwork);
      
      setShowAddNetwork(false);
    } catch (error) {
      console.error('Error adding network:', error);
      Alert.alert('Error', `Failed to add network: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [addCustomNetwork, networks]);

  const handleRemoveNetwork = async (chainId: number, networkName: string) => {
    Alert.alert(
      'Remove Network',
      `Are you sure you want to remove ${networkName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              removeNetwork(chainId);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove network');
            }
          },
        },
      ]
    );
  };

  const NetworkCard = ({ network, isActive, onPress, onRemove }: {
    network: any;
    isActive: boolean;
    onPress: () => void;
    onRemove?: () => void;
  }) => (
    <Card className="mb-3">
      <Pressable 
        onPress={onPress}
        className="p-4 flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-muted rounded-full items-center justify-center mr-3 overflow-hidden">
            {network.iconUrl ? (
              <Image
                source={{ uri: network.iconUrl }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                onError={() => console.log('Failed to load network icon')}
              />
            ) : (
              <Globe className="text-muted-foreground" size={20} />
            )}
          </View>
          
          <View className="flex-1">
            <Text className="text-foreground font-medium">{network.name}</Text>
            <Text className="text-muted-foreground text-sm">
              {network.nativeCurrencySymbol} • Chain ID: {network.chainId}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center gap-2">
          {isActive && (
            <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
              <Check className="text-primary-foreground" size={14} />
            </View>
          )}
          
          {onRemove && !network.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onPress={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="border-error"
            >
              <Text className="text-error text-xs">Remove</Text>
            </Button>
          )}
        </View>
      </Pressable>
    </Card>
  );

  const AddNetworkSection = () => (
    <View className="p-4">
      <Text className="text-lg font-semibold text-foreground mb-4">Add Custom Network</Text>
      
      <Card className="p-4 mb-4">
        <Text className="text-foreground font-medium mb-2">Search Networks</Text>
        <Text className="text-muted-foreground text-sm mb-4">
          Search from Chainlist.org's database of EVM networks
        </Text>
        
        {loading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text className="text-muted-foreground text-sm mt-2">Loading network database...</Text>
          </View>
        ) : (
          <NetworkSearch
            onNetworkAdd={handleAddNetwork}
            existingNetworks={networks}
            chainlistData={chainlistNetworks}
          />
        )}
      </Card>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="p-4 pt-12 pb-6 border-b border-border">
        <View className="flex-row items-center justify-between">
          <Pressable 
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <ChevronLeft className="text-foreground mr-2" size={24} />
            <Text className="text-xl font-bold text-foreground">Network Manager</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Current Networks */}
        <View className="p-4">
          <Text className="text-lg font-semibold text-foreground mb-4">Available Networks</Text>
          
          {networks.map((network) => (
            <NetworkCard
              key={network.chainId}
              network={network}
              isActive={network.chainId === activeNetwork?.chainId}
              onPress={() => handleNetworkSelect(network)}
              onRemove={!network.isDefault ? () => handleRemoveNetwork(network.chainId, network.name) : undefined}
            />
          ))}
        </View>

        {/* Add New Network Section */}
        {!showAddNetwork ? (
          <View className="p-4">
            <Card className="p-4">
              <Pressable 
                onPress={() => setShowAddNetwork(true)}
                className="flex-row items-center justify-center"
              >
                <Plus className="text-primary mr-2" size={20} />
                <Text className="text-primary font-medium">Add a New Network</Text>
              </Pressable>
              <Text className="text-muted-foreground text-sm text-center mt-2">
                Custom network from Chainlist.org
              </Text>
            </Card>
          </View>
        ) : (
          <>
            <AddNetworkSection />
            
            <View className="p-4">
              <Button
                variant="outline"
                onPress={() => {
                  setShowAddNetwork(false);
                }}
                className="w-full"
              >
                <Text className="text-primary">Cancel</Text>
              </Button>
            </View>
          </>
        )}

        {/* Information */}
        <View className="p-4 pb-8">
          <Card className="p-4 border-muted">
            <Text className="text-foreground font-medium mb-2">About Networks</Text>
            <Text className="text-muted-foreground text-sm leading-5">
              • Networks determine which blockchain your wallet connects to{'\n'}
              • Each network has its own tokens and transaction fees{'\n'}
              • Default networks are pre-configured and verified{'\n'}
              • Custom networks are loaded from Chainlist.org
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}