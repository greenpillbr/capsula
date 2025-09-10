import type { Token, Transaction, Wallet } from '@/db/schema';
import { ethersService } from '@/lib/blockchain/ethersService';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Callback for wallet changes to avoid circular dependencies
let walletChangeCallback: (() => void) | null = null;

export const setWalletChangeCallback = (callback: () => void) => {
  walletChangeCallback = callback;
};

// Callback to get network store state
let getNetworkStateCallback: (() => any) | null = null;

export const setGetNetworkStateCallback = (callback: () => any) => {
  getNetworkStateCallback = callback;
};

// Callback to force balance update
let forceBalanceUpdateCallback: (() => Promise<void>) | null = null;

export const setForceBalanceUpdateCallback = (callback: () => Promise<void>) => {
  forceBalanceUpdateCallback = callback;
};

const storage = new MMKV();

const zustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};

interface WalletState {
  // Wallet management
  wallets: Wallet[];
  activeWallet: Wallet | null;
  
  // Token balances
  tokens: Token[];
  balances: Record<string, string>; // tokenId -> balance
  totalBalance: string; // in USD
  
  // Recent transactions
  recentTransactions: Transaction[];
  pendingTransactions: Transaction[];
  
  // Loading states
  isLoadingBalance: boolean;
  isLoadingTransactions: boolean;
  lastBalanceUpdate: number | null;
  
  // Actions - Wallet Management
  addWallet: (wallet: Wallet) => void;
  removeWallet: (walletId: string) => void;
  setActiveWallet: (wallet: Wallet | null) => void;
  updateWallet: (walletId: string, updates: Partial<Wallet>) => void;
  
  // Actions - Token Management
  addToken: (token: Token) => void;
  removeToken: (tokenId: string) => void;
  updateTokenBalance: (tokenId: string, balance: string) => void;
  refreshBalances: (forceUpdate?: boolean) => Promise<void>;
  
  // Actions - Transaction Management
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void;
  addPendingTransaction: (transaction: Transaction) => void;
  removePendingTransaction: (transactionId: string) => void;
  
  // Actions - Loading States
  setLoadingBalance: (loading: boolean) => void;
  setLoadingTransactions: (loading: boolean) => void;
  
  // Computed getters
  getActiveWalletBalance: () => string;
  getTokensForActiveWallet: () => Token[];
  getTransactionsForActiveWallet: () => Transaction[];
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      wallets: [],
      activeWallet: null,
      tokens: [],
      balances: {},
      totalBalance: '0',
      recentTransactions: [],
      pendingTransactions: [],
      isLoadingBalance: false,
      isLoadingTransactions: false,
      lastBalanceUpdate: null,
      
      // Wallet Management Actions
      addWallet: (wallet: Wallet) => {
        set((state) => ({
          wallets: [...state.wallets, wallet],
          activeWallet: state.activeWallet || wallet, // Set as active if first wallet
        }));
      },
      
      removeWallet: (walletId: string) => {
        set((state) => ({
          wallets: state.wallets.filter(w => w.id !== walletId),
          activeWallet: state.activeWallet?.id === walletId ? null : state.activeWallet,
        }));
      },
      
      setActiveWallet: (wallet: Wallet | null) => {
        set({ activeWallet: wallet });
        
        // Notify balance monitoring service of wallet change
        if (walletChangeCallback) {
          walletChangeCallback();
        }
      },
      
      updateWallet: (walletId: string, updates: Partial<Wallet>) => {
        set((state) => ({
          wallets: state.wallets.map(w => 
            w.id === walletId ? { ...w, ...updates } : w
          ),
          activeWallet: state.activeWallet?.id === walletId 
            ? { ...state.activeWallet, ...updates }
            : state.activeWallet,
        }));
      },
      
      // Token Management Actions
      addToken: (token: Token) => {
        set((state) => ({
          tokens: [...state.tokens.filter(t => t.id !== token.id), token],
        }));
      },
      
      removeToken: (tokenId: string) => {
        set((state) => ({
          tokens: state.tokens.filter(t => t.id !== tokenId),
          balances: Object.fromEntries(
            Object.entries(state.balances).filter(([id]) => id !== tokenId)
          ),
        }));
      },
      
      updateTokenBalance: (tokenId: string, balance: string) => {
        set((state) => ({
          balances: { ...state.balances, [tokenId]: balance },
          lastBalanceUpdate: Date.now(),
        }));
      },
      
