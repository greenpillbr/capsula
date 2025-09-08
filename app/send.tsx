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
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
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
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const { activeWallet, addPendingTransaction, addTransaction, getActiveWalletBalance, refreshBalances } = useWalletStore();
  const { activeNetwork } = useNetworkStore();

  // Get the actual wallet balance
  const availableBalance = getActiveWalletBalance();
  const availableBalanceNum = parseFloat(availableBalance);

  // Validate recipient address
  const isValidRecipient = ethersService.isValidAddress(recipient);
  
  // Calculate if amount is valid using actual balance
  const isValidAmount = parseFloat(amount) > 0 && parseFloat(amount) <= availableBalanceNum;

  // Refresh balances when component mounts (force update to bypass throttling)
  useEffect(() => {
    if (activeWallet && activeNetwork) {
      refreshBalances(true); // Force update on component mount
    }
  }, [activeWallet, activeNetwork, refreshBalances]);

  useEffect(() => {
    if (currentStep === 2 && recipient && amount && activeWallet) {
      estimateGas();
    }
  }, [currentStep, recipient, amount, activeWallet]);

  const handleUseMax = async () => {
    if (!activeWallet || !activeNetwork || !recipient) return;
    
    try {
      // Estimate gas for a small transaction to get approximate gas cost
      const gasEstimate = await ethersService.estimateGas({
        to: recipient,
        value: '0.01', // Use small amount for gas estimation
        from: activeWallet.address,
      }, activeNetwork.chainId);

      // Calculate gas cost in ETH
      const gasCostWei = BigInt(gasEstimate.gasLimit) * BigInt(gasEstimate.gasPrice);
      const gasCostEth = parseFloat(ethersService.formatEther(gasCostWei));
      
      // Calculate max sendable amount (balance - gas cost - small buffer)
      const maxSendable = Math.max(0, availableBalanceNum - gasCostEth - 0.001); // 0.001 ETH buffer
      
      setAmount(maxSendable.toString());
    } catch (error) {
      console.error('Failed to calculate max amount:', error);
      // Fallback to 90% of balance as a conservative estimate
      setAmount((availableBalanceNum * 0.9).toString());
    }
  };

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
      // First, sign the transaction
      const signResult = await keyManager.signTransaction(activeWallet.id, {
        to: recipient,
        value: amount,
        gasLimit: gasEstimate.gasLimit,
        gasPrice: gasEstimate.gasPrice,
        maxFeePerGas: gasEstimate.maxFeePerGas,
        maxPriorityFeePerGas: gasEstimate.maxPriorityFeePerGas,
        chainId: activeNetwork.chainId,
      });

      if (!signResult.success || !signResult.data) {
        throw new Error(signResult.error || 'Transaction signing failed');
      }

      // Then, broadcast the signed transaction
      const sendResult = await keyManager.sendSignedTransaction(
        signResult.data.signedTransaction,
        activeNetwork.chainId
      );

      if (!sendResult.success || !sendResult.data) {
        throw new Error(sendResult.error || 'Transaction broadcast failed');
      }

      const txHash = sendResult.data.transactionHash;
      setTransactionHash(txHash);
      
      // Add to pending transactions
      const transaction: Transaction = {
        id: `tx_${Date.now()}`,
        walletId: activeWallet.id,
        chainId: activeNetwork.chainId,
        hash: txHash,
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

  const handleQRScan = async () => {
    if (!permission) {
      // Camera permissions not loaded yet
      return;
    }

    if (!permission.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to scan QR codes for addresses.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setShowQRScanner(true);
  };

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    console.log('QR Code scanned:', data);
    
    // Extract address from QR code data
    let address = data;
    
    // Handle ethereum: URI format
    if (data.startsWith('ethereum:')) {
      const match = data.match(/ethereum:([^?]+)/);
      if (match) {
        address = match[1];
      }
    }
    
    // Validate the address
    if (ethersService.isValidAddress(address)) {
      setRecipient(address);
      setShowQRScanner(false);
    } else {
      Alert.alert(
        'Invalid QR Code',
        'The scanned QR code does not contain a valid Ethereum address.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderQRScanner = () => {
    if (!showQRScanner) return null;

    return (
      <View className="absolute inset-0 bg-black z-50">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View className="flex-1 justify-center items-center">
            {/* QR Scanner Overlay */}
            <View className="absolute inset-0 bg-black/50" />
            
            {/* Scanner Frame */}
            <View className="w-64 h-64 border-2 border-primary rounded-lg bg-transparent">
              <View className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-lg" />
              <View className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-lg" />
              <View className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-lg" />
              <View className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-lg" />
            </View>
            
            {/* Instructions */}
            <Text className="text-white text-center mt-8 px-8">
              Point your camera at a QR code containing an Ethereum address
            </Text>
            
            {/* Cancel Button */}
            <View className="absolute bottom-20 left-0 right-0 px-8">
              <Button
                variant="outline"
                onPress={() => setShowQRScanner(false)}
                className="w-full border-white"
              >
                <Text className="text-white">Cancel</Text>
              </Button>
            </View>
          </View>
        </CameraView>
      </View>
    );
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
        <Button
          variant="outline"
          className="flex-1"
          onPress={handleQRScan}
        >
          <Text className="text-primary">Scan QR</Text>
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onPress={() => Alert.alert('Coming Soon', 'Contacts feature will be available in the next update.')}
        >
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
          {parseFloat(availableBalance).toFixed(6)} {activeNetwork?.nativeCurrencySymbol || 'ETH'}
        </Text>
        <Pressable onPress={handleUseMax}>
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
            onPress={() => router.push('/(tabs)/activity')}
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
      
      {/* QR Scanner Modal */}
      {renderQRScanner()}
    </View>
  );
}