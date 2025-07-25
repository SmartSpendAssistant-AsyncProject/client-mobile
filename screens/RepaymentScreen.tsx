import React, { useState } from 'react';
import { View, Button, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import CardRepayCollect from '../components/CardRepayCollect';

const dummyWallets = [
  { id: 'w1', name: 'Gopay', balance: 800000 },
  { id: 'w2', name: 'ShopeePay', balance: 150000 },
  { id: 'w3', name: 'Dana', balance: 500000 },
  { id: 'w4', name: 'Dana 1', balance: 100000 },
  { id: 'w5', name: 'Dana 2', balance: 200000 },
  { id: 'w6', name: 'Dana 3', balance: 300000 },
  { id: 'w7', name: 'Dana 4', balance: 400000 },
  { id: 'w8', name: 'Dana 5', balance: 500000 },
  { id: 'w9', name: 'Dana 6', balance: 600000 },
  { id: 'w10', name: 'Dana 7', balance: 700000 },
  { id: 'w11', name: 'Dana 8', balance: 800000 },
  { id: 'w12', name: 'Dana 9', balance: 900000 },
  { id: 'w13', name: 'Dana 10', balance: 1000000 },
];

export default function RepaymentScreen({ navigation }: any) {
  // Sementara any dulu
  const [amount, setAmount] = useState(0);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleRepay = () => {
    if (!selectedWalletId || amount <= 0) {
      alert('Please fill out payment info');
      return;
    }

    const selectedWallet = dummyWallets.find((w) => w.id === selectedWalletId);
    if (selectedWallet && selectedWallet.balance < amount) {
      alert(`Insufficient balance in ${selectedWallet.name}`);
      return;
    }

    alert(`Payment of Rp ${amount.toLocaleString('id-ID')} from ${selectedWalletId} submitted`);

    navigation.navigate('Debt'); // Sementara
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
            mode="repay"
            targetName="Credit Card - BCA"
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
          <Button title="Process Payment" onPress={handleRepay} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}
