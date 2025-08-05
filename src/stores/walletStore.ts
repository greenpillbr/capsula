import { DEFAULT_NETWORK, NETWORKS } from '@/constants'
import { Account, Network, TokenBalance, Transaction } from '@/types'
import { ethers } from 'ethers'
import * as SecureStore from 'expo-secure-store'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface WalletState {
  // Wallet state
  isInitialized: boolean
  isUnlocked: boolean
  accounts: Account[]
  activeAccountId: string | null
  currentNetwork: Network
  
  // Balances and transactions
  balances: Record<string, TokenBalance[]>
  transactions: Record<string, Transaction[]>
  
  // Loading states
  isLoading: boolean
  isCreatingWallet: boolean
  isImportingWallet: boolean
  
  // Actions
  initializeWallet: () => Promise<void>
  createWallet: (name: string) => Promise<string>
  importWallet: (seedPhrase: string, name: string) => Promise<string>
  unlockWallet: (passcode?: string) => Promise<boolean>
  lockWallet: () => void
  
  // Account management
  addAccount: (name: string) => Promise<Account>
  setActiveAccount: (accountId: string) => void
  getActiveAccount: () => Account | null
  
  // Network management
  switchNetwork: (chainId: number) => Promise<void>
  
  // Balance and transaction management
  refreshBalances: (accountId?: string) => Promise<void>
  refreshTransactions: (accountId?: string) => Promise<void>
  
  // Transaction sending
  sendTransaction: (params: {
    to: string
    value: string
    data?: string
    gasLimit?: string
    gasPrice?: string
  }) => Promise<string>
}

