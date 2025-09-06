import type { MiniApp } from '@/db/schema';
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

// Built-in mini-apps configuration for MVP
const BUILT_IN_MINI_APPS: MiniApp[] = [
  {
    id: 'tokens-module',
    title: 'Tokens',
    description: 'Manage ERC-20 tokens, add custom tokens, and view balances',
    iconUrl: '', // Will use default icon
    version: '1.0.0',
    categories: '["DeFi", "Tools"]',
    supportedNetworks: '[1, 42220, 100]', // Ethereum, CELO, Gnosis
    recommendedByCommunities: '["greenpill-br"]',
    isInstalled: true,
    isBuiltIn: true,
    installationOrder: 1,
    manifestData: JSON.stringify({
      type: 'built-in',
      module: 'tokens',
      entryPoint: 'TokensModule',
      permissions: ['wallet.read', 'network.read', 'transaction.sign'],
      contractInteractions: ['ERC20'],
    }),
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'example-module',
    title: 'Example',
    description: 'Demonstrates mini-app SDK capabilities and smart contract interaction',
    iconUrl: '', // Will use default icon
    version: '1.0.0',
    categories: '["Developer", "Tools"]',
    supportedNetworks: '[1, 42220, 100]', // Ethereum, CELO, Gnosis
    recommendedByCommunities: '["developers"]',
    isInstalled: true,
    isBuiltIn: true,
    installationOrder: 2,
    manifestData: JSON.stringify({
      type: 'built-in',
      module: 'example',
      entryPoint: 'ExampleModule',
      permissions: ['wallet.read', 'network.read', 'transaction.sign'],
      contractInteractions: ['ERC20'],
      abi: [], // Will contain example contract ABI
    }),
    lastUpdated: new Date().toISOString(),
  },
];

// Mini-app manifest interface for type safety
export interface MiniAppManifest {
  type: 'built-in' | 'external';
  module: string;
  entryPoint: string;
  permissions: string[];
  contractInteractions?: string[];
  abi?: any[];
  customComponents?: string[];
}

interface MiniAppState {
  // Mini-app management
  miniApps: MiniApp[];
  installedMiniApps: MiniApp[];
  activeMiniApp: MiniApp | null;
  
  // Mini-app runtime state
  miniAppStates: Record<string, any>; // miniAppId -> state
  isLoadingMiniApp: boolean;
  currentMiniAppId: string | null;
  
  // Network filtering
  availableMiniAppsForNetwork: MiniApp[];
  
  // Loading states
  isInitializing: boolean;
  isInstalling: boolean;
  
  // Actions - Mini-App Management
  addMiniApp: (miniApp: MiniApp) => void;
  removeMiniApp: (miniAppId: string) => void;
  updateMiniApp: (miniAppId: string, updates: Partial<MiniApp>) => void;
  installMiniApp: (miniAppId: string) => Promise<void>;
  uninstallMiniApp: (miniAppId: string) => Promise<void>;
  initializeBuiltInMiniApps: () => void;
  
  // Actions - Mini-App Runtime
  setActiveMiniApp: (miniApp: MiniApp | null) => void;
  launchMiniApp: (miniAppId: string) => Promise<boolean>;
  closeMiniApp: () => void;
  updateMiniAppState: (miniAppId: string, state: any) => void;
  getMiniAppState: (miniAppId: string) => any;
  
  // Actions - Network Integration
  filterMiniAppsByNetwork: (chainId: number) => void;
  refreshAvailableMiniApps: (chainId: number) => void;
  
  // Actions - Loading States
  setLoadingMiniApp: (loading: boolean) => void;
  setInitializing: (initializing: boolean) => void;
  setInstalling: (installing: boolean) => void;
  
  // Computed getters
  getInstalledMiniApps: () => MiniApp[];
  getBuiltInMiniApps: () => MiniApp[];
  getMiniAppsByCategory: (category: string) => MiniApp[];
  getMiniAppsForNetwork: (chainId: number) => MiniApp[];
  getMiniAppById: (miniAppId: string) => MiniApp | undefined;
  parseManifestData: (miniApp: MiniApp) => MiniAppManifest | null;
}

