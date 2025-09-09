import type { Network } from '@/db/schema';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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

// Get Infura API key for network configuration
const getInfuraApiKey = () => {
  const key = process.env.EXPO_PUBLIC_INFURA_API_KEY;
  console.log('Environment check:', {
    hasInfuraKey: !!key,
    keyPreview: key ? key.substring(0, 8) + '...' : 'NOT FOUND',
    allEnvKeys: Object.keys(process.env).filter(k => k.startsWith('EXPO_PUBLIC'))
  });
  return key || 'demo_key_replace_with_real_key';
};

// Dynamic default networks configuration with proper API key
const getDefaultNetworks = (): Network[] => {
  const infuraKey = getInfuraApiKey();
  const timestamp = new Date().toISOString();
  
  return [
    {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: `https://mainnet.infura.io/v3/${infuraKey}`,
      explorerUrl: 'https://etherscan.io',
      nativeCurrencySymbol: 'ETH',
      nativeCurrencyDecimals: 18,
      nativeCurrencyName: 'Ether',
      iconUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      isDefault: true,
      isRecommended: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
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
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
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
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
};

// Callback for network changes to avoid circular dependencies
let networkChangeCallback: (() => void) | null = null;

export const setNetworkChangeCallback = (callback: () => void) => {
  networkChangeCallback = callback;
};

interface NetworkState {
  // Network management
  networks: Network[];
  activeNetwork: Network | null;
  
  // Connection states
  connectionStatus: Record<number, 'connected' | 'connecting' | 'disconnected' | 'error'>;
  lastConnectionCheck: Record<number, number>;
  
  // Loading states
  isLoadingNetworks: boolean;
  isSwitchingNetwork: boolean;
  
  // Actions - Network Management
  addNetwork: (network: Network) => void;
  addCustomNetwork: (network: Omit<Network, 'createdAt' | 'updatedAt'>) => void;
  removeNetwork: (chainId: number) => void;
  updateNetwork: (chainId: number, updates: Partial<Network>) => void;
  setActiveNetwork: (network: Network) => void;
  initializeDefaultNetworks: () => void;
  
  // Actions - Connection Management
  setConnectionStatus: (chainId: number, status: 'connected' | 'connecting' | 'disconnected' | 'error') => void;
  checkNetworkConnection: (chainId: number) => Promise<boolean>;
  switchNetwork: (chainId: number) => Promise<boolean>;
  
  // Actions - Network Discovery
  searchNetworksFromChainlist: (query: string) => Promise<Network[]>;
  addNetworkFromChainlist: (chainId: number) => Promise<void>;
  refreshNetworkData: () => Promise<void>;
  
  // Actions - Loading States
  setLoadingNetworks: (loading: boolean) => void;
  setSwitchingNetwork: (switching: boolean) => void;
  
  // Computed getters
  getConnectedNetworks: () => Network[];
  getRecommendedNetworks: () => Network[];
  getNetworkByChainId: (chainId: number) => Network | undefined;
  isNetworkConnected: (chainId: number) => boolean;
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      // Initial state
      networks: [],
      activeNetwork: null,
      connectionStatus: {},
      lastConnectionCheck: {},
      isLoadingNetworks: false,
      isSwitchingNetwork: false,
      
      // Network Management Actions
      addNetwork: (network: Network) => {
        set((state) => ({
          networks: [...state.networks.filter(n => n.chainId !== network.chainId), network],
        }));
      },
      
      addCustomNetwork: (networkData: Omit<Network, 'createdAt' | 'updatedAt'>) => {
        const timestamp = new Date().toISOString();
        const network: Network = {
          ...networkData,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        
        set((state) => ({
          networks: [...state.networks.filter(n => n.chainId !== network.chainId), network],
        }));
      },
      
      removeNetwork: (chainId: number) => {
        set((state) => {
          const updatedNetworks = state.networks.filter(n => n.chainId !== chainId);
          let newActiveNetwork = state.activeNetwork;
          
          // If removing the currently active network, switch to Ethereum Mainnet
          if (state.activeNetwork?.chainId === chainId) {
            newActiveNetwork = updatedNetworks.find(n => n.chainId === 1) || updatedNetworks[0] || null;
          }
          
          return {
            networks: updatedNetworks,
            activeNetwork: newActiveNetwork,
          };
        });
      },
      
      updateNetwork: (chainId: number, updates: Partial<Network>) => {
        set((state) => ({
          networks: state.networks.map(n =>
            n.chainId === chainId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
          activeNetwork: state.activeNetwork?.chainId === chainId
            ? { ...state.activeNetwork, ...updates, updatedAt: new Date().toISOString() }
            : state.activeNetwork,
        }));
      },
      
      setActiveNetwork: (network: Network) => {
        set({ activeNetwork: network });
        
        // Notify balance monitoring service of network change
        if (networkChangeCallback) {
          networkChangeCallback();
        }
      },
      
      initializeDefaultNetworks: () => {
        const { networks } = get();
        if (networks.length === 0) {
          const defaultNetworks = getDefaultNetworks();
          set({
            networks: defaultNetworks,
            activeNetwork: defaultNetworks[0], // Set Ethereum as default
          });
        }
      },
      
      // Connection Management Actions
      setConnectionStatus: (chainId: number, status: 'connected' | 'connecting' | 'disconnected' | 'error') => {
        set((state) => ({
          connectionStatus: { ...state.connectionStatus, [chainId]: status },
          lastConnectionCheck: { ...state.lastConnectionCheck, [chainId]: Date.now() },
        }));
      },
      
      checkNetworkConnection: async (chainId: number) => {
        const { networks, setConnectionStatus } = get();
        const network = networks.find(n => n.chainId === chainId);
        
        if (!network) return false;
        
        setConnectionStatus(chainId, 'connecting');
        
        try {
          // TODO: Implement actual RPC connection check with Ethers.js
          // This is a placeholder that would ping the RPC endpoint
          console.log(`Checking connection to ${network.name} (${network.rpcUrl})`);
          
          // Simulate network check
          const isConnected = await new Promise<boolean>((resolve) => {
            setTimeout(() => resolve(true), 1000);
          });
          
          setConnectionStatus(chainId, isConnected ? 'connected' : 'error');
          return isConnected;
        } catch (error) {
          console.error(`Failed to connect to ${network.name}:`, error);
          setConnectionStatus(chainId, 'error');
          return false;
        }
      },
      
      switchNetwork: async (chainId: number) => {
        const { networks, checkNetworkConnection } = get();
        const network = networks.find(n => n.chainId === chainId);
        
        if (!network) return false;
        
        set({ isSwitchingNetwork: true });
        
        try {
          const isConnected = await checkNetworkConnection(chainId);
          
          if (isConnected) {
            set({ activeNetwork: network });
            
            // Notify balance monitoring service of network change
            if (networkChangeCallback) {
              networkChangeCallback();
            }
            
            return true;
          }
          
          return false;
        } finally {
          set({ isSwitchingNetwork: false });
        }
      },
      
      // Network Discovery Actions
      searchNetworksFromChainlist: async (query: string) => {
        try {
          // TODO: Implement actual Chainlist API integration
          // This is a placeholder for searching networks from chainlist.org
          console.log(`Searching networks for: ${query}`);
          
          // Return mock results for now
          return [];
        } catch (error) {
          console.error('Failed to search networks:', error);
          return [];
        }
      },
      
      addNetworkFromChainlist: async (chainId: number) => {
        const { addNetwork } = get();
        
        try {
          // TODO: Fetch network data from Chainlist API
          console.log(`Adding network from Chainlist: ${chainId}`);
          
          // This would fetch the actual network data and add it
          // For now, this is a placeholder
        } catch (error) {
          console.error('Failed to add network from Chainlist:', error);
        }
      },
      
      refreshNetworkData: async () => {
        set({ isLoadingNetworks: true });
        
        try {
          // TODO: Refresh network data from Chainlist API
          console.log('Refreshing network data');
          
          setTimeout(() => {
            set({ isLoadingNetworks: false });
          }, 1000);
        } catch (error) {
          console.error('Failed to refresh network data:', error);
          set({ isLoadingNetworks: false });
        }
      },
      
      // Loading State Actions
      setLoadingNetworks: (loading: boolean) => {
        set({ isLoadingNetworks: loading });
      },
      
      setSwitchingNetwork: (switching: boolean) => {
        set({ isSwitchingNetwork: switching });
      },
      
      // Computed getters
      getConnectedNetworks: () => {
        const { networks, connectionStatus } = get();
        return networks.filter(n => connectionStatus[n.chainId] === 'connected');
      },
      
      getRecommendedNetworks: () => {
        const { networks } = get();
        return networks.filter(n => n.isRecommended);
      },
      
      getNetworkByChainId: (chainId: number) => {
        const { networks } = get();
        return networks.find(n => n.chainId === chainId);
      },
      
      isNetworkConnected: (chainId: number) => {
        const { connectionStatus } = get();
        return connectionStatus[chainId] === 'connected';
      },
    }),
    {
      name: 'capsula-network',
      storage: createJSONStorage(() => zustandStorage),
      // Persist network configuration and active network
      partialize: (state) => ({
        networks: state.networks,
        activeNetwork: state.activeNetwork,
      }),
    }
  )
);