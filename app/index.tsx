import { useAuthStore } from "@/lib/stores/authStore";
import { useNetworkStore } from "@/lib/stores/networkStore";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [isReady, setIsReady] = useState(false);
  const { isOnboardingComplete, isAuthenticated } = useAuthStore();
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
  if (!isOnboardingComplete) {
    // First-time user - go to onboarding
    return <Redirect href="/onboarding" />;
  }
  
  if (!isAuthenticated) {
    // Returning user who needs to unlock - go to onboarding (which handles unlock)
    return <Redirect href="/onboarding" />;
  }

  // User is onboarded and authenticated - go to main app
  return <Redirect href="/(tabs)" />;
}