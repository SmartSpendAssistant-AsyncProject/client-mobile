import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
    date: new Date(transaction.date).toISOString().split('T')[0], // Format: YYYY-MM-DD
    amount: transaction.ammount,
    type: type,
  };
};

export default function ReportScreen() {
  const [selectedMonth, setSelectedMonth] = useState('Jul'); // Default to current month
  const [transactions, setTransactions] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.BASE_URL || 'https://ssa-server-omega.vercel.app';
  const access_token =
    'eyJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI2ODgyNDhmYjc2NTM3ZGQ0ZjZjYzllMDkifQ.Wg9sGQZ4Go_rLGXtwiJPUshoee5wW1GjELrzwiLU850';

  const fetchTransactions = async (month: string) => {
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

      setTransactions(transformedTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(selectedMonth);
  }, [selectedMonth]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const renderTransactionItem = ({ item }: { item: ReportItem }) => (
    <View style={styles.listItem}>
      <View style={styles.transactionRow}>
        <View style={styles.transactionInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <Text style={[styles.amount, item.type === 'income' ? styles.income : styles.expense]}>
          {item.type === 'income' ? 'Rp. ' : 'Rp. -'}
          {item.amount.toLocaleString('id-ID')}
        </Text>
      </View>
    </View>
  );

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
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.transactionsList}
        renderItem={renderTransactionItem}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <View style={styles.content}>
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

        {renderContent()}
      </View>
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
});
