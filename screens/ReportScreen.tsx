import React, { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';
import { VictoryPie, VictoryLabel } from 'victory-native';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';

type Wallet = {
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
};

type Category = {
  _id: string;
  name: string;
  type: 'income' | 'expense' | 'loan' | 'debt';
  user_id: string;
  createdAt: string;
  updatedAt: string;
};

type Transaction = {
  _id: string;
  name: string;
  description: string;
  ammount: number; // Note: API uses "ammount" (typo in API)
  date: string;
  category_id: string;
  wallet_id: string;
  parent_id: string | null;
  remaining_ammount: number;
  message_id: string | null;
  createdAt: string;
  updatedAt: string;
  wallet: Wallet;
  category: Category;
};

type SummaryData = {
  income: number;
  expense: number;
  netIncome: number;
};

type SummaryAllTransactions = {
  totalDebt: number;
  totalLoan: number;
};

type ApiResponse = {
  message: string;
  summaryData: SummaryData;
  summayAllTransactions: SummaryAllTransactions; // Note: API has typo "summay"
  data: Transaction[];
  total: number;
  filter: {
    month: string;
    year: string | null;
    category_id: string | null;
    parent_id: string | null;
    wallet_id: string | null;
  };
};

// UI Display Types
type ReportItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
};

type PieChartData = {
  x: string; // category name
  y: number; // amount
  color?: string;
};