      refreshBalances: async (forceUpdate = false) => {
        const { activeWallet, tokens } = get();
        
        if (!activeWallet || !getNetworkStateCallback) return;
        
        const { activeNetwork } = getNetworkStateCallback();
        if (!activeNetwork) return;
        
        set({ isLoadingBalance: true });
        
        try {
          // Force balance monitor service to update if requested
          if (forceUpdate && forceBalanceUpdateCallback) {
            await forceBalanceUpdateCallback();
          }
          
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
                continue; // Skip unsupported token types
              }

              // Update balance in store
              get().updateTokenBalance(token.id, balance);
              
              //console.log(`💰 Updated ${token.symbol} balance: ${balance}`);
            } catch (error) {
              console.error(`Failed to update balance for token ${token.symbol}:`, error);
            }
          }

          // If no native token exists, create one
          const hasNativeToken = walletTokens.some(t => t.type === 'Native');
          if (!hasNativeToken) {
            const nativeBalance = await ethersService.getBalance(activeWallet.address, activeNetwork.chainId);
            
            const nativeToken: Token = {
              id: `native_${activeWallet.id}_${activeNetwork.chainId}`,
              walletId: activeWallet.id,
              chainId: activeNetwork.chainId,
              contractAddress: null,
              symbol: activeNetwork.nativeCurrencySymbol,
              name: activeNetwork.nativeCurrencyName,
              decimals: activeNetwork.nativeCurrencyDecimals,
              type: 'Native',
              logoUrl: activeNetwork.iconUrl,
              isCustom: false,
              balance: nativeBalance,
              lastBalanceUpdate: new Date().toISOString(),
            };
            
            get().addToken(nativeToken);
            get().updateTokenBalance(nativeToken.id, nativeBalance);
          }
          
          set({
            isLoadingBalance: false,
            lastBalanceUpdate: Date.now(),
          });
        } catch (error) {
          console.error('Failed to refresh balances:', error);
          set({ isLoadingBalance: false });
        }
      },
      
      // Transaction Management Actions
      addTransaction: (transaction: Transaction) => {
        set((state) => ({
          recentTransactions: [transaction, ...state.recentTransactions]
            .slice(0, 50), // Keep only last 50 transactions in memory
        }));
      },
      
      updateTransaction: (transactionId: string, updates: Partial<Transaction>) => {
        set((state) => ({
          recentTransactions: state.recentTransactions.map(tx =>
            tx.id === transactionId ? { ...tx, ...updates } : tx
          ),
          pendingTransactions: state.pendingTransactions.map(tx =>
            tx.id === transactionId ? { ...tx, ...updates } : tx
          ),
        }));
      },
      
      addPendingTransaction: (transaction: Transaction) => {
        set((state) => ({
          pendingTransactions: [...state.pendingTransactions, transaction],
        }));
      },
      
      removePendingTransaction: (transactionId: string) => {
        set((state) => ({
          pendingTransactions: state.pendingTransactions.filter(tx => tx.id !== transactionId),
        }));
      },
      
      // Loading State Actions
      setLoadingBalance: (loading: boolean) => {
        set({ isLoadingBalance: loading });
      },
      
      setLoadingTransactions: (loading: boolean) => {
        set({ isLoadingTransactions: loading });
      },
      
      // Computed getters
      getActiveWalletBalance: () => {
        const { activeWallet, tokens, balances } = get();
        if (!activeWallet) return '0';
        
        // Get native token balance for active wallet
        const nativeToken = tokens.find(
          t => t.walletId === activeWallet.id && t.type === 'Native'
        );
        
        if (nativeToken) {
          return balances[nativeToken.id] || '0';
        }
        
        return '0';
      },
      
      getTokensForActiveWallet: () => {
        const { activeWallet, tokens } = get();
        if (!activeWallet) return [];
        
        return tokens.filter(t => t.walletId === activeWallet.id);
      },
      
      getTransactionsForActiveWallet: () => {
        const { activeWallet, recentTransactions } = get();
        if (!activeWallet) return [];
        
        return recentTransactions.filter(tx => tx.walletId === activeWallet.id);
      },
    }),
    {
      name: 'capsula-wallet',
      storage: createJSONStorage(() => zustandStorage),
      // Persist wallet data but not sensitive transaction details
      partialize: (state) => ({
        wallets: state.wallets,
        activeWallet: state.activeWallet,
        tokens: state.tokens,
        balances: state.balances,
        lastBalanceUpdate: state.lastBalanceUpdate,
      }),
    }
  )
);