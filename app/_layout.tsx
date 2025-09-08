import { PortalHost } from "@/components/primitives/portal";
import { DatabaseProvider } from "@/db/provider";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { DARK_THEME, LIGHT_THEME } from "@/lib/constants";
import { balanceMonitorService } from "@/lib/services/balanceMonitorService";
import { getItem, setItem } from "@/lib/storage";
import { useAuthStore } from "@/lib/stores/authStore";
import { useNetworkStore } from "@/lib/stores/networkStore";
import { useWalletStore } from "@/lib/stores/walletStore";
import { useColorScheme } from "@/lib/useColorScheme";
import { Inter_400Regular, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./global.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useFrameworkReady();

  // Initialize stores and monitoring service
  const { activeWallet } = useWalletStore();
  const { activeNetwork } = useNetworkStore();
  const { isAuthenticated, logout } = useAuthStore();

  // Force logout on app start to require fresh authentication
  useEffect(() => {
    console.log('🔒 Clearing authentication on app startup');
    logout();
  }, []);

  useEffect(() => {
    const theme = getItem("theme");
    if (!theme) {
      setAndroidNavigationBar(colorScheme);
      setItem("theme", colorScheme);
      return;
    }
    const colorTheme = theme === "dark" ? "dark" : "light";
    setAndroidNavigationBar(colorTheme);
    if (colorTheme !== colorScheme) {
      setColorScheme(colorTheme);
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Initialize balance monitoring when wallet and network are available
  useEffect(() => {
    if (isAuthenticated && activeWallet && activeNetwork) {
      console.log('🚀 Initializing balance monitoring service');
      balanceMonitorService.startMonitoring();
    } else {
      balanceMonitorService.stopMonitoring();
    }

    // Cleanup on unmount
    return () => {
      balanceMonitorService.stopMonitoring();
    };
  }, [isAuthenticated, activeWallet, activeNetwork]);

  // Handle app state changes for monitoring
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isAuthenticated && activeWallet && activeNetwork) {
        // Restart monitoring when app becomes active
        console.log('📱 App became active - ensuring monitoring is running');
        if (!balanceMonitorService.isMonitoringActive()) {
          balanceMonitorService.startMonitoring();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isAuthenticated, activeWallet, activeNetwork]);

  if (!loaded) {
    return null;
  }

  return (
    <DatabaseProvider>
      <ThemeProvider value={colorScheme === "dark" ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ title: "Capsula", headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="send" options={{ headerShown: false }} />
              <Stack.Screen name="receive" options={{ headerShown: false }} />
              <Stack.Screen name="mini-app/[id]" options={{ headerShown: false }} />
            </Stack>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
      <PortalHost />
    </DatabaseProvider>
  );
}
