import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

type ReportItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
};

type ReportsData = {
  [key: string]: ReportItem[];
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const reportsData: ReportsData = {
  Jan: [
    {
      id: '1',
      title: 'Movie tickets',
      category: 'Entertainment',
      date: '2024-01-15',
      amount: 150000,
      type: 'expense',
    },
    {
      id: '2',
      title: 'Salary',
      category: 'Income',
      date: '2024-01-01',
      amount: 5000000,
      type: 'income',
    },
    {
      id: '3',
      title: 'Grocery shopping',
      category: 'Food',
      date: '2024-01-10',
      amount: 300000,
      type: 'expense',
    },
  ],
  Feb: [],
  Mar: [],
  Apr: [],
  May: [],
  Jun: [],
  Jul: [],
  Aug: [],
  Sep: [],
  Oct: [],
  Nov: [],
  Dec: [],
};

export default function ReportScreen() {
  const [selectedMonth, setSelectedMonth] = useState('Jan');
  const reports = reportsData[selectedMonth] || [];

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
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedMonth(item)}>
                <View
                  style={[styles.monthItem, selectedMonth === item && styles.monthItemSelected]}>
                  <Text
                    style={[styles.monthText, selectedMonth === item && styles.monthTextSelected]}>
                    {item}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        {reports.length > 0 ? (
          <FlatList
            data={reports}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.transactionsList}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={styles.transactionRow}>
                  <View>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.category}>{item.category}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                  </View>
                  <Text
                    style={[
                      styles.amount,
                      item.type === 'income' ? styles.income : styles.expense,
                    ]}>
                    {item.type === 'income' ? 'Rp. ' : 'Rp. -'}
                    {item.amount.toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>No transactions for this month.</Text>
        )}
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
