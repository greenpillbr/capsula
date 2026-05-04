import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { passkeyService } from "@/lib/auth/passkeyService";
import { useWalletStore } from "@/lib/stores/walletStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, View } from "react-native";
import { completeOnboarding } from "./MnemonicStep";

type WelcomeStepProps = {
  biometricType: string;
  onContinueToPasskeySetup: () => void;
};

export function WelcomeStep({
  biometricType,
  onContinueToPasskeySetup,
}: WelcomeStepProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { wallets } = useWalletStore();

  console.log("biometricType", biometricType);

  const handleImportWallet = () => {
    router.push("/import-wallet");
  };

  const handleEnterWithPasskey = async () => {
    setIsLoading(true);
    try {
      if (wallets.length > 0) {
        const authResult = await passkeyService.authenticateWithPasskey(
          "Authenticate to access your Capsula wallet",
        );

        if (authResult.success) {
          await completeOnboarding();
        } else {
          Alert.alert("Authentication Failed", "Please try again.");
        }
      } else {
        onContinueToPasskeySetup();
      }
    } catch (error) {
      console.error("Enter with Passkey error:", error);
      Alert.alert("Error", "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-6">
      <View className="mb-8">
        <Image
          source={require("../../assets/images/icon.png")}
          className="w-24 h-24 mb-4"
          resizeMode="contain"
        />
      </View>

      <Text className="text-3xl font-bold text-center text-foreground mb-2">
        Capsula
      </Text>
      <Text className="text-lg text-center text-foreground mb-4">
        Regenerative Wallet
      </Text>

      <Text className="text-center text-muted-foreground mb-8 px-4">
        Personal and community resources and apps easily available
      </Text>

      <View className="mb-12 px-4">
        <Text className="text-center text-muted-foreground mb-4">
          Simplify your crypto journey. With Passkey, your wallet is secured by
          your device's biometrics.
        </Text>
      </View>

      <View className="w-full max-w-sm">
        <Button
          onPress={handleEnterWithPasskey}
          className="w-full mb-4 bg-primary"
          disabled={!biometricType || isLoading}
        >
          <Text className="text-primary-foreground font-medium">
            {isLoading
              ? "Please wait…"
              : biometricType
                ? `Enter with ${biometricType}`
                : "Create Wallet"}
          </Text>
        </Button>

        <Button
          variant="outline"
          onPress={handleImportWallet}
          className="w-full"
        >
          <Text className="text-primary font-medium">Recover Wallet</Text>
        </Button>
      </View>

      <View className="absolute bottom-8">
        <Text className="text-xs text-muted-foreground">
          Made with ❤️ for Greenpill BR
        </Text>
      </View>
    </View>
  );
}
