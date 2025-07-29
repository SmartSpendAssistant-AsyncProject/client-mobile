import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackNavigationProp, RootStackParamList } from 'types/navigation';
import { DebtLoanDetailItem } from 'types/DebtLoan';
import DebtLoanService from 'utils/DebtLoanService';
import { format } from 'date-fns';

type DebtDetailScreenRouteProp = RouteProp<RootStackParamList, 'DebtDetail'>;

export default function DebtDetailScreen() {
  const [debtDetail, setDebtDetail] = useState<DebtLoanDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<DebtDetailScreenRouteProp>();
  const { debtId } = route.params;

  useEffect(() => {
    fetchDebtDetail();
  }, [debtId]);

  const fetchDebtDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await DebtLoanService.getTransactionDetail(debtId);
      setDebtDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch debt details');
      console.error('Error fetching debt detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b667c" />
          <Text style={styles.loadingText}>Loading debt details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !debtDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error: {error || 'Debt not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Main Debt Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Debt Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{debtDetail.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{debtDetail.description}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Original Amount:</Text>
            <Text style={styles.value}>Rp. {debtDetail.ammount.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Remaining Amount:</Text>
            <Text style={[styles.value, styles.remainingAmount]}>
              Rp. {debtDetail.remaining_ammount.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{format(new Date(debtDetail.date), 'MM/dd/yyyy')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.value}>{debtDetail.category.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Wallet:</Text>
            <Text style={styles.value}>{debtDetail.wallet.name}</Text>
          </View>
        </View>

        {/* Payment History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment History</Text>
          {debtDetail.children.length === 0 ? (
            <Text style={styles.noPaymentsText}>No payments made yet</Text>
          ) : (
            debtDetail.children.map((payment, index) => (
              <View key={payment._id} style={styles.paymentItem}>
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentTitle}>{payment.description}</Text>
                  <Text style={styles.paymentAmount}>
                    Rp. {payment.ammount.toLocaleString('id-ID')}
                  </Text>
                </View>
                <Text style={styles.paymentDate}>
                  {format(new Date(payment.date), 'MMM dd, yyyy HH:mm')}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Action Button */}
        {debtDetail.remaining_ammount > 0 && (
          <TouchableOpacity
            style={styles.repayButton}
            onPress={() => navigation.navigate('Repayment', { debtItem: debtDetail })}>
            <Text style={styles.repayButtonText}>Make Payment</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'gray',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  remainingAmount: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  noPaymentsText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  paymentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
  },
  repayButton: {
    backgroundColor: '#3b667c',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  repayButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
