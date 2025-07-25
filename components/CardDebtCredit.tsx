import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from 'types/navigation';
// import { format } from 'date-fns';

type CardDebtCreditProps = {
  title: string;
  description: string;
  amount: number;
  total: number;
  // dueDate: string;
};

export default function CardDebtCredit({
  title,
  description,
  amount,
  total,
  // dueDate,
}: CardDebtCreditProps) {
  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <View className="mx-4 mb-4 rounded-xl bg-white p-4 shadow">

      {/* Card Header */}
      <Text className="text-lg font-semibold">{title}</Text>

      {/* Card Description */}
      <Text className="text-sm text-gray-500">{description}</Text>

      {/* Amount and Total */}
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-base font-bold text-red-600">
          Rp. {amount.toLocaleString('id-ID')}
        </Text>
        <Text className="text-sm text-gray-500">of Rp. {total.toLocaleString('id-ID')}</Text>
      </View>

      {/* Due Date */}
      {/* <View className="mt-2 flex-row items-center">
        <Text className="ml-2 text-xs text-gray-500">
          Due: {format(new Date(dueDate), 'MM/dd/yyyy')}
        </Text>
      </View> */}

      {/* Action Button */}
      <Pressable
        onPress={() => navigation.navigate('Repayment')}
        className="mt-3 rounded-md bg-sky-800 py-2">
        <Text className="text-center font-semibold text-white">Make Payment</Text>
      </Pressable>
    </View>
  );
}
