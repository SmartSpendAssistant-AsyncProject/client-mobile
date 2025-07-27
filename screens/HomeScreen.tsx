import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';

//   Transaction interface for type safety
interface Transaction {
  id: number;
  category: string;
  description: string;
  amount: string;
  bgColor: string;
  type: 'income' | 'expense';
}

export default function HomeScreen() {
  //   Navigation hook for screen transitions
  const navigation = useNavigation<RootStackNavigationProp>();

  //   State management for wallet data and transactions
  const [walletBalance] = useState('Rp. 1.000.000,00');
  const [debt] = useState('Rp. 10.000');
  const [loan] = useState('Rp. 100.000');
  const [monthlyIncome] = useState('Rp. 100.000');
  const [monthlyExpense] = useState('Rp. 100.000');

  //   Transaction data array with sample data
  const [transactions] = useState<Transaction[]>([
    {
      id: 1,
      category: 'Entertainment',
      description: 'Watch some movies with friends.',
      amount: '- Rp. 100.000',
      bgColor: '#F3F4F6', // Light gray
      type: 'expense',
    },
    {
      id: 2,
      category: 'Food & Dining',
      description: 'Lunch at restaurant downtown.',
      amount: '- Rp. 75.000',
      bgColor: '#FEF2F2', // Light red
      type: 'expense',
    },
    {
      id: 3,
      category: 'Salary',
      description: 'Monthly salary deposit.',
      amount: '+ Rp. 500.000',
      bgColor: '#F0FDF4', // Light green
      type: 'income',
    },
    {
      id: 4,
      category: 'Transportation',
      description: 'Grab ride to office.',
      amount: '- Rp. 25.000',
      bgColor: '#FEF2F2', // Light red
      type: 'expense',
    },
    {
      id: 5,
      category: 'Shopping',
      description: 'Grocery shopping weekend.',
      amount: '- Rp. 150.000',
      bgColor: '#FEF2F2', // Light red
      type: 'expense',
    },
  ]);

  //   Handle transaction item press with navigation placeholder
  const handleTransactionPress = (transaction: Transaction) => {
    Alert.alert(
      'Transaction Details',
      `Category: ${transaction.category}\nAmount: ${transaction.amount}\nDescription: ${transaction.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View Details',
          onPress: () => {
            //   Placeholder for future navigation to transaction details
            console.log('Navigate to transaction details for ID:', transaction.id);
            // TODO: Navigate to transaction details screen
            // navigation.navigate('TransactionDetails', { transactionId: transaction.id });
          },
        },
      ]
    );
  };

  //   Navigate to different wallet management screens
  const navigateToWallets = () => navigation.navigate('Wallets');
  const navigateToDebt = () => navigation.navigate('Debt');
  const navigateToLoan = () => navigation.navigate('Loan');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/*   Main content container with padding */}
        <View style={styles.content}>
          {/*   Wallet balance card section - entire card is clickable */}
          <TouchableOpacity
            style={styles.walletCard}
            onPress={navigateToWallets}
            activeOpacity={0.8}>
            <View style={styles.walletCardContent}>
              <Text style={styles.walletTitle}>Wallet one</Text>
              <Text style={styles.balanceLabel}>Total balance:</Text>
              <Text style={styles.balanceAmount}>{walletBalance}</Text>
            </View>

            {/*   Dollar sign icon positioned absolutely like the design */}
            <View style={styles.dollarIconContainer}>
              <Text style={styles.dollarIcon}>$</Text>
            </View>
          </TouchableOpacity>

          {/*   Debt and loan cards grid */}
          <View style={styles.cardGrid}>
            <TouchableOpacity style={styles.smallCard} onPress={navigateToDebt}>
              <Text style={styles.cardLabel}>Debt</Text>
              <Text style={styles.cardAmount}>{debt}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallCard} onPress={navigateToLoan}>
              <Text style={styles.cardLabel}>Loan</Text>
              <Text style={styles.cardAmount}>{loan}</Text>
            </TouchableOpacity>
          </View>

          {/*   Monthly activities header */}
          <Text style={styles.sectionTitle}>Monthly Activities</Text>

          {/*   Income and expense cards grid */}
          <View style={styles.cardGrid}>
            <View style={[styles.smallCard, styles.incomeCard]}>
              <Text style={styles.cardLabel}>Income</Text>
              <Text style={styles.cardAmount}>{monthlyIncome}</Text>
            </View>
            <View style={[styles.smallCard, styles.expenseCard]}>
              <Text style={styles.cardLabel}>Expense</Text>
              <Text style={styles.cardAmount}>{monthlyExpense}</Text>
            </View>
          </View>

          {/*   Transaction list section */}
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.transactionList}>
            {transactions.map((transaction) => {
              //   Individual transaction card with press handler
              return (
                <TouchableOpacity
                  key={transaction.id}
                  style={[styles.transactionCard, { backgroundColor: transaction.bgColor }]}
                  onPress={() => handleTransactionPress(transaction)}
                  activeOpacity={0.7}>
                  <View style={styles.transactionContent}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionCategory}>{transaction.category}</Text>
                      <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    </View>
                    <View style={styles.transactionAmountContainer}>
                      <Text
                        style={[
                          styles.transactionAmount,
                          transaction.type === 'income'
                            ? styles.incomeAmount
                            : styles.expenseAmount,
                        ]}>
                        {transaction.amount}
                      </Text>
                      <Text style={styles.tapHint}>Tap for details</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

//   StyleSheet object for component styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100, // Extra space for tab navigation
  },

  //   Wallet balance card styles
  walletCard: {
    backgroundColor: '#3b667c', // Slate-600
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  walletCardContent: {
    position: 'relative',
    zIndex: 10,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dollarIconContainer: {
    position: 'absolute',
    right: -8,
    bottom: -32,
    transform: [{ rotate: '25deg' }],
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dollarIcon: {
    fontSize: 100,
    color: '#FFFFFF',
    opacity: 1,
    fontWeight: 'bold',
  },

  //   Card grid and small card styles
  cardGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#3b667c', // Slate-600
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  incomeCard: {
    backgroundColor: '#10B981', // Green-500
  },
  expenseCard: {
    backgroundColor: '#EF4444', // Red-500
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  //   Section title styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    marginTop: 8,
  },

  //   Transaction list styles
  transactionList: {
    gap: 12,
    marginBottom: 24,
  },
  transactionCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  incomeAmount: {
    color: '#10B981', // Green for income
  },
  expenseAmount: {
    color: '#EF4444', // Red for expense
  },
  tapHint: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
