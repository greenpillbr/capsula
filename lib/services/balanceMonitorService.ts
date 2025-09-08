import { ethersService } from '@/lib/blockchain/ethersService';
import { setNetworkChangeCallback, useNetworkStore } from '@/lib/stores/networkStore';
import { useWalletStore } from '@/lib/stores/walletStore';
import type { ethers } from 'ethers';
import { AppState, AppStateStatus } from 'react-native';

interface TransactionEvent {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  isIncoming: boolean;
}

class BalanceMonitorService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private listeners: Map<string, () => void> = new Map();
  private appStateSubscription: any = null;
  private isMonitoring = false;
  private pendingTransactions: Map<string, ethers.TransactionResponse> = new Map();
  private lastBalanceUpdate: Map<string, number> = new Map(); // Track last update times
  private isUpdatingBalance = false; // Prevent concurrent balance updates

  constructor() {
    // Register callback with network store to handle network changes
    setNetworkChangeCallback(() => {
      this.onWalletOrNetworkChange();
    });
  }

  /**
   * Start monitoring balances and transactions for the active wallet
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      this.stopMonitoring();
    }

    const { activeWallet } = useWalletStore.getState();
    const { activeNetwork } = useNetworkStore.getState();

    if (!activeWallet || !activeNetwork) {
      console.log('⚠️ Cannot start monitoring: no active wallet or network');
      return;
    }

    console.log(`🔄 Starting balance monitoring for wallet ${activeWallet.address} on ${activeNetwork.name}`);
    
    this.isMonitoring = true;

    // Set up balance polling
    await this.setupBalancePolling(activeWallet.address, activeNetwork.chainId);

    // Set up transaction event listeners
    await this.setupTransactionListeners(activeWallet.address, activeNetwork.chainId);

    // Set up app state monitoring
    this.setupAppStateMonitoring();

    // Initial balance fetch (forced to bypass throttling)
    await this.updateBalance(activeWallet.address, activeNetwork.chainId, true);
  }

  /**
   * Stop all monitoring activities
   */
  stopMonitoring(): void {
    console.log('🛑 Stopping balance monitoring');
    
    this.isMonitoring = false;

    // Clear all intervals
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();

    // Remove all event listeners
    this.listeners.forEach((removeListener) => removeListener());
    this.listeners.clear();

    // Remove app state subscription
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    // Clear pending transactions and throttling maps
    this.pendingTransactions.clear();
    this.lastBalanceUpdate.clear();
    this.isUpdatingBalance = false;
  }

  /**
   * Set up periodic balance polling
   */
  private async setupBalancePolling(address: string, chainId: number): Promise<void> {
    const intervalKey = `balance_${address}_${chainId}`;
    
    // Clear existing interval
    if (this.intervals.has(intervalKey)) {
      clearInterval(this.intervals.get(intervalKey)!);
    }

    // Poll every 30 seconds as requested
    const interval = setInterval(async () => {
      if (this.isMonitoring && !this.isUpdatingBalance) {
        await this.updateBalance(address, chainId);
      }
    }, 30000);

    this.intervals.set(intervalKey, interval);
    console.log(`📊 Balance polling started for ${address} on chain ${chainId}`);
  }

  /**
   * Set up real-time transaction event listeners
   */
  private async setupTransactionListeners(address: string, chainId: number): Promise<void> {
    try {
      const provider = ethersService.getProvider(chainId);
      const listenerKey = `transactions_${address}_${chainId}`;

      // Remove existing listener
      if (this.listeners.has(listenerKey)) {
        this.listeners.get(listenerKey)!();
      }

      // Listen for new blocks to catch transactions
      const onBlock = async (blockNumber: number) => {
        if (!this.isMonitoring) return;
        
        try {
          await this.checkBlockForTransactions(address, blockNumber, chainId);
        } catch (error) {
          console.error('Error checking block for transactions:', error);
        }
      };

      provider.on('block', onBlock);

      // Store cleanup function
      const removeListener = () => {
        provider.off('block', onBlock);
      };
      this.listeners.set(listenerKey, removeListener);

      console.log(`👂 Transaction listener started for ${address} on chain ${chainId}`);
    } catch (error) {
      console.error('Failed to setup transaction listeners:', error);
    }
  }

  /**
   * Check a specific block for transactions involving our wallet
   */
  private async checkBlockForTransactions(
    address: string, 
    blockNumber: number, 
    chainId: number
  ): Promise<void> {
    try {
      const provider = ethersService.getProvider(chainId);
      const block = await provider.getBlock(blockNumber, true);
      
      if (!block || !block.transactions) return;

      for (const tx of block.transactions) {
        // Type guard to ensure tx is a TransactionResponse object
        if (tx && typeof tx === 'object' && 'from' in tx && 'to' in tx) {
          const transaction = tx as ethers.TransactionResponse;
          
          // Check if this transaction involves our wallet
          if (transaction.from === address || transaction.to === address) {
            console.log(`💰 Found transaction for wallet: ${transaction.hash}`);
            await this.handleTransactionEvent({
              hash: transaction.hash,
              from: transaction.from,
              to: transaction.to || '',
              value: ethersService.formatEther(transaction.value),
              blockNumber: blockNumber,
              timestamp: block.timestamp * 1000, // Convert to milliseconds
              isIncoming: transaction.to === address,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking block for transactions:', error);
    }
  }

  /**
   * Handle detected transaction events
   */
  private async handleTransactionEvent(event: TransactionEvent): Promise<void> {
    try {
      const { activeWallet } = useWalletStore.getState();
      const { activeNetwork } = useNetworkStore.getState();
      
      if (!activeWallet || !activeNetwork) return;

      console.log(`🔔 Processing transaction event:`, {
        hash: event.hash,
        isIncoming: event.isIncoming,
        value: event.value,
      });

      // Update balance immediately for incoming transactions
      if (event.isIncoming) {
        await this.updateBalance(activeWallet.address, activeNetwork.chainId);
      }

      // Add transaction to history
      const transaction = {
        id: `tx_${event.hash}_${Date.now()}`,
        walletId: activeWallet.id,
        chainId: activeNetwork.chainId,
        hash: event.hash,
        fromAddress: event.from,
        toAddress: event.to,
        value: event.value,
        gasUsed: '0', // Will be updated when receipt is available
        gasPrice: '0',
        gasLimit: '0',
        blockNumber: event.blockNumber,
        timestamp: new Date(event.timestamp).toISOString(),
        status: 'Confirmed',
        type: 'Native Transfer',
        tokenContractAddress: null,
        tokenSymbol: activeNetwork.nativeCurrencySymbol,
        tokenDecimals: activeNetwork.nativeCurrencyDecimals,
        tokenAmount: event.value,
        memo: null,
        isOutgoing: !event.isIncoming,
      };

      useWalletStore.getState().addTransaction(transaction);
      
      // Trigger notification (placeholder for future notification system)
      this.triggerTransactionNotification(event);

    } catch (error) {
      console.error('Error handling transaction event:', error);
    }
  }

  /**
   * Update wallet balance and detect incoming transactions with throttling
   */
  private async updateBalance(address: string, chainId: number, forceUpdate: boolean = false): Promise<void> {
    const updateKey = `${address}_${chainId}`;
    const now = Date.now();
    const lastUpdate = this.lastBalanceUpdate.get(updateKey) || 0;
    
    // Throttle updates - don't update more than once every 5 seconds (unless forced)
    if (!forceUpdate && now - lastUpdate < 5000) {
      console.log(`⏭️ Skipping balance update for ${address} - too recent`);
      return;
    }

    // Prevent concurrent updates
    if (this.isUpdatingBalance) {
      console.log(`⏭️ Skipping balance update for ${address} - already updating`);
      return;
    }

    try {
      this.isUpdatingBalance = true;
      this.lastBalanceUpdate.set(updateKey, now);

      const { activeWallet, balances } = useWalletStore.getState();
      if (!activeWallet || activeWallet.address !== address) return;

      console.log(`💰 Updating balance for ${address}`);
      
      const newBalance = await ethersService.getBalance(address, chainId);
      
      // Find or create native token entry
      const { tokens } = useWalletStore.getState();
      const nativeToken = tokens.find(
        t => t.walletId === activeWallet.id &&
        t.chainId === chainId &&
        t.type === 'Native'
      );

      let previousBalance = '0';
      
      if (nativeToken) {
        // Get previous balance for comparison
        previousBalance = balances[nativeToken.id] || '0';
        
        // Update existing token balance
        useWalletStore.getState().updateTokenBalance(nativeToken.id, newBalance);
      } else {
        // Create native token entry if it doesn't exist
        const { activeNetwork } = useNetworkStore.getState();
        if (activeNetwork && activeNetwork.chainId === chainId) {
          const newToken = {
            id: `native_${activeWallet.id}_${chainId}`,
            walletId: activeWallet.id,
            chainId: chainId,
            contractAddress: null,
            symbol: activeNetwork.nativeCurrencySymbol,
            name: activeNetwork.nativeCurrencyName,
            decimals: activeNetwork.nativeCurrencyDecimals,
            type: 'Native' as const,
            logoUrl: activeNetwork.iconUrl,
            isCustom: false,
            balance: newBalance,
            lastBalanceUpdate: new Date().toISOString(),
          };
          
          useWalletStore.getState().addToken(newToken);
        }
      }

      // Check for balance increase (potential incoming transaction)
      const prevBalanceNum = parseFloat(previousBalance);
      const newBalanceNum = parseFloat(newBalance);
      
      if (newBalanceNum > prevBalanceNum) {
        console.log(`📈 Balance increased from ${previousBalance} to ${newBalance} - scheduling transaction scan`);
        // Schedule the scan in the next tick to avoid blocking
        setTimeout(() => this.scanForRecentTransactions(address, chainId), 100);
      }

      console.log(`✅ Balance updated: ${newBalance} ${chainId === 1 ? 'ETH' : 'tokens'}`);
    } catch (error) {
      console.error('Failed to update balance:', error);
    } finally {
      this.isUpdatingBalance = false;
    }
  }

  /**
   * Scan for recent transactions when balance increases (throttled)
   */
  private async scanForRecentTransactions(address: string, chainId: number): Promise<void> {
    try {
      console.log(`🔍 Scanning for recent transactions for ${address}`);
      
      const provider = ethersService.getProvider(chainId);
      const currentBlock = await provider.getBlockNumber();
      
      // Scan only last 5 blocks to reduce load
      const startBlock = Math.max(0, currentBlock - 5);
      
      for (let blockNumber = startBlock; blockNumber <= currentBlock; blockNumber++) {
        await this.checkBlockForTransactions(address, blockNumber, chainId);
      }
    } catch (error) {
      console.error('Failed to scan for recent transactions:', error);
    }
  }

  /**
   * Monitor pending transactions for confirmation
   */
  private async monitorPendingTransactions(): Promise<void> {
    const { activeNetwork } = useNetworkStore.getState();
    if (!activeNetwork) return;

    for (const [hash, tx] of this.pendingTransactions.entries()) {
      try {
        const receipt = await ethersService.waitForTransaction(hash, 1, activeNetwork.chainId);
        
        if (receipt) {
          console.log(`✅ Transaction confirmed: ${hash}`);
          
          // Remove from pending
          this.pendingTransactions.delete(hash);
          
          // Update transaction status in store
          useWalletStore.getState().updateTransaction(hash, {
            status: 'Confirmed',
            gasUsed: receipt.gasUsed.toString(),
            blockNumber: receipt.blockNumber,
          });
          
          // Update balance after confirmation
          const { activeWallet } = useWalletStore.getState();
          if (activeWallet) {
            await this.updateBalance(activeWallet.address, activeNetwork.chainId);
          }
        }
      } catch (error) {
        console.error(`Error monitoring transaction ${hash}:`, error);
        // Keep in pending for retry
      }
    }
  }

  /**
   * Set up app state monitoring to pause/resume monitoring
   */
  private setupAppStateMonitoring(): void {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('📱 App became active - resuming balance monitoring');
        // Force immediate balance update when app becomes active
        const { activeWallet } = useWalletStore.getState();
        const { activeNetwork } = useNetworkStore.getState();
        
        if (activeWallet && activeNetwork && this.isMonitoring) {
          this.updateBalance(activeWallet.address, activeNetwork.chainId, true); // Force update when app becomes active
        }
      } else if (nextAppState === 'background') {
        console.log('📱 App went to background - monitoring continues');
        // Keep monitoring in background for a short time
      }
    };

    this.appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  }

  /**
   * Trigger notification for transaction (placeholder)
   */
  private triggerTransactionNotification(event: TransactionEvent): void {
    console.log(`🔔 Transaction notification:`, {
      type: event.isIncoming ? 'Received' : 'Sent',
      amount: event.value,
      hash: event.hash.slice(0, 10) + '...',
    });
    
    // TODO: Integrate with actual notification system
    // This would trigger the bell icon update and push notifications
  }

  /**
   * Add pending transaction to monitor
   */
  addPendingTransaction(txResponse: ethers.TransactionResponse): void {
    this.pendingTransactions.set(txResponse.hash, txResponse);
    console.log(`⏳ Added pending transaction to monitor: ${txResponse.hash}`);
    
    // Start monitoring this specific transaction
    setTimeout(() => {
      this.monitorPendingTransactions();
    }, 1000);
  }

  /**
   * Force immediate balance update (with throttling override)
   */
  async forceBalanceUpdate(): Promise<void> {
    const { activeWallet } = useWalletStore.getState();
    const { activeNetwork } = useNetworkStore.getState();
    
    if (!activeWallet || !activeNetwork) return;
    
    console.log('🔄 Force updating balance...');
    await this.updateBalance(activeWallet.address, activeNetwork.chainId, true);
  }

  /**
   * Update monitoring when wallet or network changes
   */
  async onWalletOrNetworkChange(): Promise<void> {
    if (this.isMonitoring) {
      console.log('🔄 Wallet or network changed - restarting monitoring');
      await this.startMonitoring();
    }
  }

  /**
   * Get monitoring status
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Update token balances for all tokens in the active wallet
   */
  async updateAllTokenBalances(): Promise<void> {
    try {
      const { activeWallet, tokens } = useWalletStore.getState();
      const { activeNetwork } = useNetworkStore.getState();
      
      if (!activeWallet || !activeNetwork) return;

      console.log('🔄 Updating all token balances...');

      // Get tokens for current wallet and network
      const walletTokens = tokens.filter(
        t => t.walletId === activeWallet.id && t.chainId === activeNetwork.chainId
      );

      // Update each token balance
      for (const token of walletTokens) {
        try {
          let balance: string;
          
          if (token.type === 'Native') {
            // Native token balance
            balance = await ethersService.getBalance(activeWallet.address, activeNetwork.chainId);
          } else if (token.contractAddress && token.type === 'ERC20') {
            // ERC-20 token balance
            balance = await ethersService.getTokenBalance(
              token.contractAddress,
              activeWallet.address,
              activeNetwork.chainId
            );
          } else {
            continue; // Skip unsupported token types for now
          }

          // Update balance in store
          useWalletStore.getState().updateTokenBalance(token.id, balance);
          
          console.log(`💰 Updated ${token.symbol} balance: ${balance}`);
        } catch (error) {
          console.error(`Failed to update balance for token ${token.symbol}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to update all token balances:', error);
    }
  }
}

// Export singleton instance
export const balanceMonitorService = new BalanceMonitorService();