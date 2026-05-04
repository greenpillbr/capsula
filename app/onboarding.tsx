import {
  MnemonicStep,
  PasskeySetupStep,
  WelcomeStep,
} from "@/components/onboarding";
import { passkeyService } from "@/lib/auth/passkeyService";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [biometricType, setBiometricType] = useState<string>("");
  const [walletMnemonic, setWalletMnemonic] = useState<string>("");

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const isSupported = await passkeyService.isPasskeySupported();
      if (isSupported) {
        const types = await passkeyService.getAvailableBiometrics();
        const typeName = passkeyService.getBiometricTypeName(types);
        setBiometricType(typeName);
      }
    } catch (error) {
      console.error("Failed to check biometric support:", error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {currentStep === 0 && (
        <WelcomeStep
          biometricType={biometricType}
          onContinueToPasskeySetup={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 1 && (
        <PasskeySetupStep
          biometricType={biometricType}
          onWalletCreated={(mnemonic) => {
            setWalletMnemonic(mnemonic);
            setCurrentStep(2);
          }}
          onBack={() => setCurrentStep(0)}
        />
      )}
      {currentStep === 2 && (
        <MnemonicStep
          walletMnemonic={walletMnemonic}
          onBack={() => setCurrentStep(1)}
        />
      )}
    </View>
  );
}
