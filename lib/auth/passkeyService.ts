import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ethersService } from '../blockchain/ethersService';

export interface PasskeyResult {
  success: boolean;
  error?: string;
  biometricType?: string;
}

export interface WalletCredential {
  id: string;
  privateKey?: string;
  mnemonic?: string;
  address: string;
  createdAt: string;
}

class PasskeyService {
  private readonly WALLET_KEY_PREFIX = 'capsula_wallet_';
  private readonly PASSKEY_ENABLED_KEY = 'capsula_passkey_enabled';
  private readonly LAST_AUTH_KEY = 'capsula_last_auth';

  /**
   * Check if device supports biometric authentication
   */
  async isPasskeySupported(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Failed to check Passkey support:', error);
      return false;
    }
  }

  /**
   * Get available biometric types
   */
  async getAvailableBiometrics(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Failed to get biometric types:', error);
      return [];
    }
  }

  /**
   * Get user-friendly biometric type name
   */
  getBiometricTypeName(types: LocalAuthentication.AuthenticationType[]): string {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris Recognition';
    }
    return 'Biometric Authentication';
  }

  /**
   * Authenticate with Passkey/Biometrics
   */
  async authenticateWithPasskey(
    promptMessage: string = 'Authenticate to access your Capsula wallet'
  ): Promise<PasskeyResult> {
    try {
      const isSupported = await this.isPasskeySupported();
      
      if (!isSupported) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device',
        };
      }

      const biometricTypes = await this.getAvailableBiometrics();
      const biometricName = this.getBiometricTypeName(biometricTypes);

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Store last successful authentication time
        await SecureStore.setItemAsync(
          this.LAST_AUTH_KEY,
          Date.now().toString()
        );

        return {
          success: true,
          biometricType: biometricName,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }
    } catch (error) {
      console.error('Passkey authentication failed:', error);
      return {
        success: false,
        error: 'Authentication error occurred',
      };
    }
  }

  /**
   * Store wallet credentials securely
   */
  async storeWalletCredential(
    walletId: string,
    credential: Omit<WalletCredential, 'id' | 'createdAt'>
  ): Promise<boolean> {
    try {
      // First authenticate the user
      const authResult = await this.authenticateWithPasskey(
        'Authenticate to secure your wallet'
      );

      if (!authResult.success) {
        throw new Error('Authentication required to store wallet');
      }

      const walletCredential: WalletCredential = {
        id: walletId,
        ...credential,
        createdAt: new Date().toISOString(),
      };

      await SecureStore.setItemAsync(
        `${this.WALLET_KEY_PREFIX}${walletId}`,
        JSON.stringify(walletCredential)
      );

      // Mark Passkey as enabled
      await SecureStore.setItemAsync(this.PASSKEY_ENABLED_KEY, 'true');

      return true;
    } catch (error) {
      console.error('Failed to store wallet credential:', error);
      return false;
    }
  }

  /**
   * Retrieve wallet credentials securely
   */
  async getWalletCredential(walletId: string): Promise<WalletCredential | null> {
    try {
      // Authenticate the user first
      const authResult = await this.authenticateWithPasskey(
        'Authenticate to access your wallet'
      );

      if (!authResult.success) {
        throw new Error('Authentication required to access wallet');
      }

      const credentialData = await SecureStore.getItemAsync(
        `${this.WALLET_KEY_PREFIX}${walletId}`
      );

      if (!credentialData) {
        return null;
      }

      return JSON.parse(credentialData) as WalletCredential;
    } catch (error) {
      console.error('Failed to get wallet credential:', error);
      return null;
    }
  }

  /**
   * Create a new wallet with Passkey protection
   */
  async createPasskeyWallet(walletName: string = 'Capsula Wallet'): Promise<{
    success: boolean;
    wallet?: {
      id: string;
      address: string;
      name: string;
    };
    error?: string;
  }> {
    try {
      // Check if Passkey is supported
      const isSupported = await this.isPasskeySupported();
      if (!isSupported) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      // Authenticate user before creating wallet
      const authResult = await this.authenticateWithPasskey(
        'Authenticate to create your new wallet'
      );

      if (!authResult.success) {
        return {
          success: false,
          error: 'Authentication required to create wallet',
        };
      }

      // Generate new wallet
      const hdWallet = ethersService.generateRandomWallet();
      const walletId = `wallet_${Date.now()}`;

      // Store wallet credentials securely
      const stored = await this.storeWalletCredential(walletId, {
        privateKey: hdWallet.privateKey,
        mnemonic: hdWallet.mnemonic?.phrase,
        address: hdWallet.address,
      });

      if (!stored) {
        return {
          success: false,
          error: 'Failed to secure wallet credentials',
        };
      }

      return {
        success: true,
        wallet: {
          id: walletId,
          address: hdWallet.address,
          name: walletName,
        },
      };
    } catch (error) {
      console.error('Failed to create Passkey wallet:', error);
      return {
        success: false,
        error: 'Failed to create wallet',
      };
    }
  }

  /**
   * Import wallet with Passkey protection
   */
  async importWalletWithPasskey(
    importData: { privateKey?: string; mnemonic?: string },
    walletName: string = 'Imported Wallet'
  ): Promise<{
    success: boolean;
    wallet?: {
      id: string;
      address: string;
      name: string;
    };
    error?: string;
  }> {
    try {
      // Authenticate user before importing
      const authResult = await this.authenticateWithPasskey(
        'Authenticate to import your wallet'
      );

      if (!authResult.success) {
        return {
          success: false,
          error: 'Authentication required to import wallet',
        };
      }

      let wallet;
      
      if (importData.mnemonic) {
        wallet = ethersService.createWalletFromMnemonic(importData.mnemonic);
      } else if (importData.privateKey) {
        wallet = ethersService.createWalletFromPrivateKey(importData.privateKey);
      } else {
        return {
          success: false,
          error: 'No valid import data provided',
        };
      }

      const walletId = `wallet_${Date.now()}`;

      // Store wallet credentials securely
      const stored = await this.storeWalletCredential(walletId, {
        privateKey: wallet.privateKey,
        mnemonic: importData.mnemonic,
        address: wallet.address,
      });

      if (!stored) {
        return {
          success: false,
          error: 'Failed to secure wallet credentials',
        };
      }

      return {
        success: true,
        wallet: {
          id: walletId,
          address: wallet.address,
          name: walletName,
        },
      };
    } catch (error) {
      console.error('Failed to import wallet:', error);
      return {
        success: false,
        error: 'Failed to import wallet',
      };
    }
  }

  /**
   * Sign transaction with Passkey authentication
   */
  async signTransactionWithPasskey(
    walletId: string,
    transaction: {
      to: string;
      value?: string;
      data?: string;
      gasLimit?: string;
      gasPrice?: string;
    }
  ): Promise<{
    success: boolean;
    signedTransaction?: string;
    error?: string;
  }> {
    try {
      // Get wallet credentials (this will prompt for authentication)
      const credential = await this.getWalletCredential(walletId);
      
      if (!credential || !credential.privateKey) {
        return {
          success: false,
          error: 'Wallet credentials not found',
        };
      }

      // Create wallet instance
      const wallet = ethersService.createWalletFromPrivateKey(credential.privateKey);
      const connectedWallet = ethersService.connectWallet(wallet);

      // Sign and send transaction
      const txResponse = await ethersService.sendTransaction(connectedWallet, transaction);

      return {
        success: true,
        signedTransaction: txResponse.hash,
      };
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      return {
        success: false,
        error: 'Transaction signing failed',
      };
    }
  }

  /**
   * Check if Passkey is enabled
   */
  async isPasskeyEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(this.PASSKEY_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Failed to check Passkey status:', error);
      return false;
    }
  }

  /**
   * Get last authentication time
   */
  async getLastAuthTime(): Promise<number | null> {
    try {
      const lastAuth = await SecureStore.getItemAsync(this.LAST_AUTH_KEY);
      return lastAuth ? parseInt(lastAuth, 10) : null;
    } catch (error) {
      console.error('Failed to get last auth time:', error);
      return null;
    }
  }

  /**
   * Remove wallet credentials (for wallet deletion)
   */
  async removeWalletCredential(walletId: string): Promise<boolean> {
    try {
      // Authenticate before deletion
      const authResult = await this.authenticateWithPasskey(
        'Authenticate to remove wallet'
      );

      if (!authResult.success) {
        return false;
      }

      await SecureStore.deleteItemAsync(`${this.WALLET_KEY_PREFIX}${walletId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove wallet credential:', error);
      return false;
    }
  }

  /**
   * Export seed phrase with authentication
   */
  async exportSeedPhrase(walletId: string): Promise<{
    success: boolean;
    mnemonic?: string;
    error?: string;
  }> {
    try {
      // Extra authentication prompt for seed phrase export
      const authResult = await this.authenticateWithPasskey(
        'Authenticate to export your recovery phrase'
      );

      if (!authResult.success) {
        return {
          success: false,
          error: 'Authentication required to export seed phrase',
        };
      }

      const credential = await this.getWalletCredential(walletId);
      
      if (!credential || !credential.mnemonic) {
        return {
          success: false,
          error: 'Seed phrase not found for this wallet',
        };
      }

      return {
        success: true,
        mnemonic: credential.mnemonic,
      };
    } catch (error) {
      console.error('Failed to export seed phrase:', error);
      return {
        success: false,
        error: 'Failed to export seed phrase',
      };
    }
  }
}

// Export singleton instance
export const passkeyService = new PasskeyService();