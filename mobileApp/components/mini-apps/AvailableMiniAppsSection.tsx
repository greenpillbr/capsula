import { MiniAppIcon } from '@/components/mini-apps/MiniAppIcon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { MiniApp } from '@/db/schema';
import React, { useMemo } from 'react';
import { View } from 'react-native';

type AvailableMiniApp = {
  id: string;
  title: string;
  description: string;
  category: string;
  iconUrl: string;
  supportedNetworks: number[];
};

const MOCK_AVAILABLE_MINI_APPS: AvailableMiniApp[] = [
  {
    id: 'greenpay',
    title: 'GreenPay',
    description: 'Simplify your crypto payments with seamless transactions for everyday purchases and bills.',
    category: 'Payments',
    iconUrl: '',
    supportedNetworks: [1, 42220, 100, 137],
  },
  {
    id: 'ecodao-voting',
    title: 'EcoDAO Voting',
    description: 'Participate in governance decisions for eco-friendly blockchain projects and initiatives.',
    category: 'Governance',
    iconUrl: '',
    supportedNetworks: [1, 42220],
  },
  {
    id: 'carbon-offset',
    title: 'Carbon Offset',
    description: 'Track and offset your carbon footprint directly from your wallet with certified credits.',
    category: 'Sustainability',
    iconUrl: '',
    supportedNetworks: [137, 100],
  },
  {
    id: 'yield-farm-lite',
    title: 'Yield Farm Lite',
    description: 'Explore simplified DeFi farming opportunities to earn passive income on your assets.',
    category: 'DeFi',
    iconUrl: '',
    supportedNetworks: [1, 137],
  },
  {
    id: 'market-data-live',
    title: 'Market Data Live',
    description: 'Get real-time price updates and market insights for your favorite crypto assets.',
    category: 'Data Tools',
    iconUrl: '',
    supportedNetworks: [1, 42220, 100, 137],
  },
  {
    id: 'nft-showcase',
    title: 'NFT Showcase',
    description: 'Display your digital art collection and share your NFTs with the community.',
    category: 'Collectibles',
    iconUrl: '',
    supportedNetworks: [1, 137],
  },
];

type AvailableMiniAppsSectionProps = {
  installedApps: MiniApp[];
  currentNetworkId: number;
  searchQuery: string;
  onInstallMiniApp: (miniAppId: string, miniAppTitle: string) => void;
  onExploreCommunities: () => void;
};

export function AvailableMiniAppsSection({
  installedApps,
  currentNetworkId,
  searchQuery,
  onInstallMiniApp,
  onExploreCommunities,
}: AvailableMiniAppsSectionProps) {
  const availableApps = useMemo(
    () =>
      MOCK_AVAILABLE_MINI_APPS.filter((app) => app.supportedNetworks.includes(currentNetworkId))
        .filter((app) => !installedApps.some((installed) => installed.id === app.id))
        .filter((app) => {
          const normalizedQuery = searchQuery.trim().toLowerCase();
          if (!normalizedQuery) {
            return true;
          }

          return (
            app.title.toLowerCase().includes(normalizedQuery) ||
            app.category.toLowerCase().includes(normalizedQuery) ||
            app.description.toLowerCase().includes(normalizedQuery)
          );
        }),
    [currentNetworkId, installedApps, searchQuery],
  );

  return (
    <>
      {availableApps.length > 0 && (
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Available to Install</Text>

          {availableApps.map((app) => (
            <Card key={app.id} className="mb-4">
              <View className="p-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <MiniAppIcon
                      miniAppId={app.id}
                      miniAppTitle={app.title}
                      containerClassName="w-12 h-12 bg-primary/10 rounded-lg items-center justify-center mr-3 overflow-hidden"
                      imageClassName="w-12 h-12"
                      fallbackTextClassName="text-primary text-lg font-bold"
                    />

                    <View className="flex-1">
                      <Text className="text-foreground font-semibold text-lg">{app.title}</Text>
                      <Text className="text-primary text-sm">{app.category}</Text>
                    </View>
                  </View>

                  <Button size="sm" onPress={() => onInstallMiniApp(app.id, app.title)} className="bg-primary">
                    <Text className="text-primary-foreground text-xs">Install</Text>
                  </Button>
                </View>

                <Text className="text-muted-foreground text-sm leading-5">{app.description}</Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      <View className="px-4 mb-6">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <Text className="text-foreground font-semibold mb-2">Discover Communities</Text>
          <Text className="text-muted-foreground text-sm mb-3">
            Join communities to get curated mini-app recommendations and exclusive features.
          </Text>
          <Button variant="outline" onPress={onExploreCommunities} className="self-start">
            <Text className="text-primary text-sm">Explore Communities</Text>
          </Button>
        </Card>
      </View>
    </>
  );
}
