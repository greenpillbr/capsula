import type { Network } from '@/db/schema';
import { ethers } from 'ethers';
import * as Crypto from 'expo-crypto';

// Get Infura API key from environment variables (must use EXPO_PUBLIC_ prefix for runtime access)
const INFURA_API_KEY = process.env.EXPO_PUBLIC_INFURA_API_KEY || 'demo_key_replace_with_real_key';

// Network configuration for different chains with fallback RPC endpoints
export const NETWORK_CONFIGS: Record<number, Network> = {
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
    explorerUrl: 'https://etherscan.io',
    nativeCurrencySymbol: 'ETH',
    nativeCurrencyDecimals: 18,
    nativeCurrencyName: 'Ether',
    iconUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    isDefault: true,
    isRecommended: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  42220: {
    chainId: 42220,
    name: 'Celo Mainnet',
    rpcUrl: 'https://forno.celo.org',
    explorerUrl: 'https://explorer.celo.org',
    nativeCurrencySymbol: 'CELO',
    nativeCurrencyDecimals: 18,
    nativeCurrencyName: 'Celo',
    iconUrl: 'https://assets.coingecko.com/coins/images/11090/small/icon-celo-CELO-color-500.png',
    isDefault: true,
    isRecommended: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  100: {
    chainId: 100,
    name: 'Gnosis Chain',
    rpcUrl: 'https://rpc.gnosischain.com',
    explorerUrl: 'https://gnosisscan.io',
    nativeCurrencySymbol: 'xDAI',
    nativeCurrencyDecimals: 18,
    nativeCurrencyName: 'xDAI',
    iconUrl: 'https://assets.coingecko.com/coins/images/11062/small/xdai.png',
    isDefault: true,
    isRecommended: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// Provider management
class EthersService {
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private currentChainId: number = 1; // Default to Ethereum

  /**
   * Get or create a provider for a specific chain with better error handling
   */
  getProvider(chainId: number, rpcUrl?: string): ethers.JsonRpcProvider {
    if (!this.providers.has(chainId)) {
      const config = NETWORK_CONFIGS[chainId];
      const url = rpcUrl || config?.rpcUrl;
      
      if (!url) {
        throw new Error(`No RPC URL configured for chain ${chainId}`);
      }

      const provider = new ethers.JsonRpcProvider(url, {
        chainId,
        name: config?.name || `Chain ${chainId}`,
      });

      this.providers.set(chainId, provider);
    }

    return this.providers.get(chainId)!;
  }

  /**
   * Switch to a different network
   */
  async switchNetwork(chainId: number): Promise<boolean> {
    try {
      const provider = this.getProvider(chainId);
      const network = await provider.getNetwork();
      
      if (Number(network.chainId) === chainId) {
        this.currentChainId = chainId;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to switch to network ${chainId}:`, error);
      return false;
    }
  }

  /**
   * Get current active provider
   */
  getCurrentProvider(): ethers.JsonRpcProvider {
    return this.getProvider(this.currentChainId);
  }

  /**
   * Get balance for an address with improved error handling
   */
  async getBalance(address: string, chainId?: number): Promise<string> {
    try {
      const targetChainId = chainId || this.currentChainId;
      const provider = this.getProvider(targetChainId);
      
      // Test provider connection first
      try {
        const network = await provider.getNetwork();
        console.log(`✅ Connected to ${network.name} (${network.chainId})`);
      } catch (networkError) {
        console.error('❌ Network connection failed:', networkError);
        throw new Error('Unable to connect to network');
      }
      
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      
      return formattedBalance;
    } catch (error) {
      console.error('❌ Failed to get balance:', {
        error: error instanceof Error ? error.message : error,
        address,
        chainId: chainId || this.currentChainId
      });
      return '0';
    }
  }

  /**
   * Get ERC-20 token balance
   */
  async getTokenBalance(
    tokenAddress: string,
    walletAddress: string,
    chainId?: number
  ): Promise<string> {
    try {
      const provider = chainId ? this.getProvider(chainId) : this.getCurrentProvider();
      
      // ERC-20 ABI for balanceOf function
      const erc20Abi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ];
      
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      const [balance, decimals] = await Promise.all([
        tokenContract.balanceOf(walletAddress),
        tokenContract.decimals(),
      ]);
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return '0';
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(transaction: {
    to: string;
    value?: string;
    data?: string;
    from?: string;
  }, chainId?: number): Promise<{
    gasLimit: string;
    gasPrice: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  }> {
    try {
      const provider = chainId ? this.getProvider(chainId) : this.getCurrentProvider();
      
      // Get current gas price
      const feeData = await provider.getFeeData();
      
      // Estimate gas limit
      const gasLimit = await provider.estimateGas({
        to: transaction.to,
        value: transaction.value ? ethers.parseEther(transaction.value) : 0,
        data: transaction.data || '0x',
        from: transaction.from,
      });

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: feeData.gasPrice?.toString() || '0',
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
      };
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      throw error;
    }
  }

  /**
   * Send a transaction
   */
  async sendTransaction(
    signer: ethers.Signer,
    transaction: {
      to: string;
      value?: string;
      data?: string;
      gasLimit?: string;
      gasPrice?: string;
      maxFeePerGas?: string;
      maxPriorityFeePerGas?: string;
    }
  ): Promise<ethers.TransactionResponse> {
    try {
      const tx = await signer.sendTransaction({
        to: transaction.to,
        value: transaction.value ? ethers.parseEther(transaction.value) : 0,
        data: transaction.data || '0x',
        gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined,
        gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : undefined,
        maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : undefined,
        maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? BigInt(transaction.maxPriorityFeePerGas) : undefined,
      });

      return tx;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    txHash: string,
    confirmations: number = 1,
    chainId?: number
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      const provider = chainId ? this.getProvider(chainId) : this.getCurrentProvider();
      return await provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      console.error('Failed to wait for transaction:', error);
      return null;
    }
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(
    address: string,
    fromBlock: number = 0,
    toBlock: number | string = 'latest',
    chainId?: number
  ): Promise<ethers.TransactionResponse[]> {
    try {
      const provider = chainId ? this.getProvider(chainId) : this.getCurrentProvider();
      
      // This is a basic implementation - in production you'd want to use
      // indexing services like The Graph or Alchemy for better performance
      const currentBlock = await provider.getBlockNumber();
      const startBlock = Math.max(fromBlock, currentBlock - 100); // Limit to last 100 blocks for performance
      
      const transactions: ethers.TransactionResponse[] = [];
      
      for (let i = startBlock; i <= currentBlock; i++) {
        try {
          const block = await provider.getBlock(i, true);
          if (block && block.transactions) {
            for (const tx of block.transactions) {
              // Type guard to ensure tx is a TransactionResponse object
              if (tx && typeof tx === 'object' && 'from' in tx && 'to' in tx) {
                const transaction = tx as ethers.TransactionResponse;
                if (transaction.from === address || transaction.to === address) {
                  transactions.push(transaction);
                }
              }
            }
          }
        } catch (blockError) {
          // Skip failed blocks
          console.warn(`Failed to get block ${i}:`, blockError);
          continue;
        }
      }
      
      return transactions.reverse(); // Most recent first
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  /**
   * Create a wallet from mnemonic
   */
  createWalletFromMnemonic(mnemonic: string, path: string = "m/44'/60'/0'/0/0"): ethers.HDNodeWallet {
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    return wallet.derivePath(path);
  }

  /**
   * Create a wallet from private key
   */
  createWalletFromPrivateKey(privateKey: string): ethers.Wallet {
    return new ethers.Wallet(privateKey);
  }

  /**
   * Generate a new random wallet using expo-crypto for React Native compatibility
   */
  generateRandomWallet(): ethers.HDNodeWallet {
    try {
      // Generate secure random bytes using expo-crypto
      const randomBytes = Crypto.getRandomBytes(32);
      
      // Convert to hex string
      const privateKeyHex = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const privateKey = '0x' + privateKeyHex;
      
      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey);
      
      // Create HD wallet with mnemonic
      const mnemonic = ethers.Mnemonic.fromEntropy(randomBytes);
      const hdNode = ethers.HDNodeWallet.fromMnemonic(mnemonic);
      
      return hdNode;
    } catch (error) {
      console.error('Failed to generate random wallet:', error);
      throw new Error('Failed to generate secure wallet');
    }
  }

  /**
   * Connect wallet to a provider
   */
  connectWallet(wallet: ethers.Wallet, chainId?: number): ethers.Wallet {
    const provider = chainId ? this.getProvider(chainId) : this.getCurrentProvider();
    return wallet.connect(provider);
  }

  /**
   * Validate an Ethereum address
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Get network information
   */
  async getNetworkInfo(chainId?: number): Promise<ethers.Network> {
    const provider = chainId ? this.getProvider(chainId) : this.getCurrentProvider();
    return await provider.getNetwork();
  }

  /**
   * Format wei to ether
   */
  formatEther(wei: string | bigint): string {
    return ethers.formatEther(wei);
  }

  /**
   * Parse ether to wei
   */
  parseEther(ether: string): bigint {
    return ethers.parseEther(ether);
  }

  /**
   * Format units with custom decimals
   */
  formatUnits(value: string | bigint, decimals: number): string {
    return ethers.formatUnits(value, decimals);
  }

  /**
   * Call a contract function (write operation)
   */
  async callContract(
    chainId: number,
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[] = [],
    value?: string,
    signer?: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    try {
      const provider = this.getProvider(chainId);
      const contract = new ethers.Contract(contractAddress, abi, signer || provider);
      
      const options: any = {};
      if (value) {
        options.value = ethers.parseEther(value);
      }
      
      return await contract[functionName](...args, options);
    } catch (error) {
      console.error(`Failed to call contract function ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Read from a contract (view/pure function)
   */
  async readContract(
    chainId: number,
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[] = [],
    blockTag?: string | number
  ): Promise<any> {
    try {
      const provider = this.getProvider(chainId);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      
      if (blockTag) {
        return await contract[functionName](...args, { blockTag });
      }
      
      return await contract[functionName](...args);
    } catch (error) {
      console.error(`Failed to read contract function ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Get ERC-20 token information
   */
  async getTokenInfo(
    tokenAddress: string,
    chainId?: number
  ): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    try {
      const provider = chainId ? this.getProvider(chainId) : this.getCurrentProvider();
      
      const erc20Abi = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)',
      ];
      
      const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
      ]);
      
      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
      };
    } catch (error) {
      console.error('Failed to get token info:', error);
      throw error;
    }
  }

  /**
   * Send raw signed transaction
   */
  async sendRawTransaction(
    signedTransaction: string,
    chainId?: number
  ): Promise<ethers.TransactionResponse> {
    try {
      const provider = chainId ? this.getProvider(chainId) : this.getCurrentProvider();
      return await provider.broadcastTransaction(signedTransaction);
    } catch (error) {
      console.error('Failed to send raw transaction:', error);
      throw error;
    }
  }

  /**
   * Create a contract instance
   */
  createContract(
    contractAddress: string,
    abi: any[],
    signerOrProvider?: ethers.Signer | ethers.Provider,
    chainId?: number
  ): ethers.Contract {
    const provider = chainId ? this.getProvider(chainId) : this.getCurrentProvider();
    return new ethers.Contract(contractAddress, abi, signerOrProvider || provider);
  }

  /**
   * Parse transaction receipt logs
   */
  parseTransactionLogs(
    receipt: ethers.TransactionReceipt,
    contractInterface: ethers.Interface
  ): ethers.LogDescription[] {
    try {
      return receipt.logs
        .map(log => {
          try {
            return contractInterface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((log): log is ethers.LogDescription => log !== null);
    } catch (error) {
      console.error('Failed to parse transaction logs:', error);
      return [];
    }
  }

  /**
   * Parse a signed transaction to get details
   */
  parseSignedTransaction(signedTx: string): {
    hash: string;
    signature: { r: string; s: string; v: number };
    to: string;
    value: string;
    data: string;
    gasLimit: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce: number;
    chainId: number;
  } {
    try {
      const parsedTx = ethers.Transaction.from(signedTx);
      
      return {
        hash: parsedTx.hash || '',
        signature: {
          r: parsedTx.signature?.r || '0x0',
          s: parsedTx.signature?.s || '0x0',
          v: parsedTx.signature?.v || 27,
        },
        to: parsedTx.to || '',
        value: parsedTx.value?.toString() || '0',
        data: parsedTx.data || '0x',
        gasLimit: parsedTx.gasLimit?.toString() || '0',
        gasPrice: parsedTx.gasPrice?.toString(),
        maxFeePerGas: parsedTx.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: parsedTx.maxPriorityFeePerGas?.toString(),
        nonce: parsedTx.nonce || 0,
        chainId: Number(parsedTx.chainId) || 1,
      };
    } catch (error) {
      console.error('Failed to parse signed transaction:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const ethersService = new EthersService();

// Export types
export type { ethers };
