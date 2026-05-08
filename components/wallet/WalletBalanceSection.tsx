import { Text } from "@/components/ui/text";
import type { Network, Token, Wallet } from "@/db/schema";
import { View } from "react-native";

interface WalletBalanceSectionProps {
  isLoadingBalance: boolean;
  activeNetwork: Network | null;
  lastBalanceUpdate: number | null;
  activeWallet: Wallet | null;
  walletTokens: Token[];
  balances: Record<string, string>;
}

export function WalletBalanceSection({
  isLoadingBalance,
  activeNetwork,
  lastBalanceUpdate,
  activeWallet,
  walletTokens,
  balances,
}: WalletBalanceSectionProps) {
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
