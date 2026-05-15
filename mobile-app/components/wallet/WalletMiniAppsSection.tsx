import { MiniAppIcon } from "@/components/mini-apps/MiniAppIcon";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import type { MiniApp, Network } from "@/db/schema";
import { Pressable, View } from "react-native";

interface WalletMiniAppsSectionProps {
  miniApps: MiniApp[];
  activeNetwork: Network | null;
  onLaunchMiniApp: (miniAppId: string) => void;
}

export function WalletMiniAppsSection({
  miniApps,
  activeNetwork,
  onLaunchMiniApp,
}: WalletMiniAppsSectionProps) {
  return (
    <View className="px-4 mb-6">
      <Text className="text-lg font-semibold text-foreground mb-4">Mini-Apps</Text>

      <View className="flex-row flex-wrap gap-4">
        {miniApps.map((miniApp) => (
          <Pressable
            key={miniApp.id}
            onPress={() => onLaunchMiniApp(miniApp.id)}
            className="w-20 items-center"
          >
            <MiniAppIcon
              miniAppId={miniApp.id}
              miniAppTitle={miniApp.title}
              containerClassName="w-16 h-16 bg-primary/10 rounded-lg mb-2 items-center justify-center overflow-hidden"
              imageClassName="w-16 h-16"
              fallbackTextClassName="text-primary text-lg font-medium"
            />
            <Text className="text-xs text-foreground text-center">{miniApp.title}</Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => console.log("Future: Open mini-apps marketplace")}
          className="w-20 items-center"
        >
          <View className="w-16 h-16 bg-muted border-2 border-dashed border-muted-foreground rounded-lg mb-2 items-center justify-center">
            <Text className="text-muted-foreground text-xl">+</Text>
          </View>
          <Text className="text-xs text-muted-foreground text-center">More</Text>
        </Pressable>
      </View>

      {miniApps.length === 0 && (
        <Card className="p-4">
          <Text className="text-center text-muted-foreground text-sm">
            No mini-apps available for {activeNetwork?.name || "this network"}
          </Text>
        </Card>
      )}
    </View>
  );
}
