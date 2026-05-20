import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import React from "react";
import { Image, View } from "react-native";
import type { MiniAppProps } from "../../sdk/types";

export const GARDENS_LOGO = require("../../../../assets/images/gardens-logo.png");

export default function GardensModule({ onClose }: MiniAppProps) {
  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between p-4 pt-12 border-b border-border">
        <Text className="text-xl font-semibold text-foreground">Gardens</Text>
        <Button variant="outline" size="sm" onPress={onClose}>
          <Text className="text-foreground">Close</Text>
        </Button>
      </View>

      <View className="flex-1 items-center justify-center p-6">
        <Image
          source={GARDENS_LOGO}
          className="mb-6"
          style={{ width: 128, height: 128 }}
          resizeMode="contain"
        />

        <Text className="text-2xl font-bold text-foreground text-center mb-2">
          Coming Soon
        </Text>
        <Text className="text-base text-muted-foreground text-center max-w-sm">
          Gardens is on the way. Stay tuned for updates.
        </Text>
      </View>
    </View>
  );
}
