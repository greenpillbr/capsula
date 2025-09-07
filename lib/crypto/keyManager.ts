import type { Wallet } from '@/db/schema';
import * as Crypto from 'expo-crypto';
import { passkeyService } from '../auth/passkeyService';
import { pinService } from '../auth/pinService';
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
      // Clean and normalize the mnemonic
      const cleanMnemonic = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
      const words = cleanMnemonic.split(' ');
      
      // Basic validation - check if it's 12 or 24 words
      if (words.length !== 12 && words.length !== 24) {
        console.log('Mnemonic validation failed: wrong word count', words.length);
        return false;
      }
      
      // Check if all words are non-empty
      if (words.some(word => !word || word.length === 0)) {
        console.log('Mnemonic validation failed: empty words found');
        return false;
      }
      
      // Try to create a wallet to validate the mnemonic using ethers.js
      const testWallet = ethersService.createWalletFromMnemonic(cleanMnemonic);
      
      // Additional check - make sure we got a valid address
      if (!testWallet.address || !ethersService.isValidAddress(testWallet.address)) {
        console.log('Mnemonic validation failed: invalid address generated');
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('Mnemonic validation failed with error:', error);
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
   * Import wallet from mnemonic
   */
  async importWallet(
    importData: { mnemonic: string },
    name: string = 'Imported Wallet'
  ): Promise<KeyManagerResult<WalletImportResult>> {
    try {
      // Validate mnemonic
      if (!this.validateMnemonic(importData.mnemonic)) {
        return {
          success: false,
          error: 'Invalid recovery phrase. Please check and try again.',
        };
      }

      // Check if Passkey is supported
      const isPasskeySupported = await passkeyService.isPasskeySupported();
      
      if (isPasskeySupported) {
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
      } else {
        // Import wallet using PIN-based storage (no Passkey)
        return await this.importWalletWithPin(importData, name);
      }
    } catch (error) {
      console.error('Failed to import wallet:', error);
      return {
        success: false,
        error: 'Failed to import wallet',
      };
    }
  }

  /**
   * Import wallet with PIN-based security (fallback when Passkey not available)
   */
  async importWalletWithPin(
    importData: { mnemonic: string },
    name: string = 'Imported Wallet'
  ): Promise<KeyManagerResult<WalletImportResult>> {
    try {
      // Validate mnemonic
      if (!this.validateMnemonic(importData.mnemonic)) {
        return {
          success: false,
          error: 'Invalid recovery phrase. Please check and try again.',
        };
      }

      // Create wallet from mnemonic
      const ethersWallet = ethersService.createWalletFromMnemonic(importData.mnemonic);
      const walletId = this.generateWalletId();

      // Store wallet credentials in SecureStore (without Passkey protection)
      await passkeyService.storeWalletCredential(walletId, {
        privateKey: ethersWallet.privateKey,
        mnemonic: importData.mnemonic,
        address: ethersWallet.address,
      }, true); // Skip auth since we're using PIN instead

      // Create wallet object for database
      const wallet: Wallet = {
        id: walletId,
        name: name,
        address: ethersWallet.address,
        publicKey: ethersWallet.publicKey,
        keyRefId: walletId,
        isPasskeyBacked: false, // PIN-based instead
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
      console.error('Failed to import wallet with PIN:', error);
      return {
        success: false,
        error: 'Failed to import wallet',
      };
    }
  }

  /**
   * Authenticate with PIN for transaction signing
   */
  async authenticateWithPin(pin: string): Promise<KeyManagerResult<void>> {
    try {
      const result = await pinService.validatePin(pin);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'PIN validation failed',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to authenticate with PIN:', error);
      return {
        success: false,
        error: 'PIN authentication failed',
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
      nonce?: number;
      chainId: number;
    }
  ): Promise<KeyManagerResult<{
    signedTransaction: string;
    transactionHash: string;
    signature: { r: string; s: string; v: number };
  }>> {
    try {
      // Update last accessed time
      useWalletStore.getState().updateWallet(walletId, {
        lastAccessedAt: new Date().toISOString(),
      });

      // Get wallet credential
      const credential = await passkeyService.getWalletCredential(walletId);
      if (!credential || !credential.mnemonic) {
        return {
          success: false,
          error: 'Wallet credentials not found',
        };
      }

      // Create ethers wallet from mnemonic
      const { wallets } = useWalletStore.getState();
      const walletData = wallets.find(w => w.id === walletId);
      if (!walletData) {
        return {
          success: false,
          error: 'Wallet not found',
        };
      }

      const ethersWallet = ethersService.createWalletFromMnemonic(
        credential.mnemonic,
        walletData.derivationPath || "m/44'/60'/0'/0/0"
      );

      // Connect wallet to the appropriate provider
      const provider = ethersService.getProvider(transaction.chainId);
      const connectedWallet = ethersWallet.connect(provider);

      // Prepare transaction object
      const txRequest = {
        to: transaction.to,
        value: transaction.value ? ethersService.parseEther(transaction.value) : BigInt(0),
        data: transaction.data || '0x',
        gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined,
        gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : undefined,
        maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : undefined,
        maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? BigInt(transaction.maxPriorityFeePerGas) : undefined,
        nonce: transaction.nonce,
        chainId: transaction.chainId,
      };

      // Sign the transaction
      const signedTx = await connectedWallet.signTransaction(txRequest);
      
      // Parse the signed transaction to get hash and signature components
      const parsedTx = ethersService.parseSignedTransaction(signedTx);
      
      return {
        success: true,
        data: {
          signedTransaction: signedTx,
          transactionHash: parsedTx.hash,
          signature: parsedTx.signature,
        },
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
   * Send a signed transaction
   */
  async sendSignedTransaction(
    signedTransaction: string,
    chainId: number
  ): Promise<KeyManagerResult<{ transactionHash: string; receipt?: any }>> {
    try {
      const txResponse = await ethersService.sendRawTransaction(signedTransaction, chainId);
      
      return {
        success: true,
        data: {
          transactionHash: txResponse.hash,
          receipt: txResponse,
        },
      };
    } catch (error) {
      console.error('Failed to send transaction:', error);
      return {
        success: false,
        error: 'Failed to send transaction',
      };
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateTransactionGas(
    walletId: string,
    transaction: {
      to: string;
      value?: string;
      data?: string;
    },
    chainId: number
  ): Promise<KeyManagerResult<{
    gasLimit: string;
    gasPrice: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  }>> {
    try {
      const { wallets } = useWalletStore.getState();
      const wallet = wallets.find(w => w.id === walletId);
      
      if (!wallet) {
        return {
          success: false,
          error: 'Wallet not found',
        };
      }

      const gasEstimate = await ethersService.estimateGas({
        ...transaction,
        from: wallet.address,
      }, chainId);

      return {
        success: true,
        data: gasEstimate,
      };
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      return {
        success: false,
        error: 'Gas estimation failed',
      };
    }
  }

  /**
   * Get token balance for wallet
   */
  async getTokenBalance(
    walletId: string,
    tokenAddress: string,
    chainId?: number
  ): Promise<KeyManagerResult<{ balance: string; decimals: number; symbol: string }>> {
    try {
      const { wallets } = useWalletStore.getState();
      const wallet = wallets.find(w => w.id === walletId);
      
      if (!wallet) {
        return {
          success: false,
          error: 'Wallet not found',
        };
      }

      const [balance, tokenInfo] = await Promise.all([
        ethersService.getTokenBalance(tokenAddress, wallet.address, chainId),
        ethersService.getTokenInfo(tokenAddress, chainId),
      ]);

      return {
        success: true,
        data: {
          balance,
          decimals: tokenInfo.decimals,
          symbol: tokenInfo.symbol,
        },
      };
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return {
        success: false,
        error: 'Failed to get token balance',
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