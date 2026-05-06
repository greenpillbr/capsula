# Mini-App SDK Examples

This guide shows the exact steps to add a new built-in mini-app in this codebase.

## Step-by-Step: Create a New Mini-App

## Step 1: Add the mini-app entry in `lib/stores/miniAppStore.ts`

This registers your mini-app metadata in `BUILT_IN_MINI_APPS`, so it appears as installed and can be filtered by network.

```ts
{
  id: "my-feature-module",
  title: "My Feature",
  description: "Describe what this mini-app does",
  iconUrl: "",
  version: "1.0.0",
  categories: '["Tools"]',
  supportedNetworks: "[1, 42220, 100]",
  recommendedByCommunities: '["greenpill-br"]',
  isInstalled: true,
  isBuiltIn: true,
  installationOrder: 10,
  manifestData: JSON.stringify({
    type: "built-in",
    module: "my-feature",
    entryPoint: "MyFeatureModule",
    permissions: [],
  }),
  lastUpdated: new Date().toISOString(),
}
```

## Step 2: Register the component in `lib/mini-apps/host/MiniAppHost.tsx`

This allows the host runtime to resolve and render your mini-app when opened.

```ts
import MyFeatureModule from "../modules/my-feature/MyFeatureModule";

const BUILT_IN_MODULES: Record<
  string,
  { default: React.ComponentType<MiniAppProps> }
> = {
  "tokens-module": { default: TokensModule },
  "gardens-module": { default: GardensModule },
  "attendance-module": { default: AttendanceModule },
  "my-feature-module": { default: MyFeatureModule },
};
```

## Step 3: Create the module file in `lib/mini-apps/modules/<name>/`

Create your module component and implement `MiniAppProps`.

```ts
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import React from "react";
import { View } from "react-native";
import type { MiniAppProps } from "../../sdk/types";

export default function MyFeatureModule({ onClose }: MiniAppProps) {
  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between p-4 pt-12 border-b border-border">
        <Text className="text-xl font-semibold text-foreground">My Feature</Text>
        <Button variant="outline" size="sm" onPress={onClose}>
          <Text className="text-foreground">Close</Text>
        </Button>
      </View>

      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-2xl font-bold text-foreground text-center mb-2">
          Coming Soon
        </Text>
      </View>
    </View>
  );
}
```

## Step 4 (Optional): Add icon support in `components/mini-apps/MiniAppIcon.tsx`

If you want a custom icon in Home and Mini-Apps lists, map the mini-app id to a bundled asset.

```ts
const BUILT_IN_MINI_APP_ICONS: Record<string, number> = {
  "gardens-module": require("@/assets/images/gardens-logo.avif"),
  "attendance-module": require("@/assets/images/attendance.png"),
  "my-feature-module": require("@/assets/images/my-feature.png"),
};
```

If no icon exists, the UI automatically falls back to the first letter of the title.

## Step 5: Use SDK APIs inside your module (optional)

### Read contract data

```ts
const [name, symbol] = await Promise.all([
  sdk.network.readContract({
    contractAddress,
    abi,
    functionName: "name",
    args: [],
  }),
  sdk.network.readContract({
    contractAddress,
    abi,
    functionName: "symbol",
    args: [],
  }),
]);
```

### Sign and send transactions

```ts
const transaction = await sdk.wallet.prepareTransaction({
  to,
  value: "0",
  data,
});

const signedTx = await sdk.wallet.signTransaction(transaction);
const txHash = await sdk.wallet.sendTransaction(signedTx);
```

### UI feedback

```ts
try {
  await doSomething();
  sdk.ui.showToast("Success", "success");
} catch {
  sdk.ui.showToast("Something went wrong", "error");
}
```

## Common APIs by Category

- Wallet: `getActiveWallet()`, `getWalletAddress()`, `getBalance()`, `prepareTransaction()`, `signTransaction()`, `sendTransaction()`
- Network: `getActiveNetwork()`, `readContract()`, `callContract()`, `switchNetwork()`
- UI: `showToast()`, `navigate()`, `showModal()`, `showLoading()`
- Storage: `getItem()`, `setItem()`, `removeItem()`, `getSessionItem()`
- Events: `onWalletChange()`, `onNetworkChange()`, `emit()`, `on()`
