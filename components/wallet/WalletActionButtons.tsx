import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Send } from "@/lib/icons/Send";
import { View } from "react-native";

interface WalletActionButtonsProps {
  onPressSend: () => void;
  onPressReceive: () => void;
  isSendDisabled: boolean;
  isReceiveDisabled: boolean;
}

export function WalletActionButtons({
  onPressSend,
  onPressReceive,
  isSendDisabled,
  isReceiveDisabled,
}: WalletActionButtonsProps) {
  return (
    <View className="flex-row px-4 mb-8 gap-4">
      <Button onPress={onPressSend} className="flex-1 bg-primary" disabled={isSendDisabled}>
        <View className="flex-row items-center">
          <Send className="text-primary-foreground mr-2" size={16} />
          <Text className="text-primary-foreground font-medium">Send</Text>
        </View>
      </Button>

      <Button
        variant="outline"
        onPress={onPressReceive}
        className="flex-1"
        disabled={isReceiveDisabled}
      >
        <Text className="text-primary font-medium">Receive</Text>
      </Button>
    </View>
  );
}
