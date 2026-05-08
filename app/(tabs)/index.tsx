import {
  WalletActionButtons,
  WalletBalanceSection,
  WalletEmptyState,
  WalletHeader,
  WalletMiniAppsSection,
  WalletNetworkAddress,
  WalletRecentActivity,
  WalletTokenList,
} from "@/components/wallet";
import { useMiniAppStore } from "@/lib/stores/miniAppStore";
import { useNetworkStore } from "@/lib/stores/networkStore";
import { useWalletStore } from "@/lib/stores/walletStore";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView } from "react-native";

export default function WalletHomeScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    activeWallet,
    balances,
    getTokensForActiveWallet,
    refreshBalances,
    isLoadingBalance,
    lastBalanceUpdate,
    wallets,
  } = useWalletStore();

  const { activeNetwork } = useNetworkStore();

  // Guard: Redirect to onboarding if no wallets exist (first-time user)
  useEffect(() => {
    if (wallets.length === 0) {
      router.replace("/onboarding");
    }
  }, [wallets.length, router]);

  const {
    initializeBuiltInMiniApps,
    launchMiniApp,
    availableMiniAppsForNetwork,
    refreshAvailableMiniApps,
  } = useMiniAppStore();

  // Initialize mini-apps on mount
  useEffect(() => {
    initializeBuiltInMiniApps();
  }, []);

  // Handle wallet and network changes (balance monitoring is owned by root layout)
  useEffect(() => {
    if (activeWallet && activeNetwork) {
      loadWalletData();
      refreshAvailableMiniApps(activeNetwork.chainId);
    }
  }, [activeWallet, activeNetwork]);

  const loadWalletData = async () => {
    if (!activeWallet || !activeNetwork) return;

    try {
      // Trigger balance refresh which will update the store (force update on initial load)
      await refreshBalances(true);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // refreshBalances(true) already triggers forceBalanceUpdate via wallet store
      await refreshBalances(true);
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSend = () => {
    router.push("send" as any);
  };

  const handleReceive = () => {
    router.push("receive" as any);
  };

  const handleNetworkSwitch = () => {
    router.push("/network-manager" as any);
  };

  const handleNotifications = () => {
    Alert.alert(
      "Notifications",
      "Notifications feature will be available in the next update.",
      [{ text: "OK" }],
    );
  };

  const handleCopyAddress = async () => {
    if (!activeWallet?.address) {
      Alert.alert("Error", "No wallet address available");
      return;
    }

    try {
      await Clipboard.setStringAsync(activeWallet.address);
    } catch (error) {
      console.error("Failed to copy address:", error);
      Alert.alert("Error", "Failed to copy address");
    }
  };

  const handleCreateWallet = () => {
    router.push("/onboarding");
  };

  const handleLaunchMiniApp = async (miniAppId: string) => {
    try {
      const success = await launchMiniApp(miniAppId);
      if (success) {
        router.push(`mini-app/${miniAppId}` as any);
      } else {
        console.error("Failed to launch mini-app:", miniAppId);
      }
    } catch (error) {
      console.error("Error launching mini-app:", error);
    }
  };

  const walletTokens = getTokensForActiveWallet();
  const walletTransactions = useWalletStore
    .getState()
    .getTransactionsForActiveWallet();

  // Calculate display balance from tokens
  const getNativeTokenBalance = () => {
    if (!activeWallet || !activeNetwork) return "0.0";

    const nativeToken = walletTokens.find(
      (t) => t.chainId === activeNetwork.chainId && t.type === "Native",
    );

    if (nativeToken && balances[nativeToken.id]) {
      return balances[nativeToken.id];
    }

    return "0.0";
  };

  const balance = getNativeTokenBalance();
  const balanceUSD = `$${(parseFloat(balance) * 2500).toFixed(2)}`; // ETH price placeholder

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <WalletHeader onPressNotifications={handleNotifications} />

      <WalletNetworkAddress
        activeNetwork={activeNetwork}
        activeWallet={activeWallet}
        onPressNetworkSwitch={handleNetworkSwitch}
        onPressCopyAddress={handleCopyAddress}
      />

      <WalletBalanceSection
        balance={balance}
        isLoadingBalance={isLoadingBalance}
        activeNetwork={activeNetwork}
        balanceUSD={balanceUSD}
        lastBalanceUpdate={lastBalanceUpdate}
      />

      <WalletActionButtons
        onPressSend={handleSend}
        onPressReceive={handleReceive}
        isSendDisabled={!activeWallet || isLoadingBalance}
        isReceiveDisabled={!activeWallet}
      />

      <WalletTokenList walletTokens={walletTokens} balances={balances} />

      <WalletMiniAppsSection
        miniApps={availableMiniAppsForNetwork}
        activeNetwork={activeNetwork}
        onLaunchMiniApp={handleLaunchMiniApp}
      />

      <WalletRecentActivity
        walletTransactions={walletTransactions}
        activeNetwork={activeNetwork}
        onPressViewAll={() => router.push("/(tabs)/activity")}
      />

      {!activeWallet && <WalletEmptyState onPressCreateWallet={handleCreateWallet} />}
    </ScrollView>
  );
}
