// Export all SDK types and interfaces
export * from './types';

// Export context provider and hooks
export { MiniAppProvider, useMiniAppSDK } from './context';

// Export utility functions
export const createMiniAppId = (name: string): string => {
  return `${name.toLowerCase().replace(/\s+/g, '-')}-module`;
};

export const validateMiniAppManifest = (manifest: any): boolean => {
  try {
    return (
      typeof manifest === 'object' &&
      typeof manifest.type === 'string' &&
      typeof manifest.module === 'string' &&
      typeof manifest.entryPoint === 'string' &&
      Array.isArray(manifest.permissions)
    );
  } catch {
    return false;
  }
};

export const getMiniAppPermissions = (manifest: any): string[] => {
  try {
    return Array.isArray(manifest.permissions) ? manifest.permissions : [];
  } catch {
    return [];
  }
};

// Default manifests for built-in mini-apps
export const BUILT_IN_MANIFESTS = {
  'tokens-module': {
    type: 'built-in' as const,
    module: 'tokens',
    entryPoint: 'TokensModule',
    permissions: ['wallet.read', 'wallet.write', 'network.read', 'transaction.sign', 'transaction.send'],
    contractInteractions: ['ERC20'],
    networks: [1, 42220, 100], // Ethereum, CELO, Gnosis
  },
  'example-module': {
    type: 'built-in' as const,
    module: 'example',
    entryPoint: 'ExampleModule',
    permissions: ['wallet.read', 'network.read', 'transaction.sign'],
    contractInteractions: ['ERC20'],
    networks: [1, 42220, 100], // Ethereum, CELO, Gnosis
    abi: [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address owner) view returns (uint256)',
    ],
  },
};