import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Pressable,
  StatusBar,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';
import * as Notifications from 'expo-notifications';
import {
  Bell,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react-native';

//   Transaction interface for type safety
interface Transaction {
  id: string;
  name: string;
  category: string;
  description: string;
  amount: string;
  bgColor: string;
  type: string;
  date: string; // Assuming date is a string in ISO format
}

const BASE_URL = process.env.BASE_URL || 'https://ssa-server-omega.vercel.app';
const access_token =
  'eyJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI2ODgyNDhmYjc2NTM3ZGQ0ZjZjYzllMDkifQ.Wg9sGQZ4Go_rLGXtwiJPUshoee5wW1GjELrzwiLU850';

export interface ITransactionsResponse {
  message: string;
  summaryData: SummaryData;
  summayAllTransactions: SummayAllTransactions;
  data: TransactionData[];
  total: number;
  filter: Filter;
}

export interface SummaryData {
  income: number;
  expense: number;
  netIncome: number;
}

export interface SummayAllTransactions {
  totalDebt: number;
  totalLoan: number;
}

export interface TransactionData {
  _id: string;
  name: string;
  description: string;
  ammount: number;
  date: string;
  category_id: string;
  wallet_id: string;
  remaining_ammount: number;
  parent_id?: string;
  message_id?: string;
  createdAt: string;
  updatedAt: string;
  wallet: Wallet;
  category: Category;
}

export interface Wallet {
  _id: string;
  name: string;
  description: string;
  type: string;
  balance: number;
  target: number;
  threshold: number;
  user_id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Category {
  _id: string;
  name: string;
  type: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Filter {
  month: string;
  year: any;
  category_id: any;
  parent_id: any;
  wallet_id: any;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function HomeScreen() {
  //   Navigation hook for screen transitions
  const navigation = useNavigation<RootStackNavigationProp>();

  //   State management for wallet data and transactions
  const [walletBalance, setWalletBalance] = useState(0);
  const [debt, setDebt] = useState(0);
  const [loan, setLoan] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);

  //   Transaction data array with sample data
  const [transactions, setTransactions] = useState<Transaction[] | undefined>();

  const isFocused = useIsFocused();

  // Fetch transactions data from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        console.log('Fetching transactions from API...');
        // Get current month and year in YYYY-MM format
        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

        const response = await fetch(`${BASE_URL}/api/transactions?month=${currentMonth}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        });

        if (response.ok) {
          const data: ITransactionsResponse = await response.json();
          setDebt(data.summayAllTransactions.totalDebt);
          setLoan(data.summayAllTransactions.totalLoan);
          setMonthlyIncome(data.summaryData.income);
          setMonthlyExpense(data.summaryData.expense);
          if (data.data.length > 0) {
            const latestTransaction = new Date(data.data[0].date).toISOString().split('T')[0];
            const latestTransactions = data.data.filter(
              (transaction) =>
                new Date(transaction.date).toISOString().split('T')[0] === latestTransaction
            );
            const formattedTransactions = latestTransactions.map((transaction) => ({
              id: transaction._id,
              name: transaction.name,
              category: transaction.category.name,
              description: transaction.description,
              amount: transaction.ammount.toLocaleString('id-ID'),
              bgColor:
                transaction.category.type === 'income' || transaction.category.type === 'debt'
                  ? '#F0FDF4'
                  : '#FEF2F2',
              type: transaction.category.type,
              date: new Date(transaction.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
            }));
            setTransactions(formattedTransactions);
          }
        } else {
          console.log('❌ Failed to fetch transactions. Status:', response.status);
          const errorText = await response.text();
          console.log('Error response:', errorText);
        }
      } catch (error) {
        console.error('❌ Error fetching transactions:', error);
      }
    };
    const fethchWallets = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/wallets`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const totalBalance = data.reduce(
            (sum: number, wallet: Wallet) => sum + wallet.balance,
            0
          );
          setWalletBalance(totalBalance);
        } else {
          console.log('❌ Failed to fetch wallets. Status:', response.status);
          const errorText = await response.text();
          console.log('Error response:', errorText);
        }
      } catch (error) {
        console.error('❌ Error fetching wallets:', error);
      }
    };
    if (isFocused) {
      fetchTransactions();
      fethchWallets();
    }
  }, [isFocused]); // Empty dependency array means this runs once when component mounts

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
  const navigateToReport = () => navigation.navigate('Report');
  const navigateToNotification = () => navigation.navigate('Notification');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Set status bar style */}
      <StatusBar barStyle="light-content" backgroundColor="#3b667c" />

      {/* Custom header component */}
      <View
        style={{
          backgroundColor: '#3b667c',
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        {/* Wallet icon in header */}
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Wallet size={20} color="#FFFFFF" />
        </View>

        {/* Header title and subtitle */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: '600',
            }}>
            Smart Spend Assistant
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
            }}>
            Financial Dashboard
          </Text>
        </View>

        {/* Notification button */}
        <TouchableOpacity
          onPress={navigateToNotification}
          style={{
            width: 40,
            height: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={0.7}>
          <Bell size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/*   Main content container with padding */}
        <View style={styles.content}>
          {/*   Wallet balance card section - entire card is clickable */}
          <TouchableOpacity
            style={styles.walletCard}
            onPress={navigateToWallets}
            activeOpacity={0.8}>
            <View style={styles.walletCardContent}>
              {/* <Text style={styles.walletTitle}>Wallet one</Text> */}
              <Text style={styles.balanceLabel}>Total balance:</Text>
              <Text style={styles.balanceAmount}>Rp. {walletBalance.toLocaleString('id-ID')}</Text>
            </View>

            {/*   Dollar sign icon positioned absolutely like the design */}
            <View style={styles.dollarIconContainer}>
              <Text style={styles.dollarIcon}>$</Text>
            </View>
          </TouchableOpacity>

          {/*   Debt and loan cards grid */}
          <View style={styles.cardGrid}>
            <TouchableOpacity style={styles.smallCard} onPress={navigateToDebt}>
              <View style={styles.cardHeader}>
                <CreditCard size={20} color="#FFFFFF" />
                <Text style={styles.cardLabel}>Debt</Text>
              </View>
              <Text style={styles.cardAmount}>Rp. {debt.toLocaleString('id-ID')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallCard} onPress={navigateToLoan}>
              <View style={styles.cardHeader}>
                <DollarSign size={20} color="#FFFFFF" />
                <Text style={styles.cardLabel}>Loan</Text>
              </View>
              <Text style={styles.cardAmount}>Rp. {loan.toLocaleString('id-ID')}</Text>
            </TouchableOpacity>
          </View>

          {/*   Monthly activities header */}
          <Text style={styles.sectionTitle}>Monthly Activities</Text>

          {/*   Income and expense cards grid */}
          <View style={styles.cardGrid}>
            <View style={[styles.smallCard, styles.incomeCard]}>
              <View style={styles.cardHeader}>
                <TrendingUp size={20} color="#FFFFFF" />
                <Text style={styles.cardLabel}>Income</Text>
              </View>
              <Text style={styles.cardAmount}>Rp. {monthlyIncome.toLocaleString('id-ID')}</Text>
            </View>
            <View style={[styles.smallCard, styles.expenseCard]}>
              <View style={styles.cardHeader}>
                <TrendingDown size={20} color="#FFFFFF" />
                <Text style={styles.cardLabel}>Expense</Text>
              </View>
              <Text style={styles.cardAmount}>Rp. {monthlyExpense.toLocaleString('id-ID')}</Text>
            </View>
          </View>

          {/*   Transaction list section */}
          <View style={styles.transactionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={navigateToReport}>
              <Text style={styles.viewAllLink}>View All Transactions</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionList}>
            {transactions?.map((transaction) => {
              //   Individual transaction card with press handler
              return (
                <TouchableOpacity
                  key={transaction.id}
                  style={[styles.transactionCard, { backgroundColor: transaction.bgColor }]}
                  onPress={() => handleTransactionPress(transaction)}
                  activeOpacity={0.7}>
                  <View style={styles.transactionContent}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionCategory}>{transaction.name}</Text>
                      <Text style={styles.transactionDescription}>{transaction.category}</Text>
                    </View>
                    <View style={styles.transactionAmountContainer}>
                      <Text
                        style={[
                          styles.transactionAmount,
                          transaction.type === 'income'
                            ? styles.incomeAmount
                            : styles.expenseAmount,
                        ]}>
                        Rp. {transaction.amount}
                      </Text>
                      <Text style={styles.tapHint}>{transaction.date}</Text>
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
    backgroundColor: '#FFFFFF', // White background to match ChatScreen
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background for content area
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
  walletIconContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    marginLeft: 8,
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

  //   Transaction header styles
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  viewAllLink: {
    fontSize: 14,
    color: '#3b667c',
    fontWeight: '600',
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
