import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#1A237E', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#4CAF50', fontSize: 32, fontWeight: 'bold' }}>Capsula</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 16, marginTop: 10 }}>Regenerative Wallet</Text>
      <StatusBar style="light" />
    </View>
  );
}