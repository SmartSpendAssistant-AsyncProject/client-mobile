import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackNavigationProp } from 'types/navigation';
import CardDebtCredit from 'components/CardDebtCredit';

export default function LoanScreen() {
  //! Sample data untuk loan guys
  /*
  name: string;
  description: string;
  amount: number;
  date: string;
  remaining_amount: number;
  */
  const loanData = [
    {
      title: 'KPR - BTN',
      description: 'House mortgage loan',
      amount: 30000000,
      total: 50000000,
    },
    {
      title: 'Car Loan - BRI',
      description: 'Vehicle financing',
      amount: 12000000,
      total: 15000000,
    },
    {
      title: 'Car Loan - BRI',
      description: 'Vehicle financing',
      amount: 12000000,
      total: 15000000,
    },
    {
      title: 'Car Loan - BRI',
      description: 'Vehicle financing',
      amount: 12000000,
      total: 15000000,
    },
    {
      title: 'Car Loan - BRI',
      description: 'Vehicle financing',
      amount: 12000000,
      total: 15000000,
    },
    {
      title: 'Car Loan - BRI',
      description: 'Vehicle financing',
      amount: 12000000,
      total: 15000000,
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
          All Loans
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {loanData.map((loan, index) => (
            <CardDebtCredit
              key={index}
              {...loan}
              onPress={() => navigation.navigate('DebtCollection')}
              buttonLabel="Collect now"
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
