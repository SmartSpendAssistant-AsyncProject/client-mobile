import React from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';

interface IWallet {
  id: string;
  name: string;
  balance: number;
}

interface IRepayCollect {
  amount: number;
  wallets: IWallet[];
  selectedWalletId: string | null;
  onChangeAmount: (value: number) => void;
  onSelectWallet: (id: string) => void;
  mode?: 'repay' | 'collect'; // logic yang akan menentukan + atau - pada remaining
  targetName?: string;
}

export default function CardRepayCollect({
  amount,
  wallets,
  selectedWalletId,
  onChangeAmount,
  onSelectWallet,
  mode = 'repay',
  targetName = 'Target',
}: IRepayCollect) {
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const remaining =
    selectedWallet && mode === 'repay'
      ? selectedWallet.balance - amount
      : selectedWallet
        ? selectedWallet.balance + amount
        : null;

  return (
    <View style={styles.container}>
      {/* Card 1: Input Amount */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {mode === 'repay' ? 'Payment Amount' : 'Collection Amount'}
        </Text>
        <TextInput
          keyboardType="numeric"
          value={amount.toString()}
          onChangeText={(text) => onChangeAmount(Number(text))}
          placeholder="Rp. 0"
          style={styles.input}
        />
      </View>

      {/* Card 2: Wallets */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pay from Wallet</Text>
        <FlatList
          data={wallets}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.walletList}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedWalletId;
            return (
              <Pressable
                onPress={() => onSelectWallet(item.id)}
                style={[
                  styles.walletItem,
                  {
                    backgroundColor: isSelected ? '#3b667c' : '#f1f1f1',
                    borderColor: isSelected ? '#3b667c' : '#ccc',
                  },
                ]}>
                <Text style={[styles.walletName, { color: isSelected ? 'white' : '#000' }]}>
                  {item.name}
                </Text>
                <Text
                  style={{
                    color: isSelected ? 'white' : '#444',
                    fontSize: 12,
                  }}>
                  Rp. {item.balance.toLocaleString('id-ID')}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Card 3: Summary */}
      {selectedWallet && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {mode === 'repay' ? 'Payment Summary' : 'Collection Summary'}
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>{mode === 'repay' ? 'To:' : 'From:'}</Text>
            <Text>{targetName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Amount:</Text>
            <Text>Rp. {amount.toLocaleString('id-ID')}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{mode === 'repay' ? 'From:' : 'To:'}</Text>
            <Text>{selectedWallet.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Remaining:</Text>
            <Text
              style={{
                color: mode === 'repay' ? 'red' : 'green',
                fontWeight: '600',
              }}>
              Rp. {remaining?.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  walletList: {
    height: 300,
  },
  walletItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  walletName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: 80,
    fontWeight: '600',
  },
});
