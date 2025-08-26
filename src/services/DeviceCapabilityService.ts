import { Platform } from 'react-native';
import { passkeyService } from './PasskeyService';

export interface DeviceCapabilities {
  supportsPasskeys: boolean;
  supportsBiometrics: boolean;
  supportsSecureStorage: boolean;
  platformType: 'web' | 'ios' | 'android' | 'unknown';
  recommendedAuthMethod: 'passkey' | 'manual';
  fallbackOptions: string[];
}

export interface CapabilityCheckResult {
  isSupported: boolean;
  reason?: string;
  fallbackSuggestion?: string;
}

class DeviceCapabilityService {
  private cachedCapabilities: DeviceCapabilities | null = null;

  /**
   * Get comprehensive device capabilities
   */
  async getDeviceCapabilities(): Promise<DeviceCapabilities> {
    if (this.cachedCapabilities) {
      return this.cachedCapabilities;
    }

    const capabilities = await this.detectCapabilities();
    this.cachedCapabilities = capabilities;
    return capabilities;
  }

  /**
   * Detect all device capabilities
   */
  private async detectCapabilities(): Promise<DeviceCapabilities> {
    const platformType = this.getPlatformType();
    const supportsPasskeys = await this.checkPasskeySupport();
    const supportsBiometrics = await this.checkBiometricSupport();
    const supportsSecureStorage = await this.checkSecureStorageSupport();

    const recommendedAuthMethod = supportsPasskeys ? 'passkey' : 'manual';
    const fallbackOptions = this.generateFallbackOptions(supportsPasskeys, supportsBiometrics, supportsSecureStorage);

    return {
      supportsPasskeys,
      supportsBiometrics,
      supportsSecureStorage,
      platformType,
      recommendedAuthMethod,
      fallbackOptions,
    };
  }

  /**
   * Get platform type
   */
  private getPlatformType(): 'web' | 'ios' | 'android' | 'unknown' {
    switch (Platform.OS) {
      case 'web':
        return 'web';
      case 'ios':
        return 'ios';
      case 'android':
        return 'android';
      default:
        return 'unknown';
    }
  }

  /**
   * Check if device supports Passkeys
   */
  private async checkPasskeySupport(): Promise<boolean> {
    try {
      return await passkeyService.isSupported();
    } catch (error) {
      console.error('Error checking Passkey support:', error);
      return false;
    }
  }

