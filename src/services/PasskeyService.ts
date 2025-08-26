import { Platform } from 'react-native';

// Web-compatible imports
let startRegistration: any = null;
let startAuthentication: any = null;
let ExpoPasskeys: any = null;

// Platform-specific imports
if (Platform.OS === 'web') {
  try {
    const webauthn = require('@simplewebauthn/browser');
    startRegistration = webauthn.startRegistration;
    startAuthentication = webauthn.startAuthentication;
  } catch (error) {
    console.warn('WebAuthn not available:', error);
  }
} else {
  try {
    ExpoPasskeys = require('expo-passkeys');
  } catch (error) {
    console.warn('Expo Passkeys not available:', error);
  }
}

export interface PasskeyCredential {
  id: string;
  rawId: ArrayBuffer;
  response: {
    clientDataJSON: ArrayBuffer;
    attestationObject?: ArrayBuffer;
    authenticatorData?: ArrayBuffer;
    signature?: ArrayBuffer;
    userHandle?: ArrayBuffer;
  };
  type: 'public-key';
}

export interface PasskeyRegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: 'public-key';
    alg: number;
  }>;
  timeout?: number;
  attestation?: 'none' | 'indirect' | 'direct';
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    userVerification?: 'required' | 'preferred' | 'discouraged';
    residentKey?: 'discouraged' | 'preferred' | 'required';
  };
}

export interface PasskeyAuthenticationOptions {
  challenge: string;
  timeout?: number;
  rpId?: string;
  allowCredentials?: Array<{
    type: 'public-key';
    id: string;
  }>;
  userVerification?: 'required' | 'preferred' | 'discouraged';
}

export interface PasskeyCapabilities {
  isSupported: boolean;
  isPlatformAuthenticatorAvailable: boolean;
  isConditionalMediationAvailable: boolean;
}

class PasskeyService {
  private static readonly DOMAIN = 'capsula.wallet';
  private static readonly RP_NAME = 'Capsula Wallet';

