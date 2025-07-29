import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryTheme } from 'victory-native';
import { Dimensions } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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

const BASE_URL: string = process.env.BASE_URL || 'https://ssa-server-omega.vercel.app';

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

  //   Chart data state
  const [incomeChartData, setIncomeChartData] = useState<Array<{ x: number; y: number }>>([]);
  const [expenseChartData, setExpenseChartData] = useState<Array<{ x: number; y: number }>>([]);

  //   Transaction data array with sample data
  const [transactions, setTransactions] = useState<Transaction[] | undefined>();

  const isFocused = useIsFocused();

  // Fetch transactions data from API
  useEffect(() => {
    const fetchTransactions = async (access_token: string) => {
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

          // Process daily chart data from API
          const currentDate = new Date();
          const daysInMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          ).getDate();

          // Initialize daily data
          const dailyIncome: { [key: number]: number } = {};
          const dailyExpense: { [key: number]: number } = {};

          const allDay: { [key: number]: number } = {};

          // Group transactions by day
          data.data.forEach((transaction) => {
            const transactionDate = new Date(transaction.date);
            const day = transactionDate.getDate();

            allDay[day] = day;

            if (transaction.category.type === 'income' || transaction.category.type === 'debt') {
              dailyIncome[day] = (dailyIncome[day] || 0) + transaction.ammount;
            } else if (
              transaction.category.type === 'expense' ||
              transaction.category.type === 'loan'
            ) {
              dailyExpense[day] = (dailyExpense[day] || 0) + transaction.ammount;
            }
          });

          // Create chart data arrays
          const incomeData = [];
          const expenseData = [];

          for (let day = 1; day <= daysInMonth; day++) {
            incomeData.push({
              x: day,
              y: dailyIncome[day] || 0,
            });
            expenseData.push({
              x: day,
              y: dailyExpense[day] || 0,
            });
          }

          setIncomeChartData(incomeData);
          setExpenseChartData(expenseData);

          // If no data available, show empty chart with zero values
          if (data.data.length === 0) {
            console.log('No transaction data available, showing empty chart');
          }

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
          console.log('Failed to fetch transactions. Status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    const fetchWallets = async (access_token: string) => {
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
          if (!data || data.length === 0) {
            navigation.navigate('CreateWallet');
          }
          const totalBalance = data.reduce(
            (sum: number, wallet: Wallet) => sum + wallet.balance,
            0
          );
          setWalletBalance(totalBalance);
        } else {
          console.log('  Failed to fetch wallets. Status:', response.status);
          const errorText = await response.text();
          console.log('Error response:', errorText);
        }
      } catch (error) {
        console.error('  Error fetching wallets:', error);
      }
    };
    const fetchAllData = async () => {
      const access_token = await SecureStore.getItemAsync('access_token');
      if (access_token) {
        await fetchWallets(access_token);
        await fetchTransactions(access_token);
      }
    };
    if (isFocused) {
      fetchAllData();
    }
  }, [isFocused]); // Empty dependency array means this runs once when component mounts

  //   Navigate to different wallet management screens
  const navigateToWallets = () => navigation.navigate('Wallets');
  const navigateToDebt = () => navigation.navigate('Debt');
  const navigateToLoan = () => navigation.navigate('Loan');
  const navigateToReport = () => navigation.navigate('Report');
  const navigateToNotification = () => navigation.navigate('Notification');
  const navigateToUpdate = (_id: string) => navigation.navigate('Update', { _id });

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

          {/*   Daily Transaction Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Daily Income vs Expense</Text>
              <Text style={styles.chartSubtitle}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
            </View>

            {incomeChartData.length > 0 && expenseChartData.length > 0 ? (
              <VictoryChart
                theme={VictoryTheme.material}
                height={200}
                width={Dimensions.get('window').width - 72} // Screen width minus padding
                padding={{ left: 60, top: 20, right: 0, bottom: 40 }}>
                <VictoryAxis
                  dependentAxis
                  // tickFormat={(t) => `${t.toFixed(1)}M`}
                  style={{
                    tickLabels: { fontSize: 10, fill: '#6B7280' },
                    grid: { stroke: '#F3F4F6', strokeWidth: 1 },
                  }}
                />

                <VictoryAxis
                  style={{
                    tickLabels: { fontSize: 10, fill: '#6B7280' },
                    axis: { stroke: '#E5E7EB' },
                  }}
                  tickCount={8}
                />

                <VictoryArea
                  data={incomeChartData}
                  style={{
                    data: {
                      fill: '#10B981',
                      fillOpacity: 0.2,
                      stroke: '#10B981',
                      strokeWidth: 3,
                    },
                  }}
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 },
                  }}
                />

                <VictoryArea
                  data={expenseChartData}
                  style={{
                    data: {
                      fill: '#EF4444',
                      fillOpacity: 0.2,
                      stroke: '#EF4444',
                      strokeWidth: 3,
                    },
                  }}
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 },
                  }}
                />

                <VictoryLine
                  data={incomeChartData}
                  style={{
                    data: { stroke: '#10B981', strokeWidth: 3 },
                  }}
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 },
                  }}
                />

                <VictoryLine
                  data={expenseChartData}
                  style={{
                    data: { stroke: '#EF4444', strokeWidth: 3 },
                  }}
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 },
                  }}
                />
              </VictoryChart>
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text style={styles.placeholderText}>Loading chart data...</Text>
              </View>
            )}

            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>Expense</Text>
              </View>
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
                  onPress={() => navigateToUpdate(transaction.id)}
                  activeOpacity={0.7}>
                  <View style={styles.transactionContent}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionCategory}>{transaction.category}</Text>
                      <Text style={styles.transactionDescription}>{transaction.name}</Text>
                    </View>
                    <View style={styles.transactionAmountContainer}>
                      <Text
                        style={[
                          styles.transactionAmount,
                          transaction.type === 'income' || transaction.type === 'debt'
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

  //   Chart styles
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {},
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 14,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
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
