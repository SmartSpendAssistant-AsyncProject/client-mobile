import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackNavigationProp, RootStackParamList } from 'types/navigation';
import { DebtLoanDetailItem } from 'types/DebtLoan';
import DebtLoanService from 'utils/DebtLoanService';
import { format } from 'date-fns';

type LoanDetailScreenRouteProp = RouteProp<RootStackParamList, 'LoanDetail'>;

export default function LoanDetailScreen() {
  const [loanDetail, setLoanDetail] = useState<DebtLoanDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<LoanDetailScreenRouteProp>();
  const { loanId } = route.params;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchLoanDetail();
  }, [loanId]);

  const fetchLoanDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await DebtLoanService.getTransactionDetail(loanId);
      setLoanDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loan details');
      console.error('Error fetching loan detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b667c" />
          <Text style={styles.loadingText}>Loading loan details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !loanDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error || 'Loan not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scrollView}>
          {/* Main Loan Information */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Loan Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{loanDetail.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{loanDetail.description}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Original Amount:</Text>
              <Text style={styles.value}>Rp. {loanDetail.ammount.toLocaleString('id-ID')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Remaining Amount:</Text>
              <Text style={[styles.value, styles.remainingAmount]}>
                Rp. {loanDetail.remaining_ammount.toLocaleString('id-ID')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{format(new Date(loanDetail.date), 'MM/dd/yyyy')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Category:</Text>
              <Text style={styles.value}>{loanDetail.category.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Wallet:</Text>
              <Text style={styles.value}>{loanDetail.wallet.name}</Text>
            </View>
          </View>

          {/* Collection History */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Collection History</Text>
            {loanDetail.children.length === 0 ? (
              <Text style={styles.noCollectionsText}>No collections made yet</Text>
            ) : (
              loanDetail.children.map((collection, index) => (
                <View key={collection._id} style={styles.collectionItem}>
                  <View style={styles.collectionHeader}>
                    <Text style={styles.collectionTitle}>{collection.description}</Text>
                    <Text style={styles.collectionAmount}>
                      Rp. {collection.ammount.toLocaleString('id-ID')}
                    </Text>
                  </View>
                  <Text style={styles.collectionDate}>
                    {format(new Date(collection.date), 'MMM dd, yyyy HH:mm')}
                  </Text>
                </View>
              ))
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Fixed Action Button */}
        {loanDetail.remaining_ammount > 0 && (
          <View
            style={{
              backgroundColor: 'white',
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: insets.bottom + 20,
              borderTopWidth: 1,
              borderColor: '#E5E7EB',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}>
            <Pressable
              style={styles.collectButton}
              onPress={() => navigation.navigate('DebtCollection', { loanItem: loanDetail })}>
              <Text style={styles.collectButtonText}>Collect Payment</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    color: '#28a745',
    fontWeight: 'bold',
  },
  noCollectionsText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  collectionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  collectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  collectionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  collectionDate: {
    fontSize: 12,
    color: '#666',
  },
  collectButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  collectButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