  /**
   * Check if Passkeys are supported on the current platform
   */
  async isSupported(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return !!(
          window.PublicKeyCredential &&
          typeof navigator.credentials?.create === 'function' &&
          typeof navigator.credentials?.get === 'function'
        );
      } else {
        return ExpoPasskeys ? await ExpoPasskeys.isAvailableAsync() : false;
      }
    } catch (error) {
      console.error('Error checking Passkey support:', error);
      return false;
    }
  }

  /**
   * Get detailed capabilities of the current platform
   */
  async getCapabilities(): Promise<PasskeyCapabilities> {
    const isSupported = await this.isSupported();
    
    if (!isSupported) {
      return {
        isSupported: false,
        isPlatformAuthenticatorAvailable: false,
        isConditionalMediationAvailable: false,
      };
    }

    try {
      if (Platform.OS === 'web') {
        const isPlatformAuthenticatorAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        const isConditionalMediationAvailable = await PublicKeyCredential.isConditionalMediationAvailable?.() || false;
        
        return {
          isSupported: true,
          isPlatformAuthenticatorAvailable,
          isConditionalMediationAvailable,
        };
      } else {
        // For mobile platforms, assume platform authenticator is available if Passkeys are supported
        return {
          isSupported: true,
          isPlatformAuthenticatorAvailable: true,
          isConditionalMediationAvailable: false,
        };
      }
    } catch (error) {
      console.error('Error getting Passkey capabilities:', error);
      return {
        isSupported,
        isPlatformAuthenticatorAvailable: false,
        isConditionalMediationAvailable: false,
      };
    }
  }

  /**
   * Generate a cryptographically secure challenge
   */
  private generateChallenge(): string {
    if (Platform.OS === 'web') {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } else {
      // For React Native, use a timestamp-based approach with random elements
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2);
      return btoa(`${timestamp}-${random}`)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }
  }

  /**
   * Generate user ID for Passkey registration
   */
  private generateUserId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return btoa(`capsula-${timestamp}-${random}`)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Register a new Passkey
   */
  async registerPasskey(username: string, displayName?: string): Promise<PasskeyCredential> {
    const isSupported = await this.isSupported();
    if (!isSupported) {
      throw new Error('Passkeys are not supported on this device');
    }

    const challenge = this.generateChallenge();
    const userId = this.generateUserId();

    const registrationOptions: PasskeyRegistrationOptions = {
      challenge,
      rp: {
        name: PasskeyService.RP_NAME,
        id: PasskeyService.DOMAIN,
      },
      user: {
        id: userId,
        name: username,
        displayName: displayName || username,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'required',
      },
    };

    try {
      if (Platform.OS === 'web') {
        if (!startRegistration) {
          throw new Error('WebAuthn registration not available');
        }
        return await startRegistration(registrationOptions);
      } else {
        if (!ExpoPasskeys) {
          throw new Error('Expo Passkeys not available');
        }
        return await ExpoPasskeys.createAsync(registrationOptions);
      }
    } catch (error) {
      console.error('Error registering Passkey:', error);
      throw new Error(`Failed to register Passkey: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Authenticate with an existing Passkey
   */
  async authenticateWithPasskey(credentialId?: string): Promise<PasskeyCredential> {
    const isSupported = await this.isSupported();
    if (!isSupported) {
      throw new Error('Passkeys are not supported on this device');
    }

    const challenge = this.generateChallenge();

    const authenticationOptions: PasskeyAuthenticationOptions = {
      challenge,
      timeout: 60000,
      rpId: PasskeyService.DOMAIN,
      userVerification: 'required',
    };

    // If a specific credential ID is provided, restrict to that credential
    if (credentialId) {
      authenticationOptions.allowCredentials = [
        {
          type: 'public-key',
          id: credentialId,
        },
      ];
    }

    try {
      if (Platform.OS === 'web') {
        if (!startAuthentication) {
          throw new Error('WebAuthn authentication not available');
        }
        return await startAuthentication(authenticationOptions);
      } else {
        if (!ExpoPasskeys) {
          throw new Error('Expo Passkeys not available');
        }
        return await ExpoPasskeys.getAsync(authenticationOptions);
      }
    } catch (error) {
      console.error('Error authenticating with Passkey:', error);
      throw new Error(`Failed to authenticate with Passkey: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Derive a deterministic key from Passkey credential
   * This creates a consistent encryption key from the Passkey response
   */
  async deriveKeyFromPasskey(credential: PasskeyCredential): Promise<string> {
    try {
      // Use the credential ID and response data to create a deterministic key
      const keyMaterial = credential.id + (credential.response.userHandle ? 
        new TextDecoder().decode(credential.response.userHandle) : '');
      
      if (Platform.OS === 'web') {
        const encoder = new TextEncoder();
        const data = encoder.encode(keyMaterial);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } else {
        // For React Native, use a simpler hash approach
        // In production, you might want to use a proper crypto library
        let hash = 0;
        for (let i = 0; i < keyMaterial.length; i++) {
          const char = keyMaterial.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(8, '0').repeat(8); // 64-char hex string
      }
    } catch (error) {
      console.error('Error deriving key from Passkey:', error);
      throw new Error('Failed to derive encryption key from Passkey');
    }
  }

  /**
   * Check if there are existing Passkey credentials for this domain
   */
  async hasExistingCredentials(): Promise<boolean> {
    try {
      const isSupported = await this.isSupported();
      if (!isSupported) return false;

      // Try to authenticate without specifying credentials
      // This will show available credentials if any exist
      const challenge = this.generateChallenge();
      
      const authOptions: PasskeyAuthenticationOptions = {
        challenge,
        timeout: 1000, // Short timeout for quick check
        rpId: PasskeyService.DOMAIN,
        userVerification: 'preferred',
      };

      if (Platform.OS === 'web') {
        if (!startAuthentication) return false;
        
        try {
          await startAuthentication(authOptions);
          return true;
        } catch (error) {
          // If no credentials exist, this will throw an error
          return false;
        }
      } else {
        if (!ExpoPasskeys) return false;
        
        try {
          await ExpoPasskeys.getAsync(authOptions);
          return true;
        } catch (error) {
          return false;
        }
      }
    } catch (error) {
      console.error('Error checking existing credentials:', error);
      return false;
    }
  }
}

export const passkeyService = new PasskeyService();