import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import type { Token } from "@/db/schema";
import { View } from "react-native";

interface WalletTokenListProps {
  walletTokens: Token[];
  balances: Record<string, string>;
}

export function WalletTokenList({
  walletTokens,
  balances,
}: WalletTokenListProps) {
  if (walletTokens.length === 0) {
    return null;
  }

  return (
    <View className="px-4 mb-6">
      <Text className="text-lg font-semibold text-foreground mb-4">Tokens</Text>
      {walletTokens.map((token) => {
        const currentBalance = balances[token.id] || "0.0";

        return (
          <Card key={token.id} className="p-4 mb-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-foreground font-medium">
                  {token.symbol}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {token.name}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-foreground font-medium">
                  {parseFloat(currentBalance).toFixed(6)} {token.symbol}
                </Text>
                {/* <Text className="text-muted-foreground text-sm">
                  ${(parseFloat(currentBalance) * 100).toFixed(2)}
                </Text> */}
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );
}
