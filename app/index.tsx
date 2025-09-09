import { useWalletStore } from "@/lib/stores";
import { useAuthStore } from "@/lib/stores/authStore";
import { useNetworkStore } from "@/lib/stores/networkStore";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [isReady, setIsReady] = useState(false);
  const { isOnboardingComplete, isAuthenticated } = useAuthStore();
  const { wallets } = useWalletStore();
  const { initializeDefaultNetworks } = useNetworkStore();

  useEffect(() => {
    // Initialize networks on app start
    initializeDefaultNetworks();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null; // Keep splash screen visible
  }

  // Route based on onboarding and authentication status
  if (wallets.length === 0) {
    return <Redirect href="/onboarding" />;
  }
  
  if (!isOnboardingComplete && wallets.length > 0) {
    useAuthStore.getState().setOnboardingComplete(true);
  }
  
  if (!isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}