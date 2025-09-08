import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useMiniAppStore } from '@/lib/stores';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useMiniAppSDK } from '../sdk';
import type { MiniAppProps } from '../sdk/types';

// Import built-in mini-app modules statically
import ExampleModule from '../modules/example/ExampleModule';
import TokensModule from '../modules/tokens/TokensModule';

const BUILT_IN_MODULES: Record<string, { default: React.ComponentType<MiniAppProps> }> = {
  'tokens-module': { default: TokensModule },
  'example-module': { default: ExampleModule },
};

interface MiniAppHostProps {
  miniAppId: string;
  onClose: () => void;
}

export function MiniAppHost({ miniAppId, onClose }: MiniAppHostProps) {
  const [MiniAppComponent, setMiniAppComponent] = useState<React.ComponentType<MiniAppProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getMiniAppById, setActiveMiniApp } = useMiniAppStore();
  const { sdk, createSDK } = useMiniAppSDK();

  const miniApp = getMiniAppById(miniAppId);

  const loadMiniApp = useCallback(async () => {
    if (!miniApp) {
      setError('Mini-app not found');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Parse manifest
      const manifest = JSON.parse(miniApp.manifestData || '{}');
      
      // Create SDK for this mini-app
      const miniAppSDK = createSDK(miniApp.id, manifest);

      // Load the mini-app component
      let ModuleComponent: React.ComponentType<MiniAppProps>;

      if (miniApp.isBuiltIn && BUILT_IN_MODULES[miniApp.id]) {
        // Load built-in module
        const module = BUILT_IN_MODULES[miniApp.id];
        ModuleComponent = module.default;
      } else {
        // For future external mini-apps
        throw new Error('External mini-apps not yet supported');
      }

      // Set as active mini-app
      setActiveMiniApp(miniApp);
      setMiniAppComponent(() => ModuleComponent);

    } catch (error) {
      console.error(`Failed to load mini-app ${miniAppId}:`, error);
      setError(`Failed to load ${miniApp.title}`);
    } finally {
      setIsLoading(false);
    }
  }, [miniApp, miniAppId, createSDK, setActiveMiniApp]);

  useEffect(() => {
    loadMiniApp();
    
    // Cleanup when component unmounts
    return () => {
      setActiveMiniApp(null);
    };
  }, [loadMiniApp, setActiveMiniApp]);

  const handleClose = useCallback(() => {
    setActiveMiniApp(null);
    onClose();
  }, [setActiveMiniApp, onClose]);

  const handleRetry = useCallback(() => {
    loadMiniApp();
  }, [loadMiniApp]);

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="text-foreground mt-4 text-center">
          Loading {miniApp?.title || 'Mini-App'}...
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !MiniAppComponent || !sdk) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6">
        <Text className="text-error text-lg font-semibold text-center mb-2">
          Failed to Load Mini-App
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          {error || 'An unexpected error occurred'}
        </Text>
        <View className="flex-row gap-4">
          <Button variant="outline" onPress={handleClose}>
            <Text className="text-foreground">Close</Text>
          </Button>
          <Button onPress={handleRetry}>
            <Text className="text-primary-foreground">Retry</Text>
          </Button>
        </View>
      </View>
    );
  }

  // Render the mini-app component
  return (
    <View className="flex-1 bg-background">
      <MiniAppComponent
        sdk={sdk}
        onClose={handleClose}
        isActive={true}
      />
    </View>
  );
}

// Error boundary for mini-apps
interface MiniAppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class MiniAppErrorBoundary extends React.Component<
  { children: React.ReactNode; miniAppId: string; onError?: (error: Error) => void },
  MiniAppErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; miniAppId: string; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): MiniAppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Mini-app ${this.props.miniAppId} crashed:`, error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-background justify-center items-center p-6">
          <Text className="text-error text-lg font-semibold text-center mb-2">
            Mini-App Crashed
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            The mini-app encountered an unexpected error and needs to be restarted.
          </Text>
          <Button
            onPress={() => {
              this.setState({ hasError: false, error: undefined });
            }}
          >
            <Text className="text-primary-foreground">Restart Mini-App</Text>
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}