import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Globe } from '@/lib/icons';
import { useMiniAppStore } from '@/lib/stores/miniAppStore';
import { useNetworkStore } from '@/lib/stores/networkStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

// Mock additional mini-apps for demonstration (these would come from API in full version)
const MOCK_AVAILABLE_MINI_APPS = [
  {
    id: 'greenpay',
    title: 'GreenPay',
    description: 'Simplify your crypto payments with seamless transactions for everyday purchases and bills.',
    category: 'Payments',
    iconUrl: '',
    supportedNetworks: [1, 42220, 100, 137], // Ethereum, CELO, Gnosis, Polygon
    isInstalled: false,
    isBuiltIn: false,
  },
  {
    id: 'ecodao-voting',
    title: 'EcoDAO Voting',
    description: 'Participate in governance decisions for eco-friendly blockchain projects and initiatives.',
    category: 'Governance',
    iconUrl: '',
    supportedNetworks: [1, 42220], // Ethereum, CELO
    isInstalled: false,
    isBuiltIn: false,
  },
  {
    id: 'carbon-offset',
    title: 'Carbon Offset',
    description: 'Track and offset your carbon footprint directly from your wallet with certified credits.',
    category: 'Sustainability',
    iconUrl: '',
    supportedNetworks: [137, 100], // Polygon, Gnosis
    isInstalled: false,
    isBuiltIn: false,
  },
  {
    id: 'yield-farm-lite',
    title: 'Yield Farm Lite',
    description: 'Explore simplified DeFi farming opportunities to earn passive income on your assets.',
    category: 'DeFi',
    iconUrl: '',
    supportedNetworks: [1, 137], // Ethereum, Polygon
    isInstalled: false,
    isBuiltIn: false,
  },
  {
    id: 'market-data-live',
    title: 'Market Data Live',
    description: 'Get real-time price updates and market insights for your favorite crypto assets.',
    category: 'Data Tools',
    iconUrl: '',
    supportedNetworks: [1, 42220, 100, 137], // All networks
    isInstalled: false,
    isBuiltIn: false,
  },
  {
    id: 'nft-showcase',
    title: 'NFT Showcase',
    description: 'Display your digital art collection and share your NFTs with the community.',
    category: 'Collectibles',
    iconUrl: '',
    supportedNetworks: [1, 137], // Ethereum, Polygon
    isInstalled: false,
    isBuiltIn: false,
  },
];

