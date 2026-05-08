import { Text } from "@/components/ui/text";
import { Bell } from "@/lib/icons/Bell";
import { Pressable, View } from "react-native";

interface WalletHeaderProps {
  onPressNotifications: () => void;
}

export function WalletHeader({ onPressNotifications }: WalletHeaderProps) {
  return (
    <View className="flex-row justify-between items-center p-4 pt-12">
      <Text className="text-xl font-semibold text-foreground">Capsula</Text>
      <Pressable onPress={onPressNotifications}>
        <Bell className="text-foreground" size={24} />
      </Pressable>
    </View>
  );
}
