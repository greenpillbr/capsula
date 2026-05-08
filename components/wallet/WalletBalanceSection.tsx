import { Text } from "@/components/ui/text";
import type { Network } from "@/db/schema";
import { View } from "react-native";

interface WalletBalanceSectionProps {
  balance: string;
  isLoadingBalance: boolean;
  activeNetwork: Network | null;
  balanceUSD: string;
  lastBalanceUpdate: number | null;
}

export function WalletBalanceSection({
  balance,
  isLoadingBalance,
  activeNetwork,
  balanceUSD,
  lastBalanceUpdate,
}: WalletBalanceSectionProps) {
  return (
    <View className="px-4 mb-8">
      <Text className="text-4xl font-bold text-primary mb-2">
        {isLoadingBalance
          ? "..."
          : `${parseFloat(balance).toFixed(6)} ${activeNetwork?.nativeCurrencySymbol || "ETH"}`}
      </Text>
      <Text className="text-lg text-muted-foreground">{balanceUSD}</Text>
      {lastBalanceUpdate && (
        <Text className="text-xs text-muted-foreground">
          Updated {new Date(lastBalanceUpdate).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
}
