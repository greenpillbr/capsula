import { Text } from "@/components/ui/text";
import { Copy } from "@/lib/icons/Copy";
import { Globe } from "@/lib/icons/Globe";
import type { Network, Wallet } from "@/db/schema";
import { Image, Pressable, View } from "react-native";

interface WalletNetworkAddressProps {
  activeNetwork: Network | null;
  activeWallet: Wallet | null;
  onPressNetworkSwitch: () => void;
  onPressCopyAddress: () => void;
}

const formatAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export function WalletNetworkAddress({
  activeNetwork,
  activeWallet,
  onPressNetworkSwitch,
  onPressCopyAddress,
}: WalletNetworkAddressProps) {
  return (
    <View className="px-4 mb-4">
      <Pressable
        onPress={onPressNetworkSwitch}
        className="flex-row items-center justify-between mb-2 bg-muted/50 rounded-lg px-3 py-2 border border-border"
      >
        <View className="flex-row items-center">
          <View className="w-5 h-5 rounded-full overflow-hidden mr-3 items-center justify-center bg-background">
            {activeNetwork?.iconUrl ? (
              <Image
                source={{ uri: activeNetwork.iconUrl }}
                style={{ width: 20, height: 20, borderRadius: 10 }}
                onError={() => console.log("Failed to load network icon")}
              />
            ) : (
              <Globe className="text-muted-foreground" size={18} />
            )}
          </View>
          <View>
            <Text className="text-sm text-muted-foreground">Network</Text>
            <Text className="text-base font-medium text-foreground">
              {activeNetwork?.name || "No Network"}
            </Text>
          </View>
        </View>
        <View className="w-6 h-6 items-center justify-center">
          <Text className="text-muted-foreground text-lg">▼</Text>
        </View>
      </Pressable>

      <Pressable onPress={onPressCopyAddress} className="flex-row items-center">
        <Text className="text-base font-medium text-foreground mr-2">
          {activeWallet ? formatAddress(activeWallet.address) : "No Wallet"}
        </Text>
        {activeWallet && (
          <View className="w-4 h-4 items-center justify-center">
            <Copy className="text-muted-foreground" size={18} />
          </View>
        )}
      </Pressable>
    </View>
  );
}
