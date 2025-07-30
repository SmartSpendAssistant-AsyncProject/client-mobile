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
          value={amount === 0 ? '' : amount.toString()}
          onChangeText={(text) => onChangeAmount(text === '' ? 0 : Number(text))}
          placeholder="Rp. 0"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
      </View>

      {/* Card 2: Wallets */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {mode === 'repay' ? 'Pay from Wallet' : 'Collect to Wallet'}
        </Text>
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
                    color: isSelected ? 'rgba(255, 255, 255, 0.9)' : '#6B7280',
                    fontSize: 12,
                    fontWeight: '600',
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
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>{targetName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#3b667c' }}>
              Rp. {amount.toLocaleString('id-ID')}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{mode === 'repay' ? 'From:' : 'To:'}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
              {selectedWallet.name}
            </Text>
          </View>

          <View
            style={[
              styles.row,
              { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, marginTop: 6 },
            ]}>
            <Text style={[styles.label, { fontSize: 16, color: '#1F2937' }]}>Remaining:</Text>
            <Text
              style={{
                color: mode === 'repay' ? '#EF4444' : '#10B981',
                fontWeight: '700',
                fontSize: 16,
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
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 10,
    color: '#1F2937',
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#3b667c',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  walletList: {
    maxHeight: 160,
  },
  walletItem: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  walletName: {
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#374151',
  },
});
