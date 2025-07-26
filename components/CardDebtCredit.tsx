import React from 'react';
import { View, Text, Pressable } from 'react-native';
// import { format } from 'date-fns';

/*
  name: string;
  description: string;
  amount: number;
  date: string;
  remaining_amount: number;
  onPress: () => void; => untuk button navigasi yang reusable/customize
  buttonLabel?: string; => untuk label button yang bisa reusable/customize
  */

type CardDebtCreditProps = {
  title: string;
  description: string;
  amount: number;
  total: number;
  onPress: () => void;
  buttonLabel?: string;
  // dueDate: string;
};

//! sementara style masih inline, nanti bisa di refactor ke StyleSheet
export default function CardDebtCredit({
  title,
  description,
  amount,
  total,
  onPress,
  buttonLabel,
  // dueDate,
}: CardDebtCreditProps) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: 'white',
        padding: 16,
        elevation: 2,
      }}>
      {/* Card Header */}
      <Text style={{ fontSize: 18, fontWeight: '600' }}>{title}</Text>

      {/* Card Description */}
      <Text style={{ fontSize: 14, color: 'gray' }}>{description}</Text>

      {/* Amount and Total */}
      <View
        style={{
          marginTop: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'red' }}>
          Rp. {amount.toLocaleString('id-ID')}
        </Text>
        <Text style={{ fontSize: 12, color: 'gray' }}>of Rp. {total.toLocaleString('id-ID')}</Text>
      </View>

      {/* Due Date */}
      {/* <View className="mt-2 flex-row items-center">
        <Text className="ml-2 text-xs text-gray-500">
          Due: {format(new Date(dueDate), 'MM/dd/yyyy')}
        </Text>
      </View> */}

      {/* Action Button */}
      <Pressable
        onPress={onPress} // yang akan digunakan untuk navigasi berbeda pada load/debt screens
        style={{ marginTop: 12, borderRadius: 8, backgroundColor: '#3b667c', paddingVertical: 8 }}>
        <Text style={{ textAlign: 'center', fontWeight: '600', color: 'white' }}>
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}
