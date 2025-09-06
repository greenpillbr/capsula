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

interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  passkeyEnabled: boolean;
  pinEnabled: boolean;
  activeWalletId: string | null;
  
  // Session management
  sessionExpiry: number | null;
  biometricAuthTime: number | null;
  
  // Actions
  setAuthenticated: (authenticated: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setPasskeyEnabled: (enabled: boolean) => void;
  setPinEnabled: (enabled: boolean) => void;
  setActiveWallet: (walletId: string | null) => void;
  updateSessionExpiry: (expiry: number) => void;
  setBiometricAuthTime: (time: number) => void;
  logout: () => void;
  
  // Computed getters
  isSessionValid: () => boolean;
  requiresReauth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isOnboardingComplete: false,
      passkeyEnabled: true,
      pinEnabled: false,
      activeWalletId: null,
      sessionExpiry: null,
      biometricAuthTime: null,
      
      // Actions
      setAuthenticated: (authenticated: boolean) => {
        set({ isAuthenticated: authenticated });
        if (authenticated) {
          // Set session expiry to 30 minutes from now
          const expiry = Date.now() + (30 * 60 * 1000);
          set({ sessionExpiry: expiry });
        } else {
          set({ sessionExpiry: null, biometricAuthTime: null });
        }
      },
      
      setOnboardingComplete: (complete: boolean) => {
        set({ isOnboardingComplete: complete });
      },
      
      setPasskeyEnabled: (enabled: boolean) => {
        set({ passkeyEnabled: enabled });
      },
      
      setPinEnabled: (enabled: boolean) => {
        set({ pinEnabled: enabled });
      },
      
      setActiveWallet: (walletId: string | null) => {
        set({ activeWalletId: walletId });
      },
      
      updateSessionExpiry: (expiry: number) => {
        set({ sessionExpiry: expiry });
      },
      
      setBiometricAuthTime: (time: number) => {
        set({ biometricAuthTime: time });
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          sessionExpiry: null,
          biometricAuthTime: null,
        });
      },
      
      // Computed getters
      isSessionValid: () => {
        const { sessionExpiry } = get();
        if (!sessionExpiry) return false;
        return Date.now() < sessionExpiry;
      },
      
      requiresReauth: () => {
        const { biometricAuthTime } = get();
        if (!biometricAuthTime) return true;
        // Require re-auth after 5 minutes of inactivity
        return Date.now() - biometricAuthTime > (5 * 60 * 1000);
      },
    }),
    {
      name: 'capsula-auth',
      storage: createJSONStorage(() => zustandStorage),
      // Only persist non-sensitive state
      partialize: (state) => ({
        isOnboardingComplete: state.isOnboardingComplete,
        passkeyEnabled: state.passkeyEnabled,
        pinEnabled: state.pinEnabled,
        activeWalletId: state.activeWalletId,
      }),
    }
  )
);