import { AboutMiniAppsSection } from '@/components/mini-apps/AboutMiniAppsSection';
import { AvailableMiniAppsSection } from '@/components/mini-apps/AvailableMiniAppsSection';
import { InstalledMiniAppsSection } from '@/components/mini-apps/InstalledMiniAppsSection';
import { MiniAppsHeader } from '@/components/mini-apps/MiniAppsHeader';
import { useMiniAppStore } from '@/lib/stores/miniAppStore';
import { useNetworkStore } from '@/lib/stores/networkStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export default function MiniAppsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    getMiniAppsForNetwork,
    launchMiniApp,
    uninstallMiniApp,
    initializeBuiltInMiniApps,
  } = useMiniAppStore();

  const { activeNetwork, networks } = useNetworkStore();

  // Initialize mini-apps on mount
  useEffect(() => {
    initializeBuiltInMiniApps();
  }, []);

  const currentNetworkId = activeNetwork?.chainId || 1;
  const currentNetwork = networks.find(n => n.chainId === currentNetworkId) || activeNetwork;

  // Get installed mini-apps for current network
  const installedAppsForNetwork = getMiniAppsForNetwork(currentNetworkId);

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

  const handleInstallMiniApp = async (_appId: string, appTitle: string) => {
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

  return (
    <View className="flex-1 bg-background">
      <MiniAppsHeader
        currentNetworkName={currentNetwork?.name || 'Select Network'}
        onPressNetwork={() => router.push('/network-manager' as any)}
      />

      <ScrollView className="flex-1">
        <InstalledMiniAppsSection
          installedApps={installedAppsForNetwork}
          searchQuery={searchQuery}
          onChangeSearch={setSearchQuery}
          onLaunchMiniApp={handleLaunchMiniApp}
          onUninstallMiniApp={handleUninstallMiniApp}
        />

        <AvailableMiniAppsSection
          installedApps={installedAppsForNetwork}
          currentNetworkId={currentNetworkId}
          searchQuery={searchQuery}
          onInstallMiniApp={handleInstallMiniApp}
          onExploreCommunities={() =>
            Alert.alert('Coming Soon', 'Community features will be available in the next update.')
          }
        />

        <AboutMiniAppsSection />
      </ScrollView>
    </View>
  );
}