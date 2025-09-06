import { ethersService } from '@/lib/blockchain/ethersService';
import { keyManager } from '@/lib/crypto/keyManager';
import { useMiniAppStore, useNetworkStore, useWalletStore } from '@/lib/stores';
import { useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import type {
  ContractCallParams,
  ContractReadParams,
  EventAPI,
  MiniAppManifest,
  MiniAppSDK,
  NetworkAPI,
  Permission,
  SignedTransaction,
  StorageAPI,
  TransactionParams,
  UIAPI,
  UnsignedTransaction,
  WalletAPI,
} from './types';
import {
  MiniAppError,
  MiniAppPermissionError,
} from './types';

// Create separate MMKV instances for each mini-app
const createMiniAppStorage = (miniAppId: string) => {
  return new MMKV({
    id: `mini-app-${miniAppId}`,
    encryptionKey: 'mini-app-storage-key', // In production, use a proper encryption key
  });
};

// Session storage for temporary data
const sessionStorage: Record<string, Record<string, string>> = {};

// Event emitter for mini-app events
class MiniAppEventEmitter {
  private listeners: Record<string, ((data?: any) => void)[]> = {};

  emit(eventName: string, data?: any) {
    const eventListeners = this.listeners[eventName] || [];
    eventListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }

  on(eventName: string, callback: (data?: any) => void): () => void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
    };
  }

  removeAllListeners(eventName?: string) {
    if (eventName) {
      delete this.listeners[eventName];
    } else {
      this.listeners = {};
    }
  }
}

const globalEventEmitter = new MiniAppEventEmitter();

// Permission checker utility
function checkPermission(manifest: MiniAppManifest, permission: Permission, miniAppId: string): void {
  if (!manifest.permissions.includes(permission)) {
    throw new MiniAppPermissionError(permission, miniAppId);
  }
}

interface MiniAppContextValue {
  sdk: MiniAppSDK | null;
  createSDK: (miniAppId: string, manifest: MiniAppManifest) => MiniAppSDK;
}

const MiniAppContext = createContext<MiniAppContextValue>({
  sdk: null,
  createSDK: () => {
    throw new Error('MiniAppContext not initialized');
  },
});

export const useMiniAppSDK = () => {
  const context = useContext(MiniAppContext);
  if (!context) {
    throw new Error('useMiniAppSDK must be used within MiniAppProvider');
  }
  return context;
};

interface MiniAppProviderProps {
  children: React.ReactNode;
}

