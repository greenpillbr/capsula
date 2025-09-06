import type { Wallet } from '@/db/schema';
import * as Crypto from 'expo-crypto';
import { passkeyService } from '../auth/passkeyService';
import { ethersService } from '../blockchain/ethersService';
import { useAuthStore } from '../stores/authStore';
import { useWalletStore } from '../stores/walletStore';

export interface KeyManagerResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WalletCreationResult {
  wallet: Wallet;
  mnemonic: string;
}

export interface WalletImportResult {
  wallet: Wallet;
}

class KeyManager {
  /**
   * Generate a cryptographically secure wallet ID
   */
  private generateWalletId(): string {
    const timestamp = Date.now().toString();
    const randomBytes = Crypto.getRandomBytes(16);
    const randomHex = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `wallet_${timestamp}_${randomHex}`;
  }

  /**
   * Validate mnemonic phrase
   */
  private validateMnemonic(mnemonic: string): boolean {
    try {
      // Basic validation - check if it's 12 or 24 words
      const words = mnemonic.trim().split(/\s+/);
      if (words.length !== 12 && words.length !== 24) {
        return false;
      }
      
      // Try to create a wallet to validate the mnemonic
      ethersService.createWalletFromMnemonic(mnemonic);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate private key
   */
  private validatePrivateKey(privateKey: string): boolean {
    try {
      // Remove 0x prefix if present
      const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
      
      // Check if it's 64 hex characters
      if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
        return false;
      }
      
      // Try to create a wallet to validate the key
      ethersService.createWalletFromPrivateKey(privateKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a new wallet with Passkey protection
   */
  async createWallet(name: string = 'Capsula Wallet'): Promise<KeyManagerResult<WalletCreationResult>> {
    try {
      // Check if Passkey is supported
      const isSupported = await passkeyService.isPasskeySupported();
      if (!isSupported) {
        return {
          success: false,
          error: 'Biometric authentication is required to create a wallet',
        };
      }

      // Create wallet using PasskeyService
      const result = await passkeyService.createPasskeyWallet(name);
      
      if (!result.success || !result.wallet) {
        return {
          success: false,
          error: result.error || 'Failed to create wallet',
        };
      }

      // Get the wallet credentials to extract mnemonic
      const credential = await passkeyService.getWalletCredential(result.wallet.id);
      
      if (!credential || !credential.mnemonic) {
        return {
          success: false,
          error: 'Failed to retrieve wallet mnemonic',
        };
      }

      // Create wallet object for database
      const wallet: Wallet = {
        id: result.wallet.id,
        name: result.wallet.name,
        address: result.wallet.address,
        publicKey: '', // Will be derived when needed
        keyRefId: result.wallet.id, // Reference to SecureStore
        isPasskeyBacked: true,
        derivationPath: "m/44'/60'/0'/0/0",
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
      };

      // Add to wallet store
      useWalletStore.getState().addWallet(wallet);
      
      // Set as active wallet if it's the first one
      const { wallets } = useWalletStore.getState();
      if (wallets.length === 1) {
        useWalletStore.getState().setActiveWallet(wallet);
        useAuthStore.getState().setActiveWallet(wallet.id);
      }

      return {
        success: true,
        data: {
          wallet,
          mnemonic: credential.mnemonic,
        },
      };
    } catch (error) {
      console.error('Failed to create wallet:', error);
      return {
        success: false,
        error: 'Failed to create wallet',
      };
    }
  }

  /**
   * Import wallet from mnemonic or private key
   */
  async importWallet(
    importData: { mnemonic?: string; privateKey?: string },
    name: string = 'Imported Wallet'
  ): Promise<KeyManagerResult<WalletImportResult>> {
    try {
      // Validate input
      if (importData.mnemonic) {
        if (!this.validateMnemonic(importData.mnemonic)) {
          return {
            success: false,
            error: 'Invalid recovery phrase. Please check and try again.',
          };
        }
      } else if (importData.privateKey) {
        if (!this.validatePrivateKey(importData.privateKey)) {
          return {
            success: false,
            error: 'Invalid private key. Please check and try again.',
          };
        }
      } else {
        return {
          success: false,
          error: 'Please provide either a recovery phrase or private key.',
        };
      }

      // Import wallet using PasskeyService
      const result = await passkeyService.importWalletWithPasskey(importData, name);
      
      if (!result.success || !result.wallet) {
        return {
          success: false,
          error: result.error || 'Failed to import wallet',
        };
      }

      // Create wallet object for database
      const wallet: Wallet = {
        id: result.wallet.id,
        name: result.wallet.name,
        address: result.wallet.address,
        publicKey: '', // Will be derived when needed
        keyRefId: result.wallet.id, // Reference to SecureStore
        isPasskeyBacked: true,
        derivationPath: "m/44'/60'/0'/0/0",
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
      };

      // Add to wallet store
      useWalletStore.getState().addWallet(wallet);

      return {
        success: true,
        data: { wallet },
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
   * Sign transaction securely
   */
  async signTransaction(
    walletId: string,
    transaction: {
      to: string;
      value?: string;
      data?: string;
      gasLimit?: string;
      gasPrice?: string;
      maxFeePerGas?: string;
      maxPriorityFeePerGas?: string;
    }
  ): Promise<KeyManagerResult<{ transactionHash: string }>> {
    try {
      // Update last accessed time
      useWalletStore.getState().updateWallet(walletId, {
        lastAccessedAt: new Date().toISOString(),
      });

      // Sign transaction using PasskeyService
      const result = await passkeyService.signTransactionWithPasskey(walletId, transaction);
      
      if (!result.success || !result.signedTransaction) {
        return {
          success: false,
          error: result.error || 'Failed to sign transaction',
        };
      }

      return {
        success: true,
        data: { transactionHash: result.signedTransaction },
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
   * Get wallet balance
   */
  async getWalletBalance(walletId: string, chainId?: number): Promise<KeyManagerResult<{ balance: string }>> {
    try {
      const { wallets } = useWalletStore.getState();
      const wallet = wallets.find(w => w.id === walletId);
      
      if (!wallet) {
        return {
          success: false,
          error: 'Wallet not found',
        };
      }

      const balance = await ethersService.getBalance(wallet.address, chainId);
      
      return {
        success: true,
        data: { balance },
      };
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return {
        success: false,
        error: 'Failed to get balance',
      };
    }
  }

  /**
   * Export seed phrase with authentication
   */
  async exportSeedPhrase(walletId: string): Promise<KeyManagerResult<{ mnemonic: string }>> {
    try {
      const result = await passkeyService.exportSeedPhrase(walletId);
      
      if (!result.success || !result.mnemonic) {
        return {
          success: false,
          error: result.error || 'Failed to export seed phrase',
        };
      }

      return {
        success: true,
        data: { mnemonic: result.mnemonic },
      };
    } catch (error) {
      console.error('Failed to export seed phrase:', error);
      return {
        success: false,
        error: 'Failed to export seed phrase',
      };
    }
  }

  /**
   * Delete wallet securely
   */
  async deleteWallet(walletId: string): Promise<KeyManagerResult<void>> {
    try {
      // Remove from PasskeyService (this will prompt for authentication)
      const removed = await passkeyService.removeWalletCredential(walletId);
      
      if (!removed) {
        return {
          success: false,
          error: 'Failed to remove wallet credentials',
        };
      }

      // Remove from wallet store
      useWalletStore.getState().removeWallet(walletId);
      
      // If this was the active wallet, clear it
      const { activeWalletId } = useAuthStore.getState();
      if (activeWalletId === walletId) {
        useAuthStore.getState().setActiveWallet(null);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      return {
        success: false,
        error: 'Failed to delete wallet',
      };
    }
  }

  /**
   * Switch active wallet
   */
  async switchWallet(walletId: string): Promise<KeyManagerResult<void>> {
    try {
      const { wallets } = useWalletStore.getState();
      const wallet = wallets.find(w => w.id === walletId);
      
      if (!wallet) {
        return {
          success: false,
          error: 'Wallet not found',
        };
      }

      // Update stores
      useWalletStore.getState().setActiveWallet(wallet);
      useAuthStore.getState().setActiveWallet(walletId);
      
      // Update last accessed time
      useWalletStore.getState().updateWallet(walletId, {
        lastAccessedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to switch wallet:', error);
      return {
        success: false,
        error: 'Failed to switch wallet',
      };
    }
  }

  /**
   * Validate address format
   */
  validateAddress(address: string): boolean {
    return ethersService.isValidAddress(address);
  }

  /**
   * Generate multiple addresses from wallet
   */
  async generateMultipleAddresses(
    walletId: string,
    count: number = 5
  ): Promise<KeyManagerResult<{ addresses: Array<{ index: number; address: string; path: string }> }>> {
    try {
      const credential = await passkeyService.getWalletCredential(walletId);
      
      if (!credential || !credential.mnemonic) {
        return {
          success: false,
          error: 'Wallet mnemonic not found',
        };
      }

      const addresses = [];
      
      for (let i = 0; i < count; i++) {
        const path = `m/44'/60'/0'/0/${i}`;
        const wallet = ethersService.createWalletFromMnemonic(credential.mnemonic, path);
        
        addresses.push({
          index: i,
          address: wallet.address,
          path,
        });
      }

      return {
        success: true,
        data: { addresses },
      };
    } catch (error) {
      console.error('Failed to generate addresses:', error);
      return {
        success: false,
        error: 'Failed to generate addresses',
      };
    }
  }

  /**
   * Check authentication status
   */
  async checkAuthStatus(): Promise<{
    isAuthenticated: boolean;
    isPasskeyEnabled: boolean;
    lastAuthTime: number | null;
  }> {
    try {
      const isPasskeyEnabled = await passkeyService.isPasskeyEnabled();
      const lastAuthTime = await passkeyService.getLastAuthTime();
      const isAuthenticated = useAuthStore.getState().isAuthenticated;

      return {
        isAuthenticated,
        isPasskeyEnabled,
        lastAuthTime,
      };
    } catch (error) {
      console.error('Failed to check auth status:', error);
      return {
        isAuthenticated: false,
        isPasskeyEnabled: false,
        lastAuthTime: null,
      };
    }
  }
}

// Export singleton instance
export const keyManager = new KeyManager();