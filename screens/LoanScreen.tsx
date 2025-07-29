import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from 'types/navigation';
import CardDebtCredit from '../components/CardDebtCredit';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DebtLoanItem } from 'types/DebtLoan';
import DebtLoanService from 'utils/DebtLoanService';

export default function LoanScreen() {
  const [loanData, setLoanData] = useState<DebtLoanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<RootStackNavigationProp>();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await DebtLoanService.getLoans();
      setLoanData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loans');
      console.error('Error fetching loans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b667c" />
        <Text style={{ marginTop: 16, fontSize: 16, color: 'gray' }}>Loading loans...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: 'red', textAlign: 'center', paddingHorizontal: 20 }}>
          Error: {error}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            paddingHorizontal: 24,
            marginBottom: 4,
            fontSize: 24,
            fontWeight: '800',
          }}>
          All Loans
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {loanData.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 50 }}>
              <Text style={{ fontSize: 16, color: 'gray' }}>No loans found</Text>
            </View>
          ) : (
            loanData.map((loan) => (
              <CardDebtCredit
                key={loan._id}
                name={loan.name}
                description={loan.description}
                ammount={loan.ammount}
                date={loan.date}
                remaining_ammount={loan.remaining_ammount}
                onPress={() => navigation.navigate('DebtCollection', { loanItem: loan })}
                buttonLabel="Collect now"
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
