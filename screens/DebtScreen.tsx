import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackNavigationProp } from 'types/navigation';
import { DebtLoanItem } from 'types/DebtLoan';
import DebtLoanService from 'utils/DebtLoanService';
import CardDebtCredit from 'components/CardDebtCredit';

export default function DebtScreen() {
  const [debtData, setDebtData] = useState<DebtLoanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<RootStackNavigationProp>();

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await DebtLoanService.getDebts();
      setDebtData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch debts');
      console.error('Error fetching debts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b667c" />
        <Text style={{ marginTop: 16, fontSize: 16, color: 'gray' }}>Loading debts...</Text>
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
          All Debts
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {debtData.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 50 }}>
              <Text style={{ fontSize: 16, color: 'gray' }}>No debts found</Text>
            </View>
          ) : (
            debtData.map((debt) => (
              <CardDebtCredit
                key={debt._id}
                name={debt.name}
                description={debt.description}
                ammount={debt.ammount}
                date={debt.date}
                remaining_ammount={debt.remaining_ammount}
                onPress={() => navigation.navigate('Repayment', { debtItem: debt })}
                buttonLabel="Repay now"
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