type CategorySummary = {
  [categoryName: string]: number;
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Helper function to get current month abbreviation
const getCurrentMonth = (): string => {
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  return months[currentMonthIndex];
};

// Helper function to convert month name to month number
const getMonthNumber = (monthName: string): string => {
  const monthIndex = months.indexOf(monthName) + 1;
  return monthIndex.toString().padStart(2, '0');
};

// Helper function to convert API transaction to ReportItem
const transformTransactionToReportItem = (transaction: Transaction): ReportItem => {
  // Determine type based on category type
  let type: 'income' | 'expense' = 'expense';

  if (transaction.category.type === 'income' || transaction.category.type === 'debt') {
    type = 'income';
  } else if (transaction.category.type === 'loan' || transaction.category.type === 'expense') {
    type = 'expense';
  }

  return {
    id: transaction._id,
    title: transaction.name,
    category: transaction.category.name,
    date: new Date(transaction.date).toISOString().split('T')[0],
    amount: transaction.ammount,
    type: type,
  };
};

export default function ReportScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [transactions, setTransactions] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Summary data states
  const [summaryData, setSummaryData] = useState<SummaryData>({
    income: 0,
    expense: 0,
    netIncome: 0,
  });

  // Pie chart data states
  const [incomePieData, setIncomePieData] = useState<PieChartData[]>([]);
  const [expensePieData, setExpensePieData] = useState<PieChartData[]>([]);

  const BASE_URL = process.env.BASE_URL || 'https://ssa-server-omega.vercel.app';

  // Function to process transactions data for pie charts
  const processCategoryData = (
    transactions: Transaction[]
  ): {
    income: PieChartData[];
    expense: PieChartData[];
  } => {
    const incomeCategories: CategorySummary = {};
    const expenseCategories: CategorySummary = {};

    transactions.forEach((transaction) => {
      const categoryName = transaction.category.name;
      const amount = transaction.ammount;
      const categoryType = transaction.category.type;

      // Group income and debt as income, loan and expense as expense
      if (categoryType === 'income' || categoryType === 'debt') {
        incomeCategories[categoryName] = (incomeCategories[categoryName] || 0) + amount;
      } else if (categoryType === 'loan' || categoryType === 'expense') {
        expenseCategories[categoryName] = (expenseCategories[categoryName] || 0) + amount;
      }
    });

    // Convert to pie chart data format with colors
    const incomeColors = [
      '#22c55e', // Green
      '#3b82f6', // Blue
      '#0891b2', // Cyan-600
      '#06b6d4', // Cyan
      '#10b981', // Emerald
      '#6366f1', // Indigo
      '#84cc16', // Lime
      '#0ea5e9', // Sky
      '#14b8a6', // Teal
      '#8b5a2b', // Brown
      '#f59e0b', // Amber
      '#eab308', // Yellow
    ];

    const expenseColors = [
      '#ef4444', // Red
      '#f97316', // Orange
      '#eab308', // Yellow
      '#84cc16', // Lime
      '#06b6d4', // Cyan
      '#3b82f6', // Blue
      '#6366f1', // Indigo
      '#ec4899', // Pink
      '#8b5a2b', // Brown
      '#6b7280', // Gray
      '#059669', // Emerald
      '#92400e', // Amber-800
    ];

    const incomeData = Object.entries(incomeCategories).map(([categoryName, amount], index) => ({
      x: categoryName,
      y: amount,
      color: incomeColors[index % incomeColors.length],
    }));

    const expenseData = Object.entries(expenseCategories).map(([categoryName, amount], index) => ({
      x: categoryName,
      y: amount,
      color: expenseColors[index % expenseColors.length],
    }));

    return { income: incomeData, expense: expenseData };
  };

  const fetchTransactions = useCallback(
    async (month: string) => {
      const access_token = await SecureStore.getItemAsync('access_token');
      setLoading(true);
      setError(null);

      try {
        const monthNumber = getMonthNumber(month);
        const response = await fetch(`${BASE_URL}/api/transactions?month=2025-${monthNumber}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        // Transform API data to display format
        const transformedTransactions = data.data.map(transformTransactionToReportItem);

        // Process data for pie charts
        const categoryData = processCategoryData(data.data);

        // Update states
        setTransactions(transformedTransactions);
        setSummaryData(data.summaryData);
        setIncomePieData(categoryData.income);
        setExpensePieData(categoryData.expense);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        setTransactions([]);
        setSummaryData({ income: 0, expense: 0, netIncome: 0 });
        setIncomePieData([]);
        setExpensePieData([]);
      } finally {
        setLoading(false);
      }
    },
    [BASE_URL]
  );

  useEffect(() => {
    fetchTransactions(selectedMonth);
  }, [selectedMonth, fetchTransactions]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleTransactionPress = (transactionId: string) => {
    navigation.navigate('Update', { _id: transactionId });
  };

  // Pie Chart Components
  const renderPieChart = (data: PieChartData[], title: string, totalAmount: number) => {
    if (data.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{title}</Text>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No data available</Text>
          </View>
        </View>
      );
    }

    const { width: screenWidth } = Dimensions.get('window');
    const chartSize = screenWidth * 0.4;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.totalAmount}>Rp. {totalAmount.toLocaleString('id-ID')}</Text>

        <VictoryPie
          data={data}
          width={chartSize}
          height={chartSize}
          colorScale={data.map((item) => item.color || '#ccc')}
          innerRadius={chartSize * 0.1}
          labelComponent={<VictoryLabel style={{ fontSize: 10, fill: 'white' }} />}
          labelRadius={({ innerRadius }) => (innerRadius as number) + chartSize * 0.1}
        />

        {/* Legend */}
        <View style={styles.legend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.x}: Rp. {item.y.toLocaleString('id-ID')}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderMonthItem = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => handleMonthChange(item)}>
      <View style={[styles.monthItem, selectedMonth === item && styles.monthItemSelected]}>
        <Text style={[styles.monthText, selectedMonth === item && styles.monthTextSelected]}>
          {item}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b667c" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchTransactions(selectedMonth)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (transactions.length === 0) {
      return <Text style={styles.emptyText}>No transactions for this month.</Text>;
    }

    return (
      <View style={styles.transactionsList}>
        {transactions.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleTransactionPress(item.id)}
            activeOpacity={0.7}
            style={styles.touchableItem}>
            <View style={styles.listItem}>
              <View style={styles.transactionRow}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.title}>{item.category}</Text>
                  <Text style={styles.category}>{item.title}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
                <Text
                  style={[styles.amount, item.type === 'income' ? styles.income : styles.expense]}>
                  {item.type === 'income' ? 'Rp. ' : 'Rp. -'}
                  {item.amount.toLocaleString('id-ID')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.monthSliderContainer}>
          <FlatList
            data={months}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.monthSlider}
            renderItem={renderMonthItem}
          />
        </View>

        {/* Pie Charts Section */}
        {!loading && !error && (
          <View style={styles.chartsSection}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            <View style={styles.chartsRow}>
              {renderPieChart(incomePieData, 'Income', summaryData.income)}
              {renderPieChart(expensePieData, 'Expense', summaryData.expense)}
            </View>

            {/* Net Income Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Monthly Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Income:</Text>
                <Text style={[styles.summaryValue, styles.income]}>
                  Rp. {summaryData.income.toLocaleString('id-ID')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Expense:</Text>
                <Text style={[styles.summaryValue, styles.expense]}>
                  Rp. {summaryData.expense.toLocaleString('id-ID')}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.netIncomeRow]}>
                <Text style={styles.summaryLabel}>Net Income:</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    summaryData.netIncome >= 0 ? styles.income : styles.expense,
                  ]}>
                  Rp. {summaryData.netIncome.toLocaleString('id-ID')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Transactions List Section */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          {renderContent()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#3b667c',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
    marginTop: 8,
  },
  monthSliderContainer: {
    height: 36,
    marginBottom: 16,
  },
  monthSlider: {
    paddingVertical: 0,
    alignItems: 'center',
  },
  monthItem: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 3,
    height: 32,
    justifyContent: 'center',
  },
  monthItemSelected: {
    backgroundColor: '#334155',
  },
  monthText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  monthTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b667c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    marginTop: 32,
  },
  transactionsList: {
    paddingBottom: 16,
  },
  touchableItem: {
    borderRadius: 8,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  income: {
    color: '#22c55e',
  },
  expense: {
    color: '#ef4444',
  },
  category: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },

  // Pie chart and summary styles
  chartsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  noDataContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  legend: {
    marginTop: 12,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    color: '#64748b',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  netIncomeRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionsSection: {
    flex: 1,
  },
});
