import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { Transaction } from '@/db/schema';
import { ethersService } from '@/lib/blockchain/ethersService';
import { keyManager } from '@/lib/crypto/keyManager';
import { Send } from '@/lib/icons/Send';
import { useNetworkStore } from '@/lib/stores/networkStore';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  totalCost: string;
  totalCostUSD: string;
}

export default function SendScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // 0: recipient, 1: amount, 2: review, 3: sending
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  const { activeWallet, addPendingTransaction } = useWalletStore();
  const { activeNetwork } = useNetworkStore();

  // Validate recipient address
  const isValidRecipient = ethersService.isValidAddress(recipient);
  
  // Calculate if amount is valid
  const isValidAmount = parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat('100'); // Mock max balance

  useEffect(() => {
    if (currentStep === 2 && recipient && amount && activeWallet) {
      estimateGas();
    }
  }, [currentStep, recipient, amount, activeWallet]);

  const estimateGas = async () => {
    if (!activeWallet || !activeNetwork) return;

    setIsLoading(true);
    try {
      const estimate = await ethersService.estimateGas({
        to: recipient,
        value: amount,
        from: activeWallet.address,
      }, activeNetwork.chainId);

      // Calculate total cost (gas * gasPrice)
      const totalGasCost = (BigInt(estimate.gasLimit) * BigInt(estimate.gasPrice)).toString();
      const totalCostEth = ethersService.formatEther(totalGasCost);
      const totalCostUSD = (parseFloat(totalCostEth) * 2500).toFixed(2); // Mock ETH price

      setGasEstimate({
        ...estimate,
        totalCost: totalCostEth,
        totalCostUSD: `$${totalCostUSD}`,
      });
    } catch (error) {
      console.error('Gas estimation failed:', error);
      Alert.alert(
        'Gas Estimation Failed',
        'Unable to estimate transaction cost. Please check your inputs and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!activeWallet || !activeNetwork || !gasEstimate) return;

    setCurrentStep(3); // Move to sending step
    setIsLoading(true);

    try {
      // Sign and send transaction using key manager
      const result = await keyManager.signTransaction(activeWallet.id, {
        to: recipient,
        value: amount,
        gasLimit: gasEstimate.gasLimit,
        gasPrice: gasEstimate.gasPrice,
        maxFeePerGas: gasEstimate.maxFeePerGas,
        maxPriorityFeePerGas: gasEstimate.maxPriorityFeePerGas,
      });

      if (result.success && result.data) {
        setTransactionHash(result.data.transactionHash);
        
        // Add to pending transactions
        const transaction: Transaction = {
          id: `tx_${Date.now()}`,
          walletId: activeWallet.id,
          chainId: activeNetwork.chainId,
          hash: result.data.transactionHash,
          fromAddress: activeWallet.address,
          toAddress: recipient,
          value: amount,
          gasUsed: gasEstimate.gasLimit,
          gasPrice: gasEstimate.gasPrice,
          gasLimit: gasEstimate.gasLimit,
          blockNumber: 0,
          timestamp: new Date().toISOString(),
          status: 'Pending',
          type: 'Native Transfer',
          tokenContractAddress: null,
          tokenSymbol: activeNetwork.nativeCurrencySymbol,
          tokenDecimals: activeNetwork.nativeCurrencyDecimals,
          tokenAmount: amount,
          memo: null,
          isOutgoing: true,
        };

        addPendingTransaction(transaction);

        // Show success and navigate back
        setTimeout(() => {
          Alert.alert(
            'Transaction Sent!',
            `Your transaction has been broadcasted to the ${activeNetwork.name} network.`,
            [
              {
                text: 'View in Activity',
                onPress: () => router.back(),
              },
              {
                text: 'Done',
                onPress: () => router.back(),
              },
            ]
          );
        }, 2000);
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      Alert.alert(
        'Transaction Failed',
        'Your transaction could not be sent. Please try again.',
        [{ text: 'OK', onPress: () => setCurrentStep(2) }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderRecipientStep = () => (
    <View className="flex-1 p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-semibold text-foreground">Send To</Text>
        <Pressable onPress={() => router.back()}>
          <X className="text-muted-foreground" size={24} />
        </Pressable>
      </View>

      <View className="mb-6">
        <Text className="text-sm text-muted-foreground mb-2">Recipient Address</Text>
        <Input
          value={recipient}
          onChangeText={setRecipient}
          placeholder="0x... or ENS name"
          className="mb-2"
        />
        {recipient && !isValidRecipient && (
          <Text className="text-error text-xs">Invalid Ethereum address</Text>
        )}
      </View>

      <View className="flex-row gap-3 mb-8">
        <Button variant="outline" className="flex-1">
          <Text className="text-primary">Scan QR</Text>
        </Button>
        <Button variant="outline" className="flex-1">
          <Text className="text-primary">Contacts</Text>
        </Button>
      </View>

      <Button 
        onPress={() => setCurrentStep(1)}
        disabled={!isValidRecipient}
        className="w-full bg-primary"
      >
        <Text className="text-primary-foreground font-medium">Continue</Text>
      </Button>
    </View>
  );

  const renderAmountStep = () => (
    <View className="flex-1 p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Pressable onPress={() => setCurrentStep(0)}>
          <Text className="text-primary">← Back</Text>
        </Pressable>
        <Text className="text-xl font-semibold text-foreground">Send Amount</Text>
        <Pressable onPress={() => router.back()}>
          <X className="text-muted-foreground" size={24} />
        </Pressable>
      </View>

      <Card className="p-4 mb-6">
        <Text className="text-sm text-muted-foreground mb-1">To</Text>
        <Text className="text-foreground font-medium">
          {recipient.slice(0, 10)}...{recipient.slice(-8)}
        </Text>
      </Card>

      <View className="mb-6">
        <Text className="text-sm text-muted-foreground mb-2">Amount</Text>
        <View className="flex-row items-center">
          <Input
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            className="flex-1 mr-3"
          />
          <Text className="text-foreground font-medium">
            {activeNetwork?.nativeCurrencySymbol || 'ETH'}
          </Text>
        </View>
        {amount && !isValidAmount && (
          <Text className="text-error text-xs mt-1">
            Invalid amount or insufficient balance
          </Text>
        )}
      </View>

      <View className="mb-8">
        <Text className="text-sm text-muted-foreground">Available Balance</Text>
        <Text className="text-lg font-medium text-foreground">
          100.0 {activeNetwork?.nativeCurrencySymbol || 'ETH'}
        </Text>
        <Pressable onPress={() => setAmount('100.0')}>
          <Text className="text-primary text-sm">Use Max</Text>
        </Pressable>
      </View>

      <Button 
        onPress={() => setCurrentStep(2)}
        disabled={!isValidAmount}
        className="w-full bg-primary"
      >
        <Text className="text-primary-foreground font-medium">Review</Text>
      </Button>
    </View>
  );

  const renderReviewStep = () => (
    <ScrollView className="flex-1 p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Pressable onPress={() => setCurrentStep(1)}>
          <Text className="text-primary">← Back</Text>
        </Pressable>
        <Text className="text-xl font-semibold text-foreground">Review & Send</Text>
        <Pressable onPress={() => router.back()}>
          <X className="text-muted-foreground" size={24} />
        </Pressable>
      </View>

      {/* Transaction Summary */}
      <Card className="p-4 mb-6">
        <Text className="text-lg font-semibold text-foreground mb-4">Transaction Details</Text>
        
        <View className="space-y-3">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">From</Text>
            <Text className="text-foreground font-medium">
              {activeWallet?.address.slice(0, 10)}...{activeWallet?.address.slice(-8)}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">To</Text>
            <Text className="text-foreground font-medium">
              {recipient.slice(0, 10)}...{recipient.slice(-8)}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Amount</Text>
            <Text className="text-foreground font-medium">
              {amount} {activeNetwork?.nativeCurrencySymbol}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Network</Text>
            <Text className="text-foreground font-medium">
              {activeNetwork?.name}
            </Text>
          </View>
        </View>
      </Card>

      {/* Gas Estimate */}
      {gasEstimate && (
        <Card className="p-4 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Network Fee</Text>
          
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Gas Limit</Text>
              <Text className="text-foreground">{gasEstimate.gasLimit}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Gas Price</Text>
              <Text className="text-foreground">{gasEstimate.gasPrice} gwei</Text>
            </View>
            
            <View className="flex-row justify-between font-medium">
              <Text className="text-foreground">Total Fee</Text>
              <View className="items-end">
                <Text className="text-foreground font-medium">
                  {gasEstimate.totalCost} {activeNetwork?.nativeCurrencySymbol}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {gasEstimate.totalCostUSD}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      )}

      {/* Total Summary */}
      <Card className="p-4 mb-8 border-primary">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-foreground">Total</Text>
          <View className="items-end">
            <Text className="text-lg font-bold text-foreground">
              {(parseFloat(amount) + parseFloat(gasEstimate?.totalCost || '0')).toFixed(6)} {activeNetwork?.nativeCurrencySymbol}
            </Text>
            <Text className="text-muted-foreground">
              ${((parseFloat(amount) + parseFloat(gasEstimate?.totalCost || '0')) * 2500).toFixed(2)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Send Button */}
      <Button 
        onPress={handleSendTransaction}
        disabled={!gasEstimate || isLoading}
        className="w-full bg-primary"
      >
        <View className="flex-row items-center">
          <Send className="text-primary-foreground mr-2" size={16} />
          <Text className="text-primary-foreground font-medium">
            {isLoading ? 'Estimating...' : 'Send Transaction'}
          </Text>
        </View>
      </Button>
    </ScrollView>
  );

  const renderSendingStep = () => (
    <View className="flex-1 justify-center items-center p-6">
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-primary rounded-full items-center justify-center mb-4">
          <Send className="text-primary-foreground" size={24} />
        </View>
        
        <Text className="text-2xl font-bold text-center text-foreground mb-2">
          {transactionHash ? 'Transaction Sent!' : 'Sending Transaction...'}
        </Text>
        
        <Text className="text-center text-muted-foreground px-4">
          {transactionHash 
            ? `Your transaction has been broadcasted to the ${activeNetwork?.name} network.`
            : 'Please wait while we process your transaction...'
          }
        </Text>
      </View>

      {transactionHash && (
        <Card className="p-4 mb-8 w-full">
          <Text className="text-sm text-muted-foreground mb-2">Transaction Hash</Text>
          <Text className="text-xs text-foreground font-mono break-all">
            {transactionHash}
          </Text>
        </Card>
      )}

      {transactionHash && (
        <View className="w-full space-y-3">
          <Button 
            onPress={() => console.log('Navigate to activity')}
            className="w-full bg-primary"
          >
            <Text className="text-primary-foreground font-medium">View in Activity</Text>
          </Button>
          
          <Button 
            variant="outline" 
            onPress={() => router.back()}
            className="w-full"
          >
            <Text className="text-primary font-medium">Done</Text>
          </Button>
        </View>
      )}

      {!transactionHash && (
        <View className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      )}
    </View>
  );

  if (!activeWallet) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-center text-muted-foreground mb-4">
          No active wallet found. Please create or select a wallet first.
        </Text>
        <Button onPress={() => router.back()}>
          <Text className="text-primary-foreground">Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {currentStep === 0 && renderRecipientStep()}
      {currentStep === 1 && renderAmountStep()}
      {currentStep === 2 && renderReviewStep()}
      {currentStep === 3 && renderSendingStep()}
    </View>
  );
}