import React from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from 'types/navigation';
import CardDebtCredit from 'components/CardDebtCredit';

export default function LoanScreen() {
  //! Sample data untuk debt guys
  const loanData = [
    {
      title: 'KPR - BTN',
      description: 'House mortgage loan',
      amount: 30000000,
      total: 50000000,
      dueDate: '2024-08-20',
      interest: 3.2,
      paidPercentage: 60,
      status: 'On Time' as const,
    },
    {
      title: 'Car Loan - BRI',
      description: 'Vehicle financing',
      amount: 12000000,
      total: 15000000,
      dueDate: '2024-09-10',
      interest: 2.1,
      paidPercentage: 80,
      status: 'Due Soon' as const,
    },
  ];

  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <View className="flex-1 bg-white pt-4">
      <Text className="bg-sky-800 py-4 text-center text-xl font-bold text-white">My Loans</Text>
      <Text className="px-4 py-2 text-base font-semibold">All Loans</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loanData.map((loan, index) => (
          <CardDebtCredit key={index} {...loan} />
        ))}
        <Button title="Back" onPress={() => navigation.goBack()} />
      </ScrollView>
    </View>
  );
}

