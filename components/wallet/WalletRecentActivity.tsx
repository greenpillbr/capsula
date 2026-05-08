import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import type { Network, Transaction } from "@/db/schema";
import { Pressable, View } from "react-native";

interface WalletRecentActivityProps {
  walletTransactions: Transaction[];
  activeNetwork: Network | null;
  onPressViewAll: () => void;
}

export function WalletRecentActivity({
  walletTransactions,
  activeNetwork,
  onPressViewAll,
}: WalletRecentActivityProps) {
  return (
    <View className="px-4 mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-foreground">Recent Activity</Text>
        <Pressable onPress={onPressViewAll}>
          <Text className="text-primary text-sm">View All</Text>
        </Pressable>
      </View>

      {walletTransactions.length > 0 ? (
        walletTransactions.slice(0, 3).map((transaction) => (
          <Card key={transaction.id} className="p-4 mb-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-foreground font-medium">
                  {transaction.isOutgoing ? "Sent" : "Received"}{" "}
                  {transaction.tokenSymbol || activeNetwork?.nativeCurrencySymbol || "ETH"}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {transaction.timestamp
                    ? new Date(transaction.timestamp).toLocaleDateString()
                    : "Pending"}
                </Text>
              </View>
              <Text
                className={`font-medium ${
                  !transaction.isOutgoing ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {!transaction.isOutgoing ? "+" : "-"}
                {transaction.tokenAmount || transaction.value}{" "}
                {transaction.tokenSymbol || activeNetwork?.nativeCurrencySymbol || "ETH"}
              </Text>
            </View>
          </Card>
        ))
      ) : (
        <Card className="p-4">
          <Text className="text-center text-muted-foreground text-sm">No transactions yet</Text>
        </Card>
      )}
    </View>
  );
}
