import type { Network } from "@/db/schema";
import { useNetworkStore } from "@/lib/stores/networkStore";
import { ethers, isError } from "ethers";
import * as Crypto from "expo-crypto";

// Get Infura API key from environment variables (must use EXPO_PUBLIC_ prefix for runtime access)
const INFURA_API_KEY =
  process.env.EXPO_PUBLIC_INFURA_API_KEY || "demo_key_replace_with_real_key";

const INFURA_ETHEREUM_HTTP_RPC = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;
const INFURA_CELO_HTTP_RPC = `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}`;

function normalizeRpcUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function infuraHttpFallbackUrl(chainId: number): string | undefined {
  if (chainId === 1) {
    return INFURA_ETHEREUM_HTTP_RPC;
  }
  if (chainId === 42220) {
    return INFURA_CELO_HTTP_RPC;
  }
  return undefined;
}

/** True when the primary RPC hit limits or transient infra errors — retry via Infura HTTP. */
function isRetryableRpcError(error: unknown): boolean {
  if (isError(error, "CALL_EXCEPTION") || isError(error, "INVALID_ARGUMENT")) {
    return false;
  }
  if (
    isError(error, "SERVER_ERROR") ||
    isError(error, "TIMEOUT") ||
    isError(error, "NETWORK_ERROR")
  ) {
    return true;
  }
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("too many requests") ||
    msg.includes("rate limit") ||
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("504") ||
    msg.includes("timeout") ||
    msg.includes("econnreset") ||
    msg.includes("fetch failed") ||
    msg.includes("-32005") ||
    msg.includes("-32016")
  );
}