// Secure storage adapter for Zustand persist
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name)
    } catch {
      return null
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value)
    } catch (error) {
      console.error('Error saving to secure store:', error)
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name)
    } catch (error) {
      console.error('Error removing from secure store:', error)
    }
  },
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      isInitialized: false,
      isUnlocked: false,
      accounts: [],
      activeAccountId: null,
      currentNetwork: DEFAULT_NETWORK,
      balances: {},
      transactions: {},
      isLoading: false,
      isCreatingWallet: false,
      isImportingWallet: false,

      // Initialize wallet on app start
      initializeWallet: async () => {
        set({ isLoading: true })
        
        try {
          // Check if wallet exists in secure storage
          const encryptedWallet = await SecureStore.getItemAsync('wallet_data')
          
          if (encryptedWallet) {
            set({ isInitialized: true })
          }
        } catch (error) {
          console.error('Error initializing wallet:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Create new wallet
      createWallet: async (name: string) => {
        set({ isCreatingWallet: true })
        
        try {
          // Generate new wallet
          const wallet = ethers.Wallet.createRandom()
          const account: Account = {
            id: `account_${Date.now()}`,
            address: wallet.address,
            name,
            isActive: true,
            derivationPath: "m/44'/60'/0'/0/0",
          }

          // Encrypt and store wallet
          const walletData = {
            mnemonic: wallet.mnemonic?.phrase,
            accounts: [account],
          }
          
          await SecureStore.setItemAsync('wallet_data', JSON.stringify(walletData))
          
          set({
            isInitialized: true,
            isUnlocked: true,
            accounts: [account],
            activeAccountId: account.id,
          })

          return wallet.mnemonic?.phrase || ''
        } catch (error) {
          console.error('Error creating wallet:', error)
          throw error
        } finally {
          set({ isCreatingWallet: false })
        }
      },

      // Import existing wallet
      importWallet: async (seedPhrase: string, name: string) => {
        set({ isImportingWallet: true })
        
        try {
          // Validate and create wallet from seed phrase
          const wallet = ethers.Wallet.fromPhrase(seedPhrase)
          const account: Account = {
            id: `account_${Date.now()}`,
            address: wallet.address,
            name,
            isActive: true,
            derivationPath: "m/44'/60'/0'/0/0",
          }

          // Encrypt and store wallet
          const walletData = {
            mnemonic: seedPhrase,
            accounts: [account],
          }
          
          await SecureStore.setItemAsync('wallet_data', JSON.stringify(walletData))
          
          set({
            isInitialized: true,
            isUnlocked: true,
            accounts: [account],
            activeAccountId: account.id,
          })

          return seedPhrase
        } catch (error) {
          console.error('Error importing wallet:', error)
          throw error
        } finally {
          set({ isImportingWallet: false })
        }
      },

      // Unlock wallet
      unlockWallet: async (passcode?: string) => {
        try {
          // In a real implementation, you would verify the passcode here
          // For now, we'll just check if wallet data exists
          const walletData = await SecureStore.getItemAsync('wallet_data')
          
          if (walletData) {
            const parsed = JSON.parse(walletData)
            set({
              isUnlocked: true,
              accounts: parsed.accounts,
              activeAccountId: parsed.accounts[0]?.id || null,
            })
            return true
          }
          
          return false
        } catch (error) {
          console.error('Error unlocking wallet:', error)
          return false
        }
      },

      // Lock wallet
      lockWallet: () => {
        set({ isUnlocked: false })
      },

      // Add new account
      addAccount: async (name: string) => {
        try {
          const walletData = await SecureStore.getItemAsync('wallet_data')
          if (!walletData) throw new Error('No wallet found')

          const parsed = JSON.parse(walletData)
          const wallet = ethers.Wallet.fromPhrase(parsed.mnemonic)
          
          // Derive new account (simplified - in reality you'd use proper derivation)
          const accountIndex = parsed.accounts.length
          const derivedWallet = wallet.deriveChild(accountIndex)
          
          const newAccount: Account = {
            id: `account_${Date.now()}`,
            address: derivedWallet.address,
            name,
            isActive: false,
            derivationPath: `m/44'/60'/0'/0/${accountIndex}`,
          }

          const updatedAccounts = [...parsed.accounts, newAccount]
          await SecureStore.setItemAsync('wallet_data', JSON.stringify({
            ...parsed,
            accounts: updatedAccounts,
          }))

          set(state => ({
            accounts: [...state.accounts, newAccount],
          }))

          return newAccount
        } catch (error) {
          console.error('Error adding account:', error)
          throw error
        }
      },

      // Set active account
      setActiveAccount: (accountId: string) => {
        set(state => ({
          activeAccountId: accountId,
          accounts: state.accounts.map(acc => ({
            ...acc,
            isActive: acc.id === accountId,
          })),
        }))
      },

      // Get active account
      getActiveAccount: () => {
        const state = get()
        return state.accounts.find(acc => acc.id === state.activeAccountId) || null
      },

      // Switch network
      switchNetwork: async (chainId: number) => {
        const network = Object.values(NETWORKS).find(n => n.chainId === chainId)
        if (!network) throw new Error('Network not supported')

        set({ currentNetwork: network })
        
        // Refresh balances for new network
        await get().refreshBalances()
      },

      // Refresh balances
      refreshBalances: async (accountId?: string) => {
        try {
          const state = get()
          const targetAccountId = accountId || state.activeAccountId
          if (!targetAccountId) return

          const account = state.accounts.find(acc => acc.id === targetAccountId)
          if (!account) return

          // Create provider for current network
          const provider = new ethers.JsonRpcProvider(state.currentNetwork.rpcUrl)
          
          // Get native token balance
          const balance = await provider.getBalance(account.address)
          const nativeToken: TokenBalance = {
            address: 'native',
            symbol: state.currentNetwork.symbol,
            name: state.currentNetwork.name,
            balance: ethers.formatEther(balance),
            decimals: 18,
          }

          set(state => ({
            balances: {
              ...state.balances,
              [targetAccountId]: [nativeToken],
            },
          }))
        } catch (error) {
          console.error('Error refreshing balances:', error)
        }
      },

      // Refresh transactions
      refreshTransactions: async (accountId?: string) => {
        try {
          const state = get()
          const targetAccountId = accountId || state.activeAccountId
          if (!targetAccountId) return

          // In a real implementation, you would fetch transaction history
          // from the blockchain or an indexing service
          console.log('Refreshing transactions for account:', targetAccountId)
        } catch (error) {
          console.error('Error refreshing transactions:', error)
        }
      },

      // Send transaction
      sendTransaction: async (params) => {
        try {
          const state = get()
          const activeAccount = state.getActiveAccount()
          if (!activeAccount) throw new Error('No active account')

          const walletData = await SecureStore.getItemAsync('wallet_data')
          if (!walletData) throw new Error('No wallet found')

          const parsed = JSON.parse(walletData)
          const wallet = ethers.Wallet.fromPhrase(parsed.mnemonic)
          const provider = new ethers.JsonRpcProvider(state.currentNetwork.rpcUrl)
          const connectedWallet = wallet.connect(provider)

          // Send transaction
          const tx = await connectedWallet.sendTransaction({
            to: params.to,
            value: ethers.parseEther(params.value),
            data: params.data,
            gasLimit: params.gasLimit,
            gasPrice: params.gasPrice,
          })

          // Refresh balances after transaction
          setTimeout(() => {
            get().refreshBalances()
          }, 2000)

          return tx.hash
        } catch (error) {
          console.error('Error sending transaction:', error)
          throw error
        }
      },
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        // Only persist non-sensitive data
        isInitialized: state.isInitialized,
        currentNetwork: state.currentNetwork,
        balances: state.balances,
        transactions: state.transactions,
      }),
    }
  )
)