export function MiniAppProvider({ children }: MiniAppProviderProps) {
  const router = useRouter();
  const [currentSDK, setCurrentSDK] = useState<MiniAppSDK | null>(null);
  
  // Store hooks
  const { activeWallet } = useWalletStore();
  const { activeNetwork } = useNetworkStore();
  const { activeMiniApp } = useMiniAppStore();

  // Create SDK instance for a specific mini-app
  const createSDK = useCallback((miniAppId: string, manifest: MiniAppManifest): MiniAppSDK => {
    const storage = createMiniAppStorage(miniAppId);
    
    // Initialize session storage for this mini-app if it doesn't exist
    if (!sessionStorage[miniAppId]) {
      sessionStorage[miniAppId] = {};
    }

    // Wallet API implementation
    const walletAPI: WalletAPI = {
      getActiveWallet: () => {
        checkPermission(manifest, 'wallet.read', miniAppId);
        return useWalletStore.getState().activeWallet;
      },

      getWalletAddress: () => {
        checkPermission(manifest, 'wallet.read', miniAppId);
        return useWalletStore.getState().activeWallet?.address || null;
      },

      getBalance: async (tokenAddress?: string) => {
        checkPermission(manifest, 'wallet.read', miniAppId);
        const { activeWallet } = useWalletStore.getState();
        const { activeNetwork } = useNetworkStore.getState();
        
        if (!activeWallet || !activeNetwork) {
          throw new MiniAppError('No active wallet or network', 'NO_WALLET_NETWORK', miniAppId);
        }

        try {
          const result = await keyManager.getWalletBalance(activeWallet.id, activeNetwork.chainId);
          return result.success ? result.data?.balance || '0' : '0';
        } catch (error) {
          throw new MiniAppError('Failed to get balance', 'BALANCE_ERROR', miniAppId);
        }
      },

      prepareTransaction: async (params: TransactionParams) => {
        checkPermission(manifest, 'wallet.write', miniAppId);
        const { activeNetwork } = useNetworkStore.getState();
        const { activeWallet } = useWalletStore.getState();
        
        if (!activeNetwork) {
          throw new MiniAppError('No active network', 'NO_NETWORK', miniAppId);
        }

        if (!activeWallet) {
          throw new MiniAppError('No active wallet', 'NO_WALLET', miniAppId);
        }

        try {
          // Use enhanced gas estimation from keyManager
          const gasEstimate = await keyManager.estimateTransactionGas(
            activeWallet.id,
            params,
            activeNetwork.chainId
          );

          if (!gasEstimate.success) {
            throw new MiniAppError('Gas estimation failed', 'GAS_ESTIMATION_ERROR', miniAppId);
          }

          // Get nonce from provider
          const provider = ethersService.getProvider(activeNetwork.chainId);
          const nonce = await provider.getTransactionCount(activeWallet.address);

          return {
            to: params.to,
            value: params.value || '0',
            data: params.data || '0x',
            gasLimit: params.gasLimit || gasEstimate.data!.gasLimit,
            gasPrice: params.gasPrice || gasEstimate.data!.gasPrice,
            nonce: params.nonce || nonce,
            chainId: activeNetwork.chainId,
          };
        } catch (error) {
          throw new MiniAppError('Failed to prepare transaction', 'PREPARE_TX_ERROR', miniAppId);
        }
      },

      signTransaction: async (transaction: UnsignedTransaction) => {
        checkPermission(manifest, 'transaction.sign', miniAppId);
        const { activeWallet } = useWalletStore.getState();
        
        if (!activeWallet) {
          throw new MiniAppError('No active wallet', 'NO_WALLET', miniAppId);
        }

        try {
          const result = await keyManager.signTransaction(activeWallet.id, transaction);
          if (!result.success) {
            throw new MiniAppError('Failed to sign transaction', 'SIGN_ERROR', miniAppId);
          }
          
          // Return proper SignedTransaction format
          return {
            ...transaction,
            signature: result.data!.signature,
          };
        } catch (error) {
          throw new MiniAppError('Transaction signing failed', 'SIGN_ERROR', miniAppId);
        }
      },

      sendTransaction: async (transaction: SignedTransaction) => {
        checkPermission(manifest, 'transaction.send', miniAppId);
        const { activeNetwork } = useNetworkStore.getState();
        
        if (!activeNetwork) {
          throw new MiniAppError('No active network', 'NO_NETWORK', miniAppId);
        }

        try {
          // Use enhanced sendSignedTransaction from keyManager
          const result = await keyManager.sendSignedTransaction(
            JSON.stringify(transaction), // Convert transaction to signed format
            activeNetwork.chainId
          );
          
          if (!result.success) {
            throw new MiniAppError('Failed to send transaction', 'SEND_ERROR', miniAppId);
          }
          
          return result.data!.transactionHash;
        } catch (error) {
          throw new MiniAppError('Failed to send transaction', 'SEND_ERROR', miniAppId);
        }
      },
    };

    // Network API implementation
    const networkAPI: NetworkAPI = {
      getActiveNetwork: () => {
        checkPermission(manifest, 'network.read', miniAppId);
        return useNetworkStore.getState().activeNetwork;
      },

      getNetworkById: (chainId: number) => {
        checkPermission(manifest, 'network.read', miniAppId);
        return useNetworkStore.getState().getNetworkByChainId(chainId) || null;
      },

      getSupportedNetworks: () => {
        checkPermission(manifest, 'network.read', miniAppId);
        const supportedChainIds = manifest.networks || [];
        const { networks } = useNetworkStore.getState();
        return networks.filter(network => supportedChainIds.includes(network.chainId));
      },

      switchNetwork: async (chainId: number) => {
        checkPermission(manifest, 'network.write', miniAppId);
        return useNetworkStore.getState().switchNetwork(chainId);
      },

      callContract: async (params: ContractCallParams) => {
        checkPermission(manifest, 'network.read', miniAppId);
        const { activeNetwork } = useNetworkStore.getState();
        
        if (!activeNetwork) {
          throw new MiniAppError('No active network', 'NO_NETWORK', miniAppId);
        }

        try {
          return await ethersService.callContract(
            activeNetwork.chainId,
            params.contractAddress,
            params.abi,
            params.functionName,
            params.args,
            params.value
          );
        } catch (error) {
          throw new MiniAppError('Contract call failed', 'CONTRACT_CALL_ERROR', miniAppId);
        }
      },

      readContract: async (params: ContractReadParams) => {
        checkPermission(manifest, 'network.read', miniAppId);
        const { activeNetwork } = useNetworkStore.getState();
        
        if (!activeNetwork) {
          throw new MiniAppError('No active network', 'NO_NETWORK', miniAppId);
        }

        try {
          return await ethersService.readContract(
            activeNetwork.chainId,
            params.contractAddress,
            params.abi,
            params.functionName,
            params.args,
            params.blockTag
          );
        } catch (error) {
          throw new MiniAppError('Contract read failed', 'CONTRACT_READ_ERROR', miniAppId);
        }
      },
    };

    // UI API implementation
    const uiAPI: UIAPI = {
      navigate: (route: string, params?: any) => {
        checkPermission(manifest, 'ui.navigation', miniAppId);
        try {
          if (params) {
            router.push({ pathname: route as any, params });
          } else {
            router.push(route as any);
          }
        } catch (error) {
          console.error('Navigation error:', error);
        }
      },

      goBack: () => {
        checkPermission(manifest, 'ui.navigation', miniAppId);
        router.back();
      },

      showToast: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        // For now, use Alert. In production, use a proper toast library
        Alert.alert(
          type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
          message
        );
      },

      showModal: async (component: React.ComponentType, props?: any) => {
        // TODO: Implement modal system
        console.log('Modal would show here:', component, props);
        return Promise.resolve();
      },

      hideModal: () => {
        // TODO: Implement modal system
        console.log('Modal would hide here');
      },

      showLoading: (message?: string) => {
        // TODO: Implement loading system
        console.log('Loading would show:', message);
      },

      hideLoading: () => {
        // TODO: Implement loading system
        console.log('Loading would hide');
      },
    };

    // Storage API implementation
    const storageAPI: StorageAPI = {
      getItem: async (key: string) => {
        checkPermission(manifest, 'storage.read', miniAppId);
        return storage.getString(key) || null;
      },

      setItem: async (key: string, value: string) => {
        checkPermission(manifest, 'storage.write', miniAppId);
        storage.set(key, value);
      },

      removeItem: async (key: string) => {
        checkPermission(manifest, 'storage.write', miniAppId);
        storage.delete(key);
      },

      clear: async () => {
        checkPermission(manifest, 'storage.write', miniAppId);
        storage.clearAll();
      },

      getSessionItem: (key: string) => {
        return sessionStorage[miniAppId][key] || null;
      },

      setSessionItem: (key: string, value: string) => {
        sessionStorage[miniAppId][key] = value;
      },

      removeSessionItem: (key: string) => {
        delete sessionStorage[miniAppId][key];
      },
    };

    // Events API implementation
    const eventsAPI: EventAPI = {
      onWalletChange: (callback) => {
        return globalEventEmitter.on('wallet:change', callback);
      },

      onNetworkChange: (callback) => {
        return globalEventEmitter.on('network:change', callback);
      },

      onTransactionUpdate: (callback) => {
        return globalEventEmitter.on('transaction:update', callback);
      },

      emit: (eventName: string, data?: any) => {
        globalEventEmitter.emit(`${miniAppId}:${eventName}`, data);
      },

      on: (eventName: string, callback) => {
        return globalEventEmitter.on(`${miniAppId}:${eventName}`, callback);
      },
    };

    // Create the complete SDK
    const sdk: MiniAppSDK = {
      miniAppId,
      version: manifest.type === 'built-in' ? '1.0.0' : 'external',
      manifest,
      wallet: walletAPI,
      network: networkAPI,
      ui: uiAPI,
      storage: storageAPI,
      events: eventsAPI,
    };

    return sdk;
  }, [router]);

  // Listen to store changes and emit events
  useEffect(() => {
    globalEventEmitter.emit('wallet:change', activeWallet);
  }, [activeWallet]);

  useEffect(() => {
    globalEventEmitter.emit('network:change', activeNetwork);
  }, [activeNetwork]);

  // Update current SDK when active mini-app changes
  useEffect(() => {
    if (activeMiniApp) {
      try {
        const manifest = JSON.parse(activeMiniApp.manifestData || '{}');
        const sdk = createSDK(activeMiniApp.id, manifest);
        setCurrentSDK(sdk);
      } catch (error) {
        console.error('Failed to create SDK for active mini-app:', error);
        setCurrentSDK(null);
      }
    } else {
      setCurrentSDK(null);
    }
  }, [activeMiniApp, createSDK]);

  const contextValue = useMemo(() => ({
    sdk: currentSDK,
    createSDK,
  }), [currentSDK, createSDK]);

  return (
    <MiniAppContext.Provider value={contextValue}>
      {children}
    </MiniAppContext.Provider>
  );
}