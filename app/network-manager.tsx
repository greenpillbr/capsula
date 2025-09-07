import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Check, ChevronLeft, Globe, Plus } from '@/lib/icons';
import { useNetworkStore } from '@/lib/stores/networkStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, TextInput, View } from 'react-native';

interface ChainlistNetwork {
  name: string;
  chainId: number;
  rpc: string[];
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
  const [searchQuery, setSearchQuery] = useState('');
  const [chainlistNetworks, setChainlistNetworks] = useState<ChainlistNetwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredNetworks, setFilteredNetworks] = useState<ChainlistNetwork[]>([]);

  // Fetch chainlist data when adding network
  const fetchChainlistData = async () => {
    if (chainlistNetworks.length > 0) return; // Already loaded

    setLoading(true);
    try {
      const response = await fetch('https://chainlist.org/rpcs.json');
      const data = await response.json();
      
      // Filter out networks with empty RPC arrays and sort by popularity
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

  // Filter networks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNetworks([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = chainlistNetworks
      .filter(network => 
        network.name.toLowerCase().includes(query) ||
        network.nativeCurrency.symbol.toLowerCase().includes(query) ||
        network.chainId.toString().includes(query)
      )
      .slice(0, 10); // Limit to 10 results for performance

    setFilteredNetworks(filtered);
  }, [searchQuery, chainlistNetworks]);

  const handleNetworkSelect = async (network: any) => {
    try {
      setActiveNetwork(network);
      Alert.alert('Success', `Switched to ${network.name}`);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to switch network');
    }
  };

  const handleAddNetwork = async (chainlistNetwork: ChainlistNetwork) => {
    try {
      // Find a working RPC URL
      const workingRpc = chainlistNetwork.rpc.find(rpc => 
        !rpc.includes('${') && 
        (rpc.startsWith('https://') || rpc.startsWith('http://'))
      );

      if (!workingRpc) {
        Alert.alert('Error', 'No working RPC URL found for this network');
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

      addCustomNetwork(newNetwork);
      Alert.alert('Success', `Added ${chainlistNetwork.name} to your networks`);
      setShowAddNetwork(false);
      setSearchQuery('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add network');
    }
  };

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
              Alert.alert('Success', `Removed ${networkName}`);
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
        
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Type network name (e.g., Polygon, Arbitrum)"
          className="border border-border rounded-lg p-3 mb-4 text-foreground"
          onFocus={fetchChainlistData}
        />
        
        {loading && (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text className="text-muted-foreground text-sm mt-2">Loading networks...</Text>
          </View>
        )}
        
        {filteredNetworks.length > 0 && (
          <View>
            <Text className="text-foreground font-medium mb-2">Search Results</Text>
            {filteredNetworks.map((network) => {
              const isAlreadyAdded = networks.some(n => n.chainId === network.chainId);
              
              return (
                <Card key={network.chainId} className="mb-2">
                  <View className="p-3 flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-foreground font-medium">{network.name}</Text>
                      <Text className="text-muted-foreground text-sm">
                        {network.nativeCurrency.symbol} • Chain ID: {network.chainId}
                      </Text>
                    </View>
                    
                    {isAlreadyAdded ? (
                      <Text className="text-muted-foreground text-sm">Added</Text>
                    ) : (
                      <Button
                        size="sm"
                        onPress={() => handleAddNetwork(network)}
                        className="bg-primary"
                      >
                        <Text className="text-primary-foreground text-xs">Add</Text>
                      </Button>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
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
                  setSearchQuery('');
                  setFilteredNetworks([]);
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