export default function MiniAppsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<number | null>(null);
  
  const {
    installedMiniApps,
    getMiniAppsForNetwork,
    launchMiniApp,
    installMiniApp,
    uninstallMiniApp,
    isInstalling,
    initializeBuiltInMiniApps,
  } = useMiniAppStore();
  
  const { activeNetwork, networks } = useNetworkStore();

  // Initialize mini-apps on mount
  useEffect(() => {
    initializeBuiltInMiniApps();
  }, []);

  // Use selected network or active network
  const currentNetworkId = selectedNetwork || activeNetwork?.chainId || 1;
  const currentNetwork = networks.find(n => n.chainId === currentNetworkId) || activeNetwork;

  // Get installed mini-apps for current network
  const installedAppsForNetwork = getMiniAppsForNetwork(currentNetworkId);

  // Filter mock available apps by network and search
  const availableApps = MOCK_AVAILABLE_MINI_APPS
    .filter(app => app.supportedNetworks.includes(currentNetworkId))
    .filter(app => !installedAppsForNetwork.some(installed => installed.id === app.id))
    .filter(app => 
      searchQuery.trim() === '' || 
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Filter installed apps by search
  const filteredInstalledApps = installedAppsForNetwork.filter(app =>
    searchQuery.trim() === '' ||
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (JSON.parse(app.categories || '[]') as string[]).some(cat => 
      cat.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLaunchMiniApp = async (miniAppId: string) => {
    try {
      const success = await launchMiniApp(miniAppId);
      if (success) {
        router.push(`/mini-app/${miniAppId}` as any);
      } else {
        Alert.alert('Error', 'Failed to launch mini-app');
      }
    } catch (error) {
      console.error('Error launching mini-app:', error);
      Alert.alert('Error', 'Failed to launch mini-app');
    }
  };

  const handleInstallMiniApp = async (appId: string, appTitle: string) => {
    try {
      // For demo purposes, just show success message
      Alert.alert('Coming Soon', `${appTitle} installation will be available in the next update.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to install mini-app');
    }
  };

  const handleUninstallMiniApp = async (appId: string, appTitle: string) => {
    if (installedAppsForNetwork.find(app => app.id === appId)?.isBuiltIn) {
      Alert.alert('Cannot Uninstall', 'Built-in mini-apps cannot be removed.');
      return;
    }

    Alert.alert(
      'Uninstall Mini-App',
      `Are you sure you want to remove ${appTitle}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Uninstall',
          style: 'destructive',
          onPress: async () => {
            try {
              await uninstallMiniApp(appId);
              Alert.alert('Success', `${appTitle} has been removed.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to uninstall mini-app');
            }
          },
        },
      ]
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'DeFi': 'bg-blue-100 text-blue-800',
      'Tools': 'bg-gray-100 text-gray-800',
      'Developer': 'bg-purple-100 text-purple-800',
      'Payments': 'bg-green-100 text-green-800',
      'Governance': 'bg-orange-100 text-orange-800',
      'Sustainability': 'bg-emerald-100 text-emerald-800',
      'Data Tools': 'bg-indigo-100 text-indigo-800',
      'Collectibles': 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const MiniAppCard = ({ 
    app, 
    isInstalled, 
    onPress, 
    onInstall, 
    onUninstall 
  }: {
    app: any;
    isInstalled: boolean;
    onPress?: () => void;
    onInstall?: () => void;
    onUninstall?: () => void;
  }) => (
    <Card className="mb-4">
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-primary/10 rounded-lg items-center justify-center mr-3">
              <Text className="text-primary text-lg font-bold">
                {app.title[0]}
              </Text>
            </View>
            
            <View className="flex-1">
              <Text className="text-foreground font-semibold text-lg">{app.title}</Text>
              <Text className="text-primary text-sm">{app.category}</Text>
            </View>
          </View>
          
          {isInstalled ? (
            <View className="flex-row gap-2">
              <Button
                size="sm"
                onPress={onPress}
                className="bg-primary"
              >
                <Text className="text-primary-foreground text-xs">Open</Text>
              </Button>
              {!app.isBuiltIn && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={onUninstall}
                  className="border-error"
                >
                  <Text className="text-error text-xs">Remove</Text>
                </Button>
              )}
            </View>
          ) : (
            <Button
              size="sm"
              onPress={onInstall}
              className="bg-primary"
              disabled={isInstalling}
            >
              <Text className="text-primary-foreground text-xs">Install</Text>
            </Button>
          )}
        </View>
        
        <Text className="text-muted-foreground text-sm leading-5 mb-3">
          {app.description}
        </Text>
        
        {app.isBuiltIn && (
          <Badge variant="secondary" className="self-start">
            <Text className="text-xs">Built-in</Text>
          </Badge>
        )}
      </View>
    </Card>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="p-4 pt-12 pb-6 border-b border-border">
        <Text className="text-xl font-bold text-foreground text-center">Mini-apps</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Search Bar */}
        <View className="p-4">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search mini-apps..."
            className="border border-border rounded-lg p-3 text-foreground bg-background"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Network Filter */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">Showing apps for:</Text>
            <Pressable 
              onPress={() => router.push('/network-manager' as any)}
              className="flex-row items-center"
            >
              <Globe className="text-primary mr-1" size={14} />
              <Text className="text-primary text-sm font-medium">
                {currentNetwork?.name || 'Select Network'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Installed Mini-Apps */}
        {filteredInstalledApps.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">Installed</Text>
            
            {filteredInstalledApps.map((app) => (
              <MiniAppCard
                key={app.id}
                app={{
                  ...app,
                  category: (JSON.parse(app.categories || '[]') as string[])[0] || 'Tools',
                }}
                isInstalled={true}
                onPress={() => handleLaunchMiniApp(app.id)}
                onUninstall={() => handleUninstallMiniApp(app.id, app.title)}
              />
            ))}
          </View>
        )}

        {/* Available Mini-Apps */}
        {availableApps.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">Available to Install</Text>
            
            {availableApps.map((app) => (
              <MiniAppCard
                key={app.id}
                app={app}
                isInstalled={false}
                onInstall={() => handleInstallMiniApp(app.id, app.title)}
              />
            ))}
          </View>
        )}

        {/* Communities Banner */}
        <View className="px-4 mb-6">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <Text className="text-foreground font-semibold mb-2">Discover Communities</Text>
            <Text className="text-muted-foreground text-sm mb-3">
              Join communities to get curated mini-app recommendations and exclusive features.
            </Text>
            <Button
              variant="outline"
              onPress={() => Alert.alert('Coming Soon', 'Community features will be available in the next update.')}
              className="self-start"
            >
              <Text className="text-primary text-sm">Explore Communities</Text>
            </Button>
          </Card>
        </View>

        {/* Empty State */}
        {filteredInstalledApps.length === 0 && availableApps.length === 0 && (
          <View className="px-4 py-8 items-center">
            <Text className="text-center text-muted-foreground mb-4">
              {searchQuery 
                ? `No mini-apps found for "${searchQuery}"`
                : `No mini-apps available for ${currentNetwork?.name || 'this network'}`
              }
            </Text>
            {searchQuery && (
              <Button
                variant="outline"
                onPress={() => setSearchQuery('')}
              >
                <Text className="text-primary">Clear Search</Text>
              </Button>
            )}
          </View>
        )}

        {/* Information */}
        <View className="p-4 pb-8">
          <Card className="p-4 border-muted">
            <Text className="text-foreground font-medium mb-2">About Mini-Apps</Text>
            <Text className="text-muted-foreground text-sm leading-5">
              • Mini-apps extend your wallet with new functionality{'\n'}
              • Each mini-app is designed for specific networks{'\n'}
              • Built-in apps are pre-installed and verified{'\n'}
              • Community apps are curated for safety and quality
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}