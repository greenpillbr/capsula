import { ethers } from 'ethers';
import { Platform } from 'react-native';
import { PasskeyCredential, passkeyService } from './PasskeyService';

// Web-compatible crypto polyfills
let Crypto: any = null;
let SecureStore: any = null;

// Only import native modules on mobile platforms
if (Platform.OS !== 'web') {
  try {
    Crypto = require('expo-crypto');
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
  hasTransactionPassword?: boolean;
}

export interface AuthMethod {
  type: 'passkey' | 'password';
  isAvailable: boolean;
}

class WalletService {
  private static readonly WALLET_KEY = 'capsula_wallet';
  private static readonly WALLET_LIST_KEY = 'capsula_wallet_list';
  private static readonly PASSWORD_HASH_KEY = 'capsula_tx_password';
  private static readonly PASSWORD_SALT_KEY = 'capsula_tx_salt';

  /**
   * Check available authentication methods
   */
  async getAuthMethods(): Promise<AuthMethod[]> {
    const methods: AuthMethod[] = [];
    
    // Check Passkey availability
    const hasPasskey = await passkeyService.isSupported();
    methods.push({
      type: 'passkey',
      isAvailable: hasPasskey
    });

    // Transaction password is always available as fallback
    methods.push({
      type: 'password',
      isAvailable: true
    });

    return methods;
  }

  /**
   * Check if device supports Passkey authentication
   */
  async isPasskeyAvailable(): Promise<boolean> {
    try {
      return await passkeyService.isSupported();
    } catch (error) {
      console.error('Error checking Passkey availability:', error);
      return false;
    }
  }

  /**
   * Hash transaction password
   */
  private async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    try {
      // Generate salt if not provided
      const useSalt = salt || (Platform.OS === 'web' 
        ? crypto.getRandomValues(new Uint8Array(16)).join('')
        : await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            Date.now().toString()
          ));

      // Hash password with salt
      const hashInput = `${password}${useSalt}`;
      const hash = Platform.OS === 'web'
        ? await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashInput))
            .then(buf => Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''))
        : await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            hashInput
          );

      return { hash, salt: useSalt };
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Store transaction password
   */
  async setTransactionPassword(password: string): Promise<void> {
    try {
      const { hash, salt } = await this.hashPassword(password);

      if (Platform.OS === 'web') {
        localStorage.setItem(WalletService.PASSWORD_HASH_KEY, hash);
        localStorage.setItem(WalletService.PASSWORD_SALT_KEY, salt);
      } else {
        await SecureStore.setItemAsync(WalletService.PASSWORD_HASH_KEY, hash);
        await SecureStore.setItemAsync(WalletService.PASSWORD_SALT_KEY, salt);
      }

      // Update wallet metadata
      const wallets = await this.getStoredWalletInfo();
      if (wallets.length > 0) {
        wallets[0].hasTransactionPassword = true;
        if (Platform.OS === 'web') {
          localStorage.setItem(WalletService.WALLET_LIST_KEY, JSON.stringify(wallets));
        } else {
          await SecureStore.setItemAsync(WalletService.WALLET_LIST_KEY, JSON.stringify(wallets));
        }
      }
    } catch (error) {
      console.error('Error setting transaction password:', error);
      throw new Error('Failed to set transaction password');
    }
  }

  /**
   * Verify transaction password
   */
  async verifyTransactionPassword(password: string): Promise<boolean> {
    try {
      const storedHash = Platform.OS === 'web'
        ? localStorage.getItem(WalletService.PASSWORD_HASH_KEY)
        : await SecureStore.getItemAsync(WalletService.PASSWORD_HASH_KEY);

      const storedSalt = Platform.OS === 'web'
        ? localStorage.getItem(WalletService.PASSWORD_SALT_KEY)
        : await SecureStore.getItemAsync(WalletService.PASSWORD_SALT_KEY);

      if (!storedHash || !storedSalt) {
        return false;
      }

      const { hash } = await this.hashPassword(password, storedSalt);
      return hash === storedHash;
    } catch (error) {
      console.error('Error verifying transaction password:', error);
      return false;
    }
  }

  /**
   * Generate a new wallet with mnemonic phrase
   */
  generateWallet(): WalletInfo {
    try {
      console.log('WalletService: Starting wallet generation...');
      
      const wallet = ethers.Wallet.createRandom();
      console.log('WalletService: Wallet created, address:', wallet.address);
      
      return {
        address: wallet.address,
        mnemonic: wallet.mnemonic?.phrase || '',
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
      };
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
   * Encrypt wallet data
   */
  private async encryptWalletData(walletInfo: WalletInfo, password?: string): Promise<string> {
    try {
      let encryptionKey: string;

      if (password) {
        // Use transaction password for encryption
        const { hash } = await this.hashPassword(password);
        encryptionKey = hash;
      } else {
        // Use device-specific key
        if (Platform.OS === 'web') {
          const encoder = new TextEncoder();
          const data = encoder.encode(`capsula_${walletInfo.address}_${Date.now()}`);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          encryptionKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } else if (Crypto) {
          encryptionKey = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            `capsula_${walletInfo.address}_${Date.now()}`,
            { encoding: Crypto.CryptoEncoding.HEX }
          );
        } else {
          throw new Error('Crypto not available');
        }
      }

      const walletData = JSON.stringify({
        mnemonic: walletInfo.mnemonic,
        privateKey: walletInfo.privateKey,
        publicKey: walletInfo.publicKey,
        encryptionKey: encryptionKey.substring(0, 32),
      });

      return Platform.OS === 'web'
        ? btoa(walletData)
        : Buffer.from(walletData).toString('base64');
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
      
      // Derive address from private key to ensure consistency
      const wallet = new ethers.Wallet(walletData.privateKey);
      
      return {
        address: wallet.address,
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
   * Encrypt wallet data with specific key
   */
  private async encryptWalletDataWithKey(walletInfo: WalletInfo, encryptionKey: string): Promise<string> {
    try {
      const walletData = JSON.stringify({
        mnemonic: walletInfo.mnemonic,
        privateKey: walletInfo.privateKey,
        publicKey: walletInfo.publicKey,
        encryptionKey: encryptionKey.substring(0, 32),
      });

      return Platform.OS === 'web'
        ? btoa(walletData)
        : Buffer.from(walletData).toString('base64');
    } catch (error) {
      console.error('Error encrypting wallet data with key:', error);
      throw new Error('Failed to encrypt wallet data');
    }
  }

  /**
   * Decrypt wallet data with specific key
   */
  private async decryptWalletDataWithKey(encryptedData: string, encryptionKey: string): Promise<WalletInfo> {
    try {
      let walletData: any;

      if (Platform.OS === 'web') {
        walletData = JSON.parse(atob(encryptedData));
      } else {
        walletData = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
      }
      
      // Verify the encryption key matches
      if (walletData.encryptionKey !== encryptionKey.substring(0, 32)) {
        throw new Error('Invalid encryption key');
      }
      
      // Derive address from private key to ensure consistency
      const wallet = new ethers.Wallet(walletData.privateKey);
      
      return {
        address: wallet.address,
        mnemonic: walletData.mnemonic,
        privateKey: walletData.privateKey,
        publicKey: walletData.publicKey,
      };
    } catch (error) {
      console.error('Error decrypting wallet data with key:', error);
      throw new Error('Failed to decrypt wallet data');
    }
  }

  /**
   * Store wallet with authentication
   */
  async storeWallet(walletInfo: WalletInfo, authMethod: 'passkey' | 'password', password?: string): Promise<boolean> {
    try {
      if (authMethod === 'passkey') {
        return this.storeWalletWithPasskey(walletInfo);
      } else if (authMethod === 'password' && password) {
        return this.storeWalletWithPassword(walletInfo, password);
      }
      throw new Error('Invalid authentication method or missing password');
    } catch (error) {
      console.error('Error storing wallet:', error);
      throw error;
    }
  }

  /**
   * Store wallet with transaction password
   */
  public async storeWalletWithPassword(walletInfo: WalletInfo, password: string): Promise<boolean> {
    try {
      // Set transaction password
      await this.setTransactionPassword(password);

      // Encrypt wallet data with password
      const encryptedData = await this.encryptWalletData(walletInfo, password);

      if (Platform.OS === 'web') {
        localStorage.setItem(WalletService.WALLET_KEY, encryptedData);
      } else {
        await SecureStore.setItemAsync(WalletService.WALLET_KEY, encryptedData);
      }

      // Store wallet metadata
      const storedWallet: StoredWallet = {
        address: walletInfo.address,
        encryptedData: 'stored_securely',
        createdAt: new Date().toISOString(),
        hasPasskey: false,
        hasTransactionPassword: true,
      };

      if (Platform.OS === 'web') {
        localStorage.setItem(WalletService.WALLET_LIST_KEY, JSON.stringify([storedWallet]));
      } else {
        await SecureStore.setItemAsync(WalletService.WALLET_LIST_KEY, JSON.stringify([storedWallet]));
      }

      return true;
    } catch (error) {
      console.error('Error storing wallet with password:', error);
      throw error;
    }
  }

  /**
   * Store wallet with passkey
   */
  public async storeWalletWithPasskey(walletInfo: WalletInfo, passkeyCredential?: PasskeyCredential): Promise<boolean> {
    try {
      let encryptionKey: string;
      
      if (passkeyCredential) {
        // Use provided Passkey credential to derive encryption key
        encryptionKey = await passkeyService.deriveKeyFromPasskey(passkeyCredential);
      } else {
        // Register new Passkey and derive key
        const credential = await passkeyService.registerPasskey(walletInfo.address, 'Capsula Wallet');
        encryptionKey = await passkeyService.deriveKeyFromPasskey(credential);
      }

      // Encrypt wallet data with Passkey-derived key
      const encryptedData = await this.encryptWalletDataWithKey(walletInfo, encryptionKey);

      if (Platform.OS === 'web') {
        localStorage.setItem(WalletService.WALLET_KEY, encryptedData);
      } else {
        await SecureStore.setItemAsync(WalletService.WALLET_KEY, encryptedData);
      }

      // Store wallet metadata
      const storedWallet: StoredWallet = {
        address: walletInfo.address,
        encryptedData: 'stored_securely',
        createdAt: new Date().toISOString(),
        hasPasskey: true,
      };

      if (Platform.OS === 'web') {
        localStorage.setItem(WalletService.WALLET_LIST_KEY, JSON.stringify([storedWallet]));
      } else {
        await SecureStore.setItemAsync(WalletService.WALLET_LIST_KEY, JSON.stringify([storedWallet]));
      }

      return true;
    } catch (error) {
      console.error('Error storing wallet with passkey:', error);
      throw error;
    }
  }

  /**
   * Retrieve wallet with authentication
   */
  async retrieveWallet(authMethod: 'passkey' | 'password', password?: string): Promise<WalletInfo | null> {
    try {
      if (authMethod === 'passkey') {
        return this.retrieveWalletWithPasskey();
      } else if (authMethod === 'password' && password) {
        return this.retrieveWalletWithPassword(password);
      }
      throw new Error('Invalid authentication method or missing password');
    } catch (error) {
      console.error('Error retrieving wallet:', error);
      throw error;
    }
  }

  /**
   * Retrieve wallet with passkey
   */
  public async retrieveWalletWithPasskey(): Promise<WalletInfo | null> {
    try {
      // Authenticate with existing Passkey
      const credential = await passkeyService.authenticateWithPasskey();
      
      // Derive encryption key from Passkey
      const encryptionKey = await passkeyService.deriveKeyFromPasskey(credential);

      // Get encrypted wallet data
      const encryptedData = Platform.OS === 'web'
        ? localStorage.getItem(WalletService.WALLET_KEY)
        : await SecureStore.getItemAsync(WalletService.WALLET_KEY);

      if (!encryptedData) return null;
      
      // Decrypt wallet data with Passkey-derived key
      return this.decryptWalletDataWithKey(encryptedData, encryptionKey);
    } catch (error) {
      console.error('Error retrieving wallet with passkey:', error);
      throw error;
    }
  }

  /**
   * Retrieve wallet with transaction password
   */
  public async retrieveWalletWithPassword(password: string): Promise<WalletInfo | null> {
    try {
      const isValid = await this.verifyTransactionPassword(password);
      if (!isValid) {
        throw new Error('Invalid transaction password');
      }

      const encryptedData = Platform.OS === 'web'
        ? localStorage.getItem(WalletService.WALLET_KEY)
        : await SecureStore.getItemAsync(WalletService.WALLET_KEY);

      if (!encryptedData) return null;
      return this.decryptWalletData(encryptedData);
    } catch (error) {
      console.error('Error retrieving wallet with password:', error);
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
  public async getStoredWalletInfo(): Promise<StoredWallet[]> {
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
        localStorage.removeItem(WalletService.PASSWORD_HASH_KEY);
        localStorage.removeItem(WalletService.PASSWORD_SALT_KEY);
        return true;
      }

      await SecureStore.deleteItemAsync(WalletService.WALLET_KEY);
      await SecureStore.deleteItemAsync(WalletService.WALLET_LIST_KEY);
      await SecureStore.deleteItemAsync(WalletService.PASSWORD_HASH_KEY);
      await SecureStore.deleteItemAsync(WalletService.PASSWORD_SALT_KEY);
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
