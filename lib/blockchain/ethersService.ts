import type { Network } from '@/db/schema';
import { ethers } from 'ethers';

// Get Infura API key from environment variables
const INFURA_API_KEY = process.env.INFURA_API_KEY || 'demo_key_replace_with_real_key';

// Network configuration for different chains
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
   * Get or create a provider for a specific chain
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
   * Get balance for an address
   */
  async getBalance(address: string, chainId?: number): Promise<string> {
    try {
      const provider = chainId ? this.getProvider(chainId) : this.getCurrentProvider();
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
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
   * Generate a new random wallet
   */
  generateRandomWallet(): ethers.HDNodeWallet {
    return ethers.Wallet.createRandom();
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
}

// Export singleton instance
export const ethersService = new EthersService();

// Export types
export type { ethers };
