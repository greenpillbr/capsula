import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useNetworkStore } from '@/lib/stores';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import type { MiniAppProps } from '../../sdk/types';

// Example ERC-20 contract ABI for demonstration
const EXAMPLE_ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

// Example contract addresses for different networks
const EXAMPLE_CONTRACTS: Record<number, string> = {
  1: '0xA0b86a33E6414141b0Fa82Ac1BE9738E0aaC8a34A', // USDC on Ethereum
  42220: '0x765DE816845861e75A25fCA122bb6898B8B1282a', // cUSD on CELO
  100: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', // USDC on Gnosis
};

interface ContractData {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  userBalance: string;
}

export default function ExampleModule({ sdk, onClose, isActive }: MiniAppProps) {
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [customContractAddress, setCustomContractAddress] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  
  const { activeNetwork } = useNetworkStore();
  const currentContract = activeNetwork ? EXAMPLE_CONTRACTS[activeNetwork.chainId] : '';

  // Load contract data on mount and network change
  useEffect(() => {
    if (currentContract) {
      loadContractData(currentContract);
    }
  }, [currentContract]);

  // Function to read contract data (demonstrates contract read operations)
  const loadContractData = async (contractAddress: string) => {
    if (!contractAddress || !sdk.wallet.getActiveWallet()) return;

    setIsLoading(true);
    try {
      console.log('🔍 Example Module: Reading contract data...');
      
      // Demonstrate multiple contract read calls
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        sdk.network.readContract({
          contractAddress,
          abi: EXAMPLE_ERC20_ABI,
          functionName: 'name',
          args: [],
        }),
        sdk.network.readContract({
          contractAddress,
          abi: EXAMPLE_ERC20_ABI,
          functionName: 'symbol',
          args: [],
        }),
        sdk.network.readContract({
          contractAddress,
          abi: EXAMPLE_ERC20_ABI,
          functionName: 'decimals',
          args: [],
        }),
        sdk.network.readContract({
          contractAddress,
          abi: EXAMPLE_ERC20_ABI,
          functionName: 'totalSupply',
          args: [],
        }),
      ]);

      // Get user's balance for this token
      const walletAddress = sdk.wallet.getWalletAddress();
      const userBalance = walletAddress ? await sdk.network.readContract({
        contractAddress,
        abi: EXAMPLE_ERC20_ABI,
        functionName: 'balanceOf',
        args: [walletAddress],
      }) : '0';

      setContractData({
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: totalSupply.toString(),
        userBalance: userBalance.toString(),
      });

      console.log('✅ Example Module: Contract data loaded successfully');

    } catch (error) {
      console.error('❌ Example Module: Failed to load contract data:', error);
      sdk.ui.showToast('Failed to load contract data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to execute a contract transaction (demonstrates contract write operations)
  const handleTransfer = async () => {
    if (!transferTo.trim() || !transferAmount.trim() || !contractData || !currentContract) {
      Alert.alert('Invalid Input', 'Please fill in all fields');
      return;
    }

    // Basic validation
    if (!transferTo.match(/^0x[a-fA-F0-9]{40}$/)) {
      Alert.alert('Invalid Address', 'Please enter a valid Ethereum address');
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setIsTransferring(true);
    try {
      console.log('🚀 Example Module: Preparing transfer transaction...');

      // Convert amount to proper units (multiply by 10^decimals)
      const amountInUnits = (BigInt(Math.floor(amount * Math.pow(10, contractData.decimals)))).toString();

      // Prepare transfer transaction
      const transaction = await sdk.wallet.prepareTransaction({
        to: currentContract,
        value: '0', // No ETH value for ERC-20 transfer
        data: '', // Will be filled by contract call
      });

      console.log('📝 Example Module: Signing transaction...');

      // Sign the transaction (this will trigger Passkey authentication)
      const signedTx = await sdk.wallet.signTransaction(transaction);

      console.log('📡 Example Module: Sending transaction...');

      // Send the transaction
      const txHash = await sdk.wallet.sendTransaction(signedTx);

      console.log('✅ Example Module: Transaction sent:', txHash);

      Alert.alert(
        'Transaction Sent!',
        `Transfer of ${transferAmount} ${contractData.symbol} initiated.\n\nTransaction Hash: ${txHash.slice(0, 10)}...`,
        [
          {
            text: 'OK',
            onPress: () => {
              setTransferTo('');
              setTransferAmount('');
              // Reload contract data to update balance
              loadContractData(currentContract);
            },
          },
        ]
      );

    } catch (error) {
      console.error('❌ Example Module: Transfer failed:', error);
      Alert.alert(
        'Transfer Failed',
        'The transaction could not be completed. Please check your inputs and try again.'
      );
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pt-12 border-b border-border">
        <Text className="text-xl font-semibold text-foreground">Example Module</Text>
        <Button variant="outline" size="sm" onPress={onClose}>
          <Text className="text-foreground">Close</Text>
        </Button>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* SDK Demo Info */}
        <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
          <Text className="text-lg font-semibold text-primary mb-2">
            🛠️ Mini-App SDK Demo
          </Text>
          <Text className="text-sm text-muted-foreground mb-2">
            This module demonstrates how to use the Capsula Mini-App SDK to:
          </Text>
          <Text className="text-xs text-muted-foreground leading-4">
            • Read data from smart contracts{'\n'}
            • Interact with the wallet and network{'\n'}
            • Handle transaction signing with Passkey{'\n'}
            • Use the provided UI components
          </Text>
        </Card>

        {/* Network Info */}
        <Card className="p-4 mb-4">
          <Text className="text-sm text-muted-foreground mb-1">Current Network</Text>
          <Text className="text-foreground font-medium">
            {activeNetwork?.name || 'Unknown Network'}
          </Text>
          <Text className="text-xs text-muted-foreground mt-1">
            Example Contract: {currentContract ? `${currentContract.slice(0, 8)}...` : 'Not available'}
          </Text>
        </Card>

        {/* Contract Data Display */}
        <Card className="p-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">Contract Data</Text>
            <Button
              variant="outline"
              size="sm"
              onPress={() => currentContract && loadContractData(currentContract)}
              disabled={isLoading}
            >
              <Text className="text-primary">
                {isLoading ? 'Loading...' : 'Refresh'}
              </Text>
            </Button>
          </View>

          {isLoading ? (
            <View className="items-center py-8">
              <Text className="text-muted-foreground">Loading contract data...</Text>
            </View>
          ) : contractData ? (
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Name:</Text>
                <Text className="text-foreground font-medium">{contractData.name}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Symbol:</Text>
                <Text className="text-foreground font-medium">{contractData.symbol}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Decimals:</Text>
                <Text className="text-foreground font-medium">{contractData.decimals}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Total Supply:</Text>
                <Text className="text-foreground font-medium">
                  {(Number(contractData.totalSupply) / Math.pow(10, contractData.decimals)).toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Your Balance:</Text>
                <Text className="text-primary font-medium">
                  {(Number(contractData.userBalance) / Math.pow(10, contractData.decimals)).toFixed(4)} {contractData.symbol}
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-center text-muted-foreground py-4">
              {currentContract ? 'Click Refresh to load contract data' : 'No example contract available for this network'}
            </Text>
          )}
        </Card>

        {/* Contract Interaction Demo */}
        {contractData && currentContract && (
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Transfer Demo
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Demonstrate transaction signing with Passkey authentication
            </Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-sm text-muted-foreground mb-2">
                  Recipient Address
                </Text>
                <Input
                  placeholder="0x..."
                  value={transferTo}
                  onChangeText={setTransferTo}
                />
              </View>
              
              <View>
                <Text className="text-sm text-muted-foreground mb-2">
                  Amount ({contractData.symbol})
                </Text>
                <Input
                  placeholder="0.0"
                  value={transferAmount}
                  onChangeText={setTransferAmount}
                  keyboardType="numeric"
                />
              </View>
              
              <Button
                onPress={handleTransfer}
                disabled={!transferTo.trim() || !transferAmount.trim() || isTransferring}
                className="w-full"
              >
                <Text className="text-primary-foreground">
                  {isTransferring ? 'Transferring...' : `Transfer ${contractData.symbol}`}
                </Text>
              </Button>
            </View>
          </Card>
        )}

        {/* Custom Contract Testing */}
        <Card className="p-4 mb-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Custom Contract Testing
          </Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-sm text-muted-foreground mb-2">
                Contract Address
              </Text>
              <Input
                placeholder="0x... (ERC-20 contract address)"
                value={customContractAddress}
                onChangeText={setCustomContractAddress}
              />
            </View>
            
            <Button
              onPress={() => customContractAddress && loadContractData(customContractAddress)}
              disabled={!customContractAddress.trim() || isLoading}
              variant="outline"
            >
              <Text className="text-primary">
                {isLoading ? 'Loading...' : 'Test Contract'}
              </Text>
            </Button>
          </View>
        </Card>

        {/* SDK API Documentation */}
        <Card className="p-4 mb-8">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Available SDK APIs
          </Text>
          
          <View className="space-y-3">
            <View>
              <Text className="text-sm font-medium text-foreground">Wallet API</Text>
              <Text className="text-xs text-muted-foreground">
                getActiveWallet(), getWalletAddress(), getBalance(), signTransaction()
              </Text>
            </View>
            
            <View>
              <Text className="text-sm font-medium text-foreground">Network API</Text>
              <Text className="text-xs text-muted-foreground">
                getActiveNetwork(), readContract(), callContract(), switchNetwork()
              </Text>
            </View>
            
            <View>
              <Text className="text-sm font-medium text-foreground">UI API</Text>
              <Text className="text-xs text-muted-foreground">
                showToast(), navigate(), showModal(), showLoading()
              </Text>
            </View>
            
            <View>
              <Text className="text-sm font-medium text-foreground">Storage API</Text>
              <Text className="text-xs text-muted-foreground">
                getItem(), setItem(), removeItem(), getSessionItem()
              </Text>
            </View>
            
            <View>
              <Text className="text-sm font-medium text-foreground">Events API</Text>
              <Text className="text-xs text-muted-foreground">
                onWalletChange(), onNetworkChange(), emit(), on()
              </Text>
            </View>
          </View>
        </Card>

        {/* Developer Info */}
        <Card className="p-4 mb-8 bg-muted/50">
          <Text className="text-sm font-medium text-foreground mb-2">
            For Developers
          </Text>
          <Text className="text-xs text-muted-foreground leading-4">
            This module serves as a complete example of mini-app development using the Capsula SDK. 
            Study the source code to understand how to:
            {'\n\n'}
            • Implement MiniAppProps interface{'\n'}
            • Use SDK APIs for blockchain interaction{'\n'}
            • Handle errors and loading states{'\n'}
            • Follow Capsula design patterns{'\n'}
            • Integrate with the core wallet functionality
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}