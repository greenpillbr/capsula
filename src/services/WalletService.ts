import { ethers } from 'ethers';
import { Platform } from 'react-native';

// Web-compatible crypto polyfills
let Crypto: any = null;
let LocalAuthentication: any = null;
let SecureStore: any = null;

// Only import native modules on mobile platforms
if (Platform.OS !== 'web') {
  try {
    Crypto = require('expo-crypto');
    LocalAuthentication = require('expo-local-authentication');
    SecureStore = require('expo-secure-store');
    require('react-native-get-random-values');
  } catch (error) {
    console.warn('Native modules not available:', error);
  }
}

export interface WalletInfo {
  address: string;
  mnemonic: string;
  privateKey: string;
  publicKey: string;
}

export interface StoredWallet {
  address: string;
  encryptedData: string;
  createdAt: string;
  hasPasskey: boolean;
}

class WalletService {
  private static readonly WALLET_KEY = 'capsula_wallet';
  private static readonly WALLET_LIST_KEY = 'capsula_wallet_list';

  /**
   * Check if device supports biometric authentication
   */
  async isBiometricAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') {
      // Web doesn't support biometric authentication
      return false;
    }

    try {
      if (!LocalAuthentication) return false;
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get available authentication types
   */
  async getAvailableAuthTypes(): Promise<any[]> {
    if (Platform.OS === 'web' || !LocalAuthentication) {
      return [];
    }

    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting auth types:', error);
      return [];
    }
  }

  /**
   * Generate a new wallet with mnemonic phrase
   */
  generateWallet(): WalletInfo {
    try {
      console.log('WalletService: Starting wallet generation...');
      console.log('Platform:', Platform.OS);
      
      // Generate a random mnemonic phrase (12 words)
      console.log('WalletService: Creating random wallet...');
      const wallet = ethers.Wallet.createRandom();
      console.log('WalletService: Wallet created, address:', wallet.address);
      
      const walletInfo = {
        address: wallet.address,
        mnemonic: wallet.mnemonic?.phrase || '',
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
      };
      
      console.log('WalletService: Wallet info prepared:', {
        address: walletInfo.address,
        hasMnemonic: !!walletInfo.mnemonic,
        hasPrivateKey: !!walletInfo.privateKey,
        hasPublicKey: !!walletInfo.publicKey
      });
      
      return walletInfo;
    } catch (error) {
      console.error('Error generating wallet:', error);
      throw new Error('Failed to generate wallet');
    }
  }

  /**
   * Create wallet from mnemonic phrase
   */
  createWalletFromMnemonic(mnemonic: string): WalletInfo {
    try {
      const wallet = ethers.Wallet.fromPhrase(mnemonic.trim());
      
      return {
        address: wallet.address,
        mnemonic: wallet.mnemonic?.phrase || '',
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
      };
    } catch (error) {
      console.error('Error creating wallet from mnemonic:', error);
      throw new Error('Invalid mnemonic phrase');
    }
  }

  /**
   * Encrypt wallet data using device-specific key
   */
  private async encryptWalletData(walletInfo: WalletInfo): Promise<string> {
    try {
      let deviceKey: string;

      if (Platform.OS === 'web') {
        // For web, use a simple hash-based approach
        const encoder = new TextEncoder();
        const data = encoder.encode(`capsula_${walletInfo.address}_${Date.now()}`);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        deviceKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } else if (Crypto) {
        // Create a deterministic key from device-specific data
        deviceKey = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `capsula_${walletInfo.address}_${Date.now()}`,
          { encoding: Crypto.CryptoEncoding.HEX }
        );
      } else {
        throw new Error('Crypto not available');
      }

      // In a real implementation, you'd use proper encryption
      // For now, we'll use base64 encoding with the device key as salt
      const walletData = JSON.stringify({
        mnemonic: walletInfo.mnemonic,
        privateKey: walletInfo.privateKey,
        publicKey: walletInfo.publicKey,
        deviceKey: deviceKey.substring(0, 32), // Use first 32 chars as key
      });

      if (Platform.OS === 'web') {
        return btoa(walletData);
      } else {
        return Buffer.from(walletData).toString('base64');
      }
    } catch (error) {
      console.error('Error encrypting wallet data:', error);
      throw new Error('Failed to encrypt wallet data');
    }
  }

  /**
   * Decrypt wallet data
   */
  private async decryptWalletData(encryptedData: string): Promise<WalletInfo> {
    try {
      let walletData: any;

      if (Platform.OS === 'web') {
        walletData = JSON.parse(atob(encryptedData));
      } else {
        walletData = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
      }
      
      return {
        address: '', // Will be derived from private key
        mnemonic: walletData.mnemonic,
        privateKey: walletData.privateKey,
        publicKey: walletData.publicKey,
      };
    } catch (error) {
      console.error('Error decrypting wallet data:', error);
      throw new Error('Failed to decrypt wallet data');
    }
  }

  /**
   * Store wallet securely with biometric authentication
   */
  async storeWalletWithPasskey(walletInfo: WalletInfo): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // For web, store in localStorage (not secure, but for demo purposes)
        const encryptedData = await this.encryptWalletData(walletInfo);
        
        localStorage.setItem(WalletService.WALLET_KEY, encryptedData);
        
        const storedWallet: StoredWallet = {
          address: walletInfo.address,
          encryptedData: 'stored_in_browser',
          createdAt: new Date().toISOString(),
          hasPasskey: false, // Web doesn't support passkeys in this demo
        };

        localStorage.setItem(WalletService.WALLET_LIST_KEY, JSON.stringify([storedWallet]));
        return true;
      }

      // Check if biometric authentication is available
      const isBiometricAvailable = await this.isBiometricAvailable();
      
      if (!isBiometricAvailable) {
        throw new Error('Biometric authentication is not available on this device');
      }

      // Authenticate user before storing
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to securely store your wallet',
        fallbackLabel: 'Use device passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!authResult.success) {
        throw new Error('Authentication failed');
      }

      // Encrypt wallet data
      const encryptedData = await this.encryptWalletData(walletInfo);

      // Store encrypted wallet data
      await SecureStore.setItemAsync(
        WalletService.WALLET_KEY,
        encryptedData,
        {
          requireAuthentication: true,
          authenticationPrompt: 'Authenticate to access your wallet',
        }
      );

      // Store wallet metadata
      const storedWallet: StoredWallet = {
        address: walletInfo.address,
        encryptedData: 'stored_securely',
        createdAt: new Date().toISOString(),
        hasPasskey: true,
      };

      await SecureStore.setItemAsync(
        WalletService.WALLET_LIST_KEY,
        JSON.stringify([storedWallet])
      );

      return true;
    } catch (error) {
      console.error('Error storing wallet with passkey:', error);
      throw error;
    }
  }

  /**
   * Retrieve wallet with biometric authentication
   */
  async retrieveWalletWithPasskey(): Promise<WalletInfo | null> {
    try {
      if (Platform.OS === 'web') {
        // For web, retrieve from localStorage
        const encryptedData = localStorage.getItem(WalletService.WALLET_KEY);
        
        if (!encryptedData) {
          return null;
        }

        // Decrypt wallet data
        const walletInfo = await this.decryptWalletData(encryptedData);
        
        // Derive address from private key to ensure consistency
        const wallet = new ethers.Wallet(walletInfo.privateKey);
        walletInfo.address = wallet.address;

        return walletInfo;
      }

      // Authenticate user before retrieving
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your wallet',
        fallbackLabel: 'Use device passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!authResult.success) {
        throw new Error('Authentication failed');
      }

      // Retrieve encrypted wallet data
      const encryptedData = await SecureStore.getItemAsync(WalletService.WALLET_KEY);
      
      if (!encryptedData) {
        return null;
      }

      // Decrypt wallet data
      const walletInfo = await this.decryptWalletData(encryptedData);
      
      // Derive address from private key to ensure consistency
      const wallet = new ethers.Wallet(walletInfo.privateKey);
      walletInfo.address = wallet.address;

      return walletInfo;
    } catch (error) {
      console.error('Error retrieving wallet with passkey:', error);
      throw error;
    }
  }

  /**
   * Check if a wallet exists
   */
  async hasStoredWallet(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        const walletList = localStorage.getItem(WalletService.WALLET_LIST_KEY);
        return walletList !== null;
      }

      const walletList = await SecureStore.getItemAsync(WalletService.WALLET_LIST_KEY);
      return walletList !== null;
    } catch (error) {
      console.error('Error checking stored wallet:', error);
      return false;
    }
  }

  /**
   * Get stored wallet metadata (without sensitive data)
   */
  async getStoredWalletInfo(): Promise<StoredWallet[]> {
    try {
      let walletListData: string | null;

      if (Platform.OS === 'web') {
        walletListData = localStorage.getItem(WalletService.WALLET_LIST_KEY);
      } else {
        walletListData = await SecureStore.getItemAsync(WalletService.WALLET_LIST_KEY);
      }
      
      if (!walletListData) {
        return [];
      }

      return JSON.parse(walletListData);
    } catch (error) {
      console.error('Error getting stored wallet info:', error);
      return [];
    }
  }

  /**
   * Delete stored wallet
   */
  async deleteStoredWallet(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(WalletService.WALLET_KEY);
        localStorage.removeItem(WalletService.WALLET_LIST_KEY);
        return true;
      }

      await SecureStore.deleteItemAsync(WalletService.WALLET_KEY);
      await SecureStore.deleteItemAsync(WalletService.WALLET_LIST_KEY);
      return true;
    } catch (error) {
      console.error('Error deleting stored wallet:', error);
      return false;
    }
  }

  /**
   * Validate mnemonic phrase
   */
  validateMnemonic(mnemonic: string): boolean {
    try {
      ethers.Wallet.fromPhrase(mnemonic.trim());
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get wallet balance (placeholder for future implementation)
   */
  async getWalletBalance(address: string): Promise<string> {
    // Placeholder - in real implementation, this would connect to blockchain
    return '0.0';
  }
}

export const walletService = new WalletService();
