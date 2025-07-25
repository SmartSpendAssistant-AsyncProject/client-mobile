import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from 'types/navigation';
import { format } from 'date-fns';

type CardDebtCreditProps = {
  title: string;
  description: string;
  amount: number;
  total: number;
  dueDate: string;
  interest: number;
  paidPercentage: number;
  status: 'Overdue' | 'Due Soon' | 'On Time';
};

export default function CardDebtCredit({
  title,
  description,
  amount,
  total,
  dueDate,
  interest,
  paidPercentage,
  status,
}: CardDebtCreditProps) {
  const navigation = useNavigation<RootStackNavigationProp>();

  const statusColor =
    status === 'Overdue'
      ? 'bg-red-100 text-red-600'
      : status === 'Due Soon'
        ? 'bg-yellow-100 text-yellow-600'
        : 'bg-green-100 text-green-600';

  return (
    <View className="mx-4 mb-4 rounded-xl bg-white p-4 shadow">
      <Text className="text-lg font-semibold">{title}</Text>
      <Text className="text-sm text-gray-500">{description}</Text>

      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-base font-bold text-red-600">
          Rp. {amount.toLocaleString('id-ID')}
        </Text>
        <Text className="text-sm text-gray-500">of Rp. {total.toLocaleString('id-ID')}</Text>
      </View>

      <View className="mt-2 flex-row items-center">
        <Text className={`rounded-full px-2 py-0.5 text-xs ${statusColor}`}>{status}</Text>
        <Text className="ml-2 text-xs text-gray-500">
          Due: {format(new Date(dueDate), 'MM/dd/yyyy')}
        </Text>
        <Text className="ml-auto text-xs font-medium text-orange-500">{interest}% interest</Text>
      </View>

      {/* Progress bar */}
      <View className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <View className="h-full bg-red-500" style={{ width: `${paidPercentage}%` }} />
      </View>
      <Text className="mt-1 text-xs text-gray-500">{paidPercentage}% paid</Text>

      <Pressable
        onPress={() => navigation.navigate('Repayment')}
        className="mt-3 rounded-md bg-sky-800 py-2">
        <Text className="text-center font-semibold text-white">Make Payment</Text>
      </Pressable>
    </View>
  );
}