// Network configuration for different chains with fallback RPC endpoints
export const NETWORK_CONFIGS: Record<number, Network> = {
  1: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl:
      process.env.EXPO_PUBLIC_ETHEREUM_RPC_URL?.trim() ||
      INFURA_ETHEREUM_HTTP_RPC,
    explorerUrl: "https://etherscan.io",
    nativeCurrencySymbol: "ETH",
    nativeCurrencyDecimals: 18,
    nativeCurrencyName: "Ether",
    iconUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    isDefault: true,
    isRecommended: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  42220: {
    chainId: 42220,
    name: "Celo Mainnet",
    rpcUrl:
      process.env.EXPO_PUBLIC_CELO_RPC_URL?.trim() || "https://forno.celo.org",
    explorerUrl: "https://explorer.celo.org",
    nativeCurrencySymbol: "CELO",
    nativeCurrencyDecimals: 18,
    nativeCurrencyName: "Celo",
    iconUrl:
      "https://assets.coingecko.com/coins/images/11090/small/icon-celo-CELO-color-500.png",
    isDefault: true,
    isRecommended: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  100: {
    chainId: 100,
    name: "Gnosis Chain",
    rpcUrl:
      process.env.EXPO_PUBLIC_GNOSIS_RPC_URL || "https://rpc.gnosischain.com",
    explorerUrl: "https://gnosisscan.io",
    nativeCurrencySymbol: "xDAI",
    nativeCurrencyDecimals: 18,
    nativeCurrencyName: "xDAI",
    iconUrl: "https://assets.coingecko.com/coins/images/11062/small/xdai.png",
    isDefault: true,
    isRecommended: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

/** Slower HTTP polling when WebSocket is not used (block events / network sync). */
const JSON_RPC_POLLING_INTERVAL_MS = 12_000;

// Provider management
class EthersService {
  private providers: Map<
    number,
    ethers.JsonRpcProvider | ethers.WebSocketProvider
  > = new Map();
  private currentChainId: number = 1; // Default to Ethereum
  private instrumentedProviders = new WeakSet<
    ethers.JsonRpcProvider | ethers.WebSocketProvider
  >();

  private resolveWsUrl(chainId: number): string | undefined {
    if (chainId === 42220) {
      const explicit = process.env.EXPO_PUBLIC_CELO_WS_URL;
      return explicit?.trim() || undefined;
    }
    if (chainId === 1) {
      const wss = process.env.EXPO_PUBLIC_ETHEREUM_WS_URL?.trim();
      return wss || undefined;
    }
    if (chainId === 100) {
      const wss = process.env.EXPO_PUBLIC_GNOSIS_WS_URL?.trim();
      return wss || undefined;
    }
    return undefined;
  }

  private instrumentProvider(
    provider: ethers.JsonRpcProvider | ethers.WebSocketProvider,
    chainId: number,
    url: string,
  ) {
    if (this.instrumentedProviders.has(provider)) {
      return;
    }

    const originalSend = provider.send.bind(provider);
    provider.send = async (method: string, params: any[]) => {
      const startedAt = Date.now();
      console.log("[RPC Request]", {
        chainId,
        method,
        paramsCount: Array.isArray(params) ? params.length : 0,
        rpcUrl: url,
        timestamp: new Date(startedAt).toISOString(),
      });

      try {
        const result = await originalSend(method, params);
        console.log("[RPC Response]", {
          chainId,
          method,
          rpcUrl: url,
          durationMs: Date.now() - startedAt,
          success: true,
        });
        return result;
      } catch (error) {
        console.log("[RPC Response]", {
          chainId,
          method,
          rpcUrl: url,
          durationMs: Date.now() - startedAt,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown RPC error",
        });
        throw error;
      }
    };

    this.instrumentedProviders.add(provider);
  }

  /** Retry the same JSON-RPC call over Infura HTTP after rate limits / transient errors. */
  private attachInfuraHttpFallback(
    primary: ethers.JsonRpcProvider,
    fallbackUrl: string,
    chainId: number,
    primaryUrl: string,
    network: { chainId: number; name: string },
  ) {
    const fallbackProvider = new ethers.JsonRpcProvider(fallbackUrl, network);
    fallbackProvider.pollingInterval = JSON_RPC_POLLING_INTERVAL_MS;
    const primarySend = primary.send.bind(primary);
    primary.send = async (method: string, params: any[]) => {
      try {
        return await primarySend(method, params);
      } catch (error) {
        if (!isRetryableRpcError(error)) {
          throw error;
        }
        console.warn("[RPC] Primary endpoint failed; retrying via Infura HTTP", {
          chainId,
          method,
          primaryUrl,
          fallbackUrl,
          error: error instanceof Error ? error.message : error,
        });
        return await fallbackProvider.send(method, params);
      }
    };
  }

  /**
   * Get or create a provider for a specific chain with better error handling
   */
  getProvider(
    chainId: number,
    rpcUrl?: string,
  ): ethers.JsonRpcProvider | ethers.WebSocketProvider {
    if (!this.providers.has(chainId)) {
      let config = NETWORK_CONFIGS[chainId];
      let url = rpcUrl || config?.rpcUrl;

      // If no hardcoded config, check the networkStore for custom networks
      if (!url) {
        try {
          const networkState = useNetworkStore.getState();
          const customNetwork = networkState.networks.find(
            (n) => n.chainId === chainId,
          );
          if (customNetwork) {
            config = customNetwork;
            url = customNetwork.rpcUrl;
          }
        } catch (error) {
          console.error("Failed to get network from store:", error);
        }
      }

      if (!url) {
        throw new Error(`No RPC URL configured for chain ${chainId}`);
      }

      const network = {
        chainId,
        name: config?.name || `Chain ${chainId}`,
      };

      const wsUrl = config ? this.resolveWsUrl(chainId) : undefined;
      let provider: ethers.JsonRpcProvider | ethers.WebSocketProvider;

      if (wsUrl) {
        // Pass a WebSocket factory so we can attach a `close` listener that
        // evicts the cached provider, forcing a fresh socket on the next use.
        const wsFactory = () => {
          const ws = new WebSocket(wsUrl);
          const evict = () => {
            if (this.providers.get(chainId) === provider) {
              this.providers.delete(chainId);
            }
          };
          if (typeof (ws as any).addEventListener === "function") {
            (ws as any).addEventListener("close", evict);
            (ws as any).addEventListener("error", evict);
          }
          return ws as unknown as ethers.WebSocketLike;
        };
        provider = new ethers.WebSocketProvider(wsFactory, network);
        this.instrumentProvider(provider, chainId, wsUrl);
      } else {
        provider = new ethers.JsonRpcProvider(url, network);
        provider.pollingInterval = JSON_RPC_POLLING_INTERVAL_MS;

        const infuraFallback = infuraHttpFallbackUrl(chainId);
        if (
          rpcUrl === undefined &&
          infuraFallback &&
          normalizeRpcUrl(url) !== normalizeRpcUrl(infuraFallback)
        ) {
          this.attachInfuraHttpFallback(
            provider,
            infuraFallback,
            chainId,
            url,
            network,
          );
        }

        this.instrumentProvider(provider, chainId, url);
      }

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
  getCurrentProvider(): ethers.JsonRpcProvider | ethers.WebSocketProvider {
    return this.getProvider(this.currentChainId);
  }

  /**
   * Get balance for an address with improved error handling
   */
  async getBalance(address: string, chainId?: number): Promise<string> {
    try {
      const targetChainId = chainId || this.currentChainId;
      const provider = this.getProvider(targetChainId);

      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);

      return formattedBalance;
    } catch (error) {
      console.error("❌ Failed to get balance:", {
        error: error instanceof Error ? error.message : error,
        address,
        chainId: chainId || this.currentChainId,
      });
      return "0";
    }
  }

  /**
   * Get ERC-20 token balance
   */
  async getTokenBalance(
    tokenAddress: string,
    walletAddress: string,
    chainId?: number,
  ): Promise<string> {
    try {
      const provider = chainId
        ? this.getProvider(chainId)
        : this.getCurrentProvider();

      // ERC-20 ABI for balanceOf function
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];

      const tokenContract = new ethers.Contract(
        tokenAddress,
        erc20Abi,
        provider,
      );
      const [balance, decimals] = await Promise.all([
        tokenContract.balanceOf(walletAddress),
        tokenContract.decimals(),
      ]);

      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Failed to get token balance:", error);
      return "0";
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(
    transaction: {
      to: string;
      value?: string;
      data?: string;
      from?: string;
    },
    chainId?: number,
  ): Promise<{
    gasLimit: string;
    gasPrice: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  }> {
    try {
      const provider = chainId
        ? this.getProvider(chainId)
        : this.getCurrentProvider();

      // Get current gas price
      const feeData = await provider.getFeeData();

      // Estimate gas limit
      const gasLimit = await provider.estimateGas({
        to: transaction.to,
        value: transaction.value ? ethers.parseEther(transaction.value) : 0,
        data: transaction.data || "0x",
        from: transaction.from,
      });

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: feeData.gasPrice?.toString() || "0",
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
      };
    } catch (error) {
      console.error("Failed to estimate gas:", error);
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
    },
  ): Promise<ethers.TransactionResponse> {
    try {
      const tx = await signer.sendTransaction({
        to: transaction.to,
        value: transaction.value ? ethers.parseEther(transaction.value) : 0,
        data: transaction.data || "0x",
        gasLimit: transaction.gasLimit
          ? BigInt(transaction.gasLimit)
          : undefined,
        gasPrice: transaction.gasPrice
          ? BigInt(transaction.gasPrice)
          : undefined,
        maxFeePerGas: transaction.maxFeePerGas
          ? BigInt(transaction.maxFeePerGas)
          : undefined,
        maxPriorityFeePerGas: transaction.maxPriorityFeePerGas
          ? BigInt(transaction.maxPriorityFeePerGas)
          : undefined,
      });

      return tx;
    } catch (error) {
      console.error("Failed to send transaction:", error);
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    txHash: string,
    confirmations: number = 1,
    chainId?: number,
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      const provider = chainId
        ? this.getProvider(chainId)
        : this.getCurrentProvider();
      return await provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      console.error("Failed to wait for transaction:", error);
      return null;
    }
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(
    address: string,
    fromBlock: number = 0,
    toBlock: number | string = "latest",
    chainId?: number,
  ): Promise<ethers.TransactionResponse[]> {
    try {
      const provider = chainId
        ? this.getProvider(chainId)
        : this.getCurrentProvider();

      // This is a basic implementation - in production you'd want to use
      // indexing services like The Graph or Alchemy for better performance
      const currentBlock = await provider.getBlockNumber();
      const startBlock = Math.max(fromBlock, currentBlock - 20); // Limit to last 20 blocks for performance

      const transactions: ethers.TransactionResponse[] = [];

      for (let i = startBlock; i <= currentBlock; i++) {
        try {
          const block = await provider.getBlock(i, true);
          if (block && block.transactions) {
            for (const tx of block.transactions) {
              // Type guard to ensure tx is a TransactionResponse object
              if (tx && typeof tx === "object" && "from" in tx && "to" in tx) {
                const transaction = tx as ethers.TransactionResponse;
                if (
                  transaction.from === address ||
                  transaction.to === address
                ) {
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
      console.error("Failed to get transaction history:", error);
      return [];
    }
  }

  /**
   * Create a wallet from mnemonic
   */
  createWalletFromMnemonic(
    mnemonic: string,
    path: string = "m/44'/60'/0'/0/0",
  ): ethers.HDNodeWallet {
    try {
      // Clean and normalize mnemonic
      const cleanMnemonic = mnemonic.trim().toLowerCase().replace(/\s+/g, " ");

      // Create mnemonic object first to validate
      const mnemonicObj = ethers.Mnemonic.fromPhrase(cleanMnemonic);

      // Create HD wallet from mnemonic
      const hdWallet = ethers.HDNodeWallet.fromMnemonic(mnemonicObj, path);

      return hdWallet;
    } catch (error) {
      console.error("Failed to create wallet from mnemonic:", error);
      throw new Error("Invalid mnemonic phrase");
    }
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
      // Generate secure random bytes using expo-crypto (16 bytes = 128 bits for mnemonic)
      const randomBytes = Crypto.getRandomBytes(16);

      // Create HD wallet with mnemonic from entropy
      const mnemonic = ethers.Mnemonic.fromEntropy(randomBytes);
      const hdNode = ethers.HDNodeWallet.fromMnemonic(mnemonic);

      return hdNode;
    } catch (error) {
      console.error("Failed to generate random wallet:", error);
      throw new Error("Failed to generate secure wallet");
    }
  }

  /**
   * Connect wallet to a provider
   */
  connectWallet(wallet: ethers.Wallet, chainId?: number): ethers.Wallet {
    const provider = chainId
      ? this.getProvider(chainId)
      : this.getCurrentProvider();
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
    const provider = chainId
      ? this.getProvider(chainId)
      : this.getCurrentProvider();
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
    signer?: ethers.Signer,
  ): Promise<ethers.TransactionResponse> {
    try {
      const provider = this.getProvider(chainId);
      const contract = new ethers.Contract(
        contractAddress,
        abi,
        signer || provider,
      );

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
    blockTag?: string | number,
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
    chainId?: number,
  ): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    try {
      const provider = chainId
        ? this.getProvider(chainId)
        : this.getCurrentProvider();

      const erc20Abi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
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
      console.error("Failed to get token info:", error);
      throw error;
    }
  }

  /**
   * Send raw signed transaction
   */
  async sendRawTransaction(
    signedTransaction: string,
    chainId?: number,
  ): Promise<ethers.TransactionResponse> {
    try {
      const provider = chainId
        ? this.getProvider(chainId)
        : this.getCurrentProvider();
      return await provider.broadcastTransaction(signedTransaction);
    } catch (error) {
      console.error("Failed to send raw transaction:", error);
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
    chainId?: number,
  ): ethers.Contract {
    const provider = chainId
      ? this.getProvider(chainId)
      : this.getCurrentProvider();
    return new ethers.Contract(
      contractAddress,
      abi,
      signerOrProvider || provider,
    );
  }

  /**
   * Parse transaction receipt logs
   */
  parseTransactionLogs(
    receipt: ethers.TransactionReceipt,
    contractInterface: ethers.Interface,
  ): ethers.LogDescription[] {
    try {
      return receipt.logs
        .map((log) => {
          try {
            return contractInterface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((log): log is ethers.LogDescription => log !== null);
    } catch (error) {
      console.error("Failed to parse transaction logs:", error);
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
        hash: parsedTx.hash || "",
        signature: {
          r: parsedTx.signature?.r || "0x0",
          s: parsedTx.signature?.s || "0x0",
          v: parsedTx.signature?.v || 27,
        },
        to: parsedTx.to || "",
        value: parsedTx.value?.toString() || "0",
        data: parsedTx.data || "0x",
        gasLimit: parsedTx.gasLimit?.toString() || "0",
        gasPrice: parsedTx.gasPrice?.toString(),
        maxFeePerGas: parsedTx.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: parsedTx.maxPriorityFeePerGas?.toString(),
        nonce: parsedTx.nonce || 0,
        chainId: Number(parsedTx.chainId) || 1,
      };
    } catch (error) {
      console.error("Failed to parse signed transaction:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const ethersService = new EthersService();

// Export types
export type { ethers };
