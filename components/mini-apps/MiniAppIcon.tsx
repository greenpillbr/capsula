import { Text } from "@/components/ui/text";
import React from "react";
import { Image, View } from "react-native";

const BUILT_IN_MINI_APP_ICONS: Record<string, number> = {
  "gardens-module": require("@/assets/images/gardens-logo.avif"),
};

type MiniAppIconProps = {
  miniAppId: string;
  miniAppTitle: string;
  containerClassName: string;
  imageClassName: string;
  fallbackTextClassName: string;
};

export function MiniAppIcon({
  miniAppId,
  miniAppTitle,
  containerClassName,
  imageClassName,
  fallbackTextClassName,
}: MiniAppIconProps) {
  const iconSource = BUILT_IN_MINI_APP_ICONS[miniAppId];

  return (
    <View className={containerClassName}>
      {iconSource ? (
        <Image source={iconSource} className={imageClassName} resizeMode="contain" />
      ) : (
        <Text className={fallbackTextClassName}>{miniAppTitle[0]}</Text>
      )}
    </View>
  );
}