export const useMiniAppStore = create<MiniAppState>()(
  persist(
    (set, get) => ({
      // Initial state
      miniApps: [],
      installedMiniApps: [],
      activeMiniApp: null,
      miniAppStates: {},
      isLoadingMiniApp: false,
      currentMiniAppId: null,
      availableMiniAppsForNetwork: [],
      isInitializing: false,
      isInstalling: false,
      
      // Mini-App Management Actions
      addMiniApp: (miniApp: MiniApp) => {
        set((state) => ({
          miniApps: [...state.miniApps.filter(app => app.id !== miniApp.id), miniApp],
          installedMiniApps: miniApp.isInstalled 
            ? [...state.installedMiniApps.filter(app => app.id !== miniApp.id), miniApp]
            : state.installedMiniApps,
        }));
      },
      
      removeMiniApp: (miniAppId: string) => {
        set((state) => ({
          miniApps: state.miniApps.filter(app => app.id !== miniAppId),
          installedMiniApps: state.installedMiniApps.filter(app => app.id !== miniAppId),
          activeMiniApp: state.activeMiniApp?.id === miniAppId ? null : state.activeMiniApp,
          miniAppStates: Object.fromEntries(
            Object.entries(state.miniAppStates).filter(([id]) => id !== miniAppId)
          ),
        }));
      },
      
      updateMiniApp: (miniAppId: string, updates: Partial<MiniApp>) => {
        set((state) => ({
          miniApps: state.miniApps.map(app =>
            app.id === miniAppId ? { ...app, ...updates, lastUpdated: new Date().toISOString() } : app
          ),
          installedMiniApps: state.installedMiniApps.map(app =>
            app.id === miniAppId ? { ...app, ...updates, lastUpdated: new Date().toISOString() } : app
          ),
          activeMiniApp: state.activeMiniApp?.id === miniAppId
            ? { ...state.activeMiniApp, ...updates, lastUpdated: new Date().toISOString() }
            : state.activeMiniApp,
        }));
      },
      
      installMiniApp: async (miniAppId: string) => {
        const { miniApps, updateMiniApp } = get();
        const miniApp = miniApps.find(app => app.id === miniAppId);
        
        if (!miniApp) {
          console.warn(`Mini-app ${miniAppId} not found`);
          return;
        }
        
        set({ isInstalling: true });
        
        try {
          // For MVP, installation is just setting the flag
          // In future, this would download and validate the mini-app
          console.log(`Installing mini-app: ${miniApp.title}`);
          
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate installation
          
          updateMiniApp(miniAppId, { 
            isInstalled: true,
            installationOrder: Date.now(),
          });
          
          // Add to installed mini-apps
          set((state) => ({
            installedMiniApps: [...state.installedMiniApps.filter(app => app.id !== miniAppId), {
              ...miniApp,
              isInstalled: true,
              installationOrder: Date.now(),
            }],
          }));
          
        } catch (error) {
          console.error(`Failed to install mini-app ${miniAppId}:`, error);
        } finally {
          set({ isInstalling: false });
        }
      },
      
      uninstallMiniApp: async (miniAppId: string) => {
        const { miniApps, updateMiniApp } = get();
        const miniApp = miniApps.find(app => app.id === miniAppId);
        
        if (!miniApp || miniApp.isBuiltIn) {
          console.warn(`Cannot uninstall built-in mini-app: ${miniAppId}`);
          return;
        }
        
        set({ isInstalling: true });
        
        try {
          console.log(`Uninstalling mini-app: ${miniApp.title}`);
          
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate uninstallation
          
          updateMiniApp(miniAppId, { isInstalled: false });
          
          // Remove from installed mini-apps
          set((state) => ({
            installedMiniApps: state.installedMiniApps.filter(app => app.id !== miniAppId),
            activeMiniApp: state.activeMiniApp?.id === miniAppId ? null : state.activeMiniApp,
          }));
          
        } catch (error) {
          console.error(`Failed to uninstall mini-app ${miniAppId}:`, error);
        } finally {
          set({ isInstalling: false });
        }
      },
      
      initializeBuiltInMiniApps: () => {
        const { miniApps } = get();
        
        // Only initialize if no mini-apps exist
        if (miniApps.length === 0) {
          set({
            miniApps: BUILT_IN_MINI_APPS,
            installedMiniApps: BUILT_IN_MINI_APPS,
          });
          console.log('Initialized built-in mini-apps');
        }
      },
      
      // Mini-App Runtime Actions
      setActiveMiniApp: (miniApp: MiniApp | null) => {
        set({ 
          activeMiniApp: miniApp,
          currentMiniAppId: miniApp?.id || null,
        });
      },
      
      launchMiniApp: async (miniAppId: string) => {
        const { installedMiniApps, getMiniAppById, setActiveMiniApp, setLoadingMiniApp } = get();
        const miniApp = getMiniAppById(miniAppId);
        
        if (!miniApp || !miniApp.isInstalled) {
          console.warn(`Mini-app ${miniAppId} not found or not installed`);
          return false;
        }
        
        setLoadingMiniApp(true);
        
        try {
          console.log(`Launching mini-app: ${miniApp.title}`);
          
          // Simulate mini-app loading
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setActiveMiniApp(miniApp);
          return true;
        } catch (error) {
          console.error(`Failed to launch mini-app ${miniAppId}:`, error);
          return false;
        } finally {
          setLoadingMiniApp(false);
        }
      },
      
      closeMiniApp: () => {
        set({
          activeMiniApp: null,
          currentMiniAppId: null,
        });
      },
      
      updateMiniAppState: (miniAppId: string, state: any) => {
        set((currentState) => ({
          miniAppStates: {
            ...currentState.miniAppStates,
            [miniAppId]: { ...currentState.miniAppStates[miniAppId], ...state },
          },
        }));
      },
      
      getMiniAppState: (miniAppId: string) => {
        const { miniAppStates } = get();
        return miniAppStates[miniAppId] || {};
      },
      
      // Network Integration Actions
      filterMiniAppsByNetwork: (chainId: number) => {
        const { installedMiniApps } = get();
        
        const availableApps = installedMiniApps.filter(app => {
          try {
            const supportedNetworks = JSON.parse(app.supportedNetworks || '[]');
            return supportedNetworks.includes(chainId);
          } catch {
            return false;
          }
        });
        
        set({ availableMiniAppsForNetwork: availableApps });
      },
      
      refreshAvailableMiniApps: (chainId: number) => {
        const { filterMiniAppsByNetwork } = get();
        filterMiniAppsByNetwork(chainId);
      },
      
      // Loading State Actions
      setLoadingMiniApp: (loading: boolean) => {
        set({ isLoadingMiniApp: loading });
      },
      
      setInitializing: (initializing: boolean) => {
        set({ isInitializing: initializing });
      },
      
      setInstalling: (installing: boolean) => {
        set({ isInstalling: installing });
      },
      
      // Computed getters
      getInstalledMiniApps: () => {
        const { installedMiniApps } = get();
        return [...installedMiniApps].sort((a, b) => (a.installationOrder || 0) - (b.installationOrder || 0));
      },
      
      getBuiltInMiniApps: () => {
        const { miniApps } = get();
        return miniApps.filter(app => app.isBuiltIn);
      },
      
      getMiniAppsByCategory: (category: string) => {
        const { miniApps } = get();
        return miniApps.filter(app => {
          try {
            const categories = JSON.parse(app.categories || '[]');
            return categories.includes(category);
          } catch {
            return false;
          }
        });
      },
      
      getMiniAppsForNetwork: (chainId: number) => {
        const { installedMiniApps } = get();
        return installedMiniApps.filter(app => {
          try {
            const supportedNetworks = JSON.parse(app.supportedNetworks || '[]');
            return supportedNetworks.includes(chainId);
          } catch {
            return false;
          }
        });
      },
      
      getMiniAppById: (miniAppId: string) => {
        const { miniApps } = get();
        return miniApps.find(app => app.id === miniAppId);
      },
      
      parseManifestData: (miniApp: MiniApp) => {
        try {
          return JSON.parse(miniApp.manifestData || '{}') as MiniAppManifest;
        } catch (error) {
          console.error(`Failed to parse manifest for ${miniApp.id}:`, error);
          return null;
        }
      },
    }),
    {
      name: 'capsula-mini-apps',
      storage: createJSONStorage(() => zustandStorage),
      // Persist mini-app configuration and states
      partialize: (state) => ({
        miniApps: state.miniApps,
        installedMiniApps: state.installedMiniApps,
        miniAppStates: state.miniAppStates,
      }),
    }
  )
);