import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

interface WalletEmptyStateProps {
  onPressCreateWallet: () => void;
}

export function WalletEmptyState({ onPressCreateWallet }: WalletEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-center text-muted-foreground mb-4">
        No wallet selected. Please create or import a wallet to get started.
      </Text>
      <Button onPress={onPressCreateWallet}>
        <Text className="text-primary-foreground">Create Wallet</Text>
      </Button>
    </View>
  );
}
