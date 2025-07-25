import React, { useState } from 'react';
import { View, Button, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import CardRepayCollect from '../components/CardRepayCollect';

const dummyWallets = [
  { id: 'w1', name: 'Amar', balance: 50000 },
  { id: 'w2', name: 'Budi', balance: 1000 },
  { id: 'w3', name: 'Budu', balance: 20000 },
  { id: 'w4', name: 'Damar 1', balance: 10000 },
  { id: 'w5', name: 'Damar 2', balance: 20000 },
  { id: 'w6', name: 'Damar 3', balance: 30000 },
  { id: 'w7', name: 'Damar 4', balance: 40000 },
  { id: 'w8', name: 'Damar 5', balance: 50000 },
  { id: 'w9', name: 'Damar 6', balance: 60000 },
  { id: 'w10', name: 'Damar 7', balance: 70000 },
  { id: 'w11', name: 'Damar 8', balance: 800000 },
  { id: 'w12', name: 'Damar 9', balance: 900000 },
  { id: 'w13', name: 'Damar 10', balance: 1000000 },
];

export default function DebtCollectionScreen({ navigation }: any) {
  const [amount, setAmount] = useState(0);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleCollect = () => {
    if (!selectedWalletId || amount <= 0) {
      alert('Please fill out collection info');
      return;
    }

    alert(`Collection of Rp ${amount.toLocaleString('id-ID')} stored to ${selectedWalletId}`);
    navigation.navigate('Loan'); // nanti bisa diarahkan ke 'Loan' atau halaman success
  };

  //TODO: sementara SafeAreaProvider di page ini saja, mungkin nanti di App.tsx
  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, padding: 16 }}>
          <CardRepayCollect
            amount={amount}
            wallets={dummyWallets}
            selectedWalletId={selectedWalletId}
            onChangeAmount={setAmount}
            onSelectWallet={setSelectedWalletId}
            mode="collect"
            targetName="User Amar"
          />
        </View>

        <View
          style={{
            backgroundColor: 'white',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderColor: '#ddd',
          }}>
          <Button title="Confirm Collection" onPress={handleCollect} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}
