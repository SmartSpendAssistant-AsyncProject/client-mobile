import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackNavigationProp } from 'types/navigation';
import CardDebtCredit from 'components/CardDebtCredit';

export default function DebtScreen() {
  //! Sample data untuk debt guys
  const debtData = [
    {
      title: 'Credit Card - BCA',
      description: 'Monthly credit card payment',
      amount: 4600000,
      total: 5000000,
      dueDate: '2024-02-15',
      interest: 2.5,
      paidPercentage: 96,
      status: 'Overdue' as const,
    },
    {
      title: 'Hutang ke teman - Amar',
      description: 'Amar suka meminjamkan uang',
      amount: 19000000,
      total: 20000000,
      dueDate: '2024-02-28',
      interest: 1.8,
      paidPercentage: 90,
      status: 'Due Soon' as const,
    },
    {
      title: 'Hutang yang terlupakan',
      description: 'Home renovation loan',
      amount: 1500000,
      total: 15000000,
      dueDate: '2024-02-28',
      interest: 1.8,
      paidPercentage: 10,
      status: 'Due Soon' as const,
    },
    {
      title: 'Hutang ke beli Playstation 7',
      description: 'Home renovation loan',
      amount: 1500000,
      total: 15000000,
      dueDate: '2024-02-28',
      interest: 1.8,
      paidPercentage: 10,
      status: 'Due Soon' as const,
    },
    {
      title: 'Hutang ke tukang sayur',
      description: 'Home renovation loan',
      amount: 1500000,
      total: 15000000,
      dueDate: '2024-02-28',
      interest: 1.8,
      paidPercentage: 10,
      status: 'Due Soon' as const,
    },
  ];

  const navigation = useNavigation<RootStackNavigationProp>();

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
          {debtData.map((debt, index) => (
            <CardDebtCredit
              key={index}
              {...debt}
              onPress={() => navigation.navigate('Repayment')}
              buttonLabel="Repay now"
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
