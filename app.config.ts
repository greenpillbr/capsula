import type { ConfigContext, ExpoConfig } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Capsula Wallet",
  slug: "capsula",
  newArchEnabled: true,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "capsula",
  userInterfaceStyle: "automatic",
  runtimeVersion: {
    policy: "appVersion",
  },
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.capsula.wallet",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.capsula.wallet",
    edgeToEdgeEnabled: true,
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-sqlite",
    "expo-font",
    "expo-web-browser",
    "expo-secure-store",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
  ],
  // experiments: {
  //   typedRoutes: true,
  //   baseUrl: "/expo-local-first-template",
  // },
  extra: {
    eas: {
      projectId: "bf0f5b96-60cf-40df-9f9f-b017d492f985",
    },
  },
  owner: "greenpillbr",
});
