import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { Network } from '@/db/schema';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

interface EditNetworkModalProps {
  network: Network;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Network>) => void;
}

export function EditNetworkModal({ network, isOpen, onClose, onSave }: EditNetworkModalProps) {
  const [formData, setFormData] = useState({
    name: network.name,
    rpcUrl: network.rpcUrl,
    explorerUrl: network.explorerUrl || '',
    nativeCurrencySymbol: network.nativeCurrencySymbol,
    nativeCurrencyName: network.nativeCurrencyName,
    iconUrl: network.iconUrl || '',
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Network name is required');
      return;
    }

    if (!formData.rpcUrl.trim()) {
      Alert.alert('Error', 'RPC URL is required');
      return;
    }

    if (!formData.rpcUrl.startsWith('https://')) {
      Alert.alert('Error', 'RPC URL must start with https://');
      return;
    }

    if (!formData.nativeCurrencySymbol.trim()) {
      Alert.alert('Error', 'Native currency symbol is required');
      return;
    }

    if (!formData.nativeCurrencyName.trim()) {
      Alert.alert('Error', 'Native currency name is required');
      return;
    }

    setIsSaving(true);

    try {
      const updates: Partial<Network> = {
        name: formData.name.trim(),
        rpcUrl: formData.rpcUrl.trim(),
        explorerUrl: formData.explorerUrl.trim() || undefined,
        nativeCurrencySymbol: formData.nativeCurrencySymbol.trim(),
        nativeCurrencyName: formData.nativeCurrencyName.trim(),
        iconUrl: formData.iconUrl.trim() || undefined,
      };

      onSave(updates);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save network changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: network.name,
      rpcUrl: network.rpcUrl,
      explorerUrl: network.explorerUrl || '',
      nativeCurrencySymbol: network.nativeCurrencySymbol,
      nativeCurrencyName: network.nativeCurrencyName,
      iconUrl: network.iconUrl || '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="w-full max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>Edit Network</DialogTitle>
          <DialogDescription>
            Update the network configuration for {network.name}
          </DialogDescription>
        </DialogHeader>

        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Network Name</Text>
            <Input
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="e.g., Ethereum Mainnet"
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">RPC URL</Text>
            <Input
              value={formData.rpcUrl}
              onChangeText={(text) => setFormData(prev => ({ ...prev, rpcUrl: text }))}
              placeholder="https://..."
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Block Explorer URL</Text>
            <Input
              value={formData.explorerUrl}
              onChangeText={(text) => setFormData(prev => ({ ...prev, explorerUrl: text }))}
              placeholder="https://etherscan.io (optional)"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground mb-2">Currency Symbol</Text>
              <Input
                value={formData.nativeCurrencySymbol}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nativeCurrencySymbol: text }))}
                placeholder="ETH"
                autoCapitalize="characters"
                maxLength={10}
              />
            </View>

            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground mb-2">Currency Name</Text>
              <Input
                value={formData.nativeCurrencyName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nativeCurrencyName: text }))}
                placeholder="Ether"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Icon URL</Text>
            <Input
              value={formData.iconUrl}
              onChangeText={(text) => setFormData(prev => ({ ...prev, iconUrl: text }))}
              placeholder="https://... (optional)"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>
        </View>

        <DialogFooter>
          <Button
            variant="outline"
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Text>Cancel</Text>
          </Button>
          <Button
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}