  /**
   * Check if device supports biometric authentication
   */
  private async checkBiometricSupport(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // For web, check if WebAuthn supports user verification
        const capabilities = await passkeyService.getCapabilities();
        return capabilities.isPlatformAuthenticatorAvailable;
      } else {
        // For mobile, check if biometric hardware is available
        let LocalAuthentication: any = null;
        try {
          LocalAuthentication = require('expo-local-authentication');
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          return hasHardware && isEnrolled;
        } catch (error) {
          console.warn('LocalAuthentication not available:', error);
          return false;
        }
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
      return false;
    }
  }

  /**
   * Check if device supports secure storage
   */
  private async checkSecureStorageSupport(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // For web, check if localStorage is available
        return typeof Storage !== 'undefined' && !!localStorage;
      } else {
        // For mobile, check if SecureStore is available
        try {
          const SecureStore = require('expo-secure-store');
          return !!SecureStore;
        } catch (error) {
          console.warn('SecureStore not available:', error);
          return false;
        }
      }
    } catch (error) {
      console.error('Error checking secure storage support:', error);
      return false;
    }
  }

  /**
   * Generate fallback options based on capabilities
   */
  private generateFallbackOptions(
    supportsPasskeys: boolean,
    supportsBiometrics: boolean,
    supportsSecureStorage: boolean
  ): string[] {
    const options: string[] = [];

    if (supportsPasskeys) {
      options.push('Passkey authentication');
    }

    if (supportsBiometrics && !supportsPasskeys) {
      options.push('Biometric authentication');
    }

    if (supportsSecureStorage) {
      options.push('Transaction password');
    }

    options.push('Manual seed phrase entry');
    options.push('Recovery phrase backup');

    return options;
  }

  /**
   * Check specific capability with detailed result
   */
  async checkCapability(capability: keyof DeviceCapabilities): Promise<CapabilityCheckResult> {
    const capabilities = await this.getDeviceCapabilities();
    const isSupported = capabilities[capability] as boolean;

    if (isSupported) {
      return { isSupported: true };
    }

    // Provide specific reasons and fallback suggestions
    switch (capability) {
      case 'supportsPasskeys':
        return {
          isSupported: false,
          reason: this.getPasskeyUnsupportedReason(),
          fallbackSuggestion: 'Use manual seed phrase entry or transaction password',
        };

      case 'supportsBiometrics':
        return {
          isSupported: false,
          reason: 'Biometric authentication is not available or not set up on this device',
          fallbackSuggestion: 'Use transaction password or manual authentication',
        };

      case 'supportsSecureStorage':
        return {
          isSupported: false,
          reason: 'Secure storage is not available on this device',
          fallbackSuggestion: 'Use in-memory storage (less secure) or external backup',
        };

      default:
        return {
          isSupported: false,
          reason: 'Capability not supported',
          fallbackSuggestion: 'Use alternative authentication methods',
        };
    }
  }

  /**
   * Get specific reason why Passkeys are not supported
   */
  private getPasskeyUnsupportedReason(): string {
    const platform = this.getPlatformType();

    switch (platform) {
      case 'web':
        return 'Your browser does not support WebAuthn/Passkeys or the feature is disabled';
      case 'ios':
        return 'Passkeys require iOS 16+ and compatible hardware';
      case 'android':
        return 'Passkeys require Android 9+ with Google Play Services and compatible hardware';
      default:
        return 'Passkeys are not supported on this platform';
    }
  }

  /**
   * Get user-friendly capability summary
   */
  async getCapabilitySummary(): Promise<string> {
    const capabilities = await this.getDeviceCapabilities();

    if (capabilities.supportsPasskeys) {
      return 'Your device supports Passkey authentication for enhanced security and convenience.';
    }

    if (capabilities.supportsBiometrics) {
      return 'Your device supports biometric authentication. Passkeys are not available, but you can use fingerprint or face recognition.';
    }

    if (capabilities.supportsSecureStorage) {
      return 'Your device supports secure storage. You can use transaction passwords for wallet protection.';
    }

    return 'Your device has limited security features. Manual seed phrase management is recommended.';
  }

  /**
   * Get recommended onboarding flow based on capabilities
   */
  async getRecommendedOnboardingFlow(): Promise<{
    primaryOption: string;
    secondaryOption: string;
    description: string;
  }> {
    const capabilities = await this.getDeviceCapabilities();

    if (capabilities.supportsPasskeys) {
      return {
        primaryOption: 'Create with Passkey',
        secondaryOption: 'Manual Setup',
        description: 'Passkey authentication provides the best security and user experience.',
      };
    }

    if (capabilities.supportsBiometrics) {
      return {
        primaryOption: 'Create with Biometrics',
        secondaryOption: 'Manual Setup',
        description: 'Biometric authentication offers convenient and secure access to your wallet.',
      };
    }

    return {
      primaryOption: 'Create with Password',
      secondaryOption: 'Manual Setup',
      description: 'Transaction password provides basic security for your wallet.',
    };
  }

  /**
   * Clear cached capabilities (useful for testing or when device state changes)
   */
  clearCache(): void {
    this.cachedCapabilities = null;
  }

  /**
   * Check if device meets minimum security requirements
   */
  async meetsMinimumSecurityRequirements(): Promise<boolean> {
    const capabilities = await this.getDeviceCapabilities();
    
    // Minimum requirement: secure storage OR Passkeys
    return capabilities.supportsSecureStorage || capabilities.supportsPasskeys;
  }

  /**
   * Get security level assessment
   */
  async getSecurityLevel(): Promise<'high' | 'medium' | 'low'> {
    const capabilities = await this.getDeviceCapabilities();

    if (capabilities.supportsPasskeys) {
      return 'high';
    }

    if (capabilities.supportsBiometrics && capabilities.supportsSecureStorage) {
      return 'medium';
    }

    if (capabilities.supportsSecureStorage) {
      return 'medium';
    }

    return 'low';
  }
}

export const deviceCapabilityService = new DeviceCapabilityService();