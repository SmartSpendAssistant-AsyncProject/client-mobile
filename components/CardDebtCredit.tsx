import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { format } from 'date-fns';

/*
  name: string;
  description: string;
  ammount: number;
  date: string;
  remaining_ammount: number;
  onPress: () => void; => untuk button navigasi yang reusable/customize
  buttonLabel?: string; => untuk label button yang bisa reusable/customize
  */

type CardDebtCreditProps = {
  name: string;
  description: string;
  ammount: number;
  date: string;
  remaining_ammount: number;
  onPress: () => void;
  onDetailPress?: () => void;
  buttonLabel?: string;
};

//! sementara style masih inline, nanti bisa di refactor ke StyleSheet
export default function CardDebtCredit({
  name,
  description,
  ammount,
  date,
  remaining_ammount,
  onPress,
  onDetailPress,
  buttonLabel,
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
      {/* Name */}
      <Text style={{ fontSize: 18, fontWeight: '600' }}>{name}</Text>

      {/* Card Description */}
      <Text style={{ fontSize: 14, color: 'gray' }}>{description}</Text>

      {/* Ammount and remaining_ammount */}
      <View
        style={{
          marginTop: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'red' }}>
          Rp. {remaining_ammount.toLocaleString('id-ID')}
        </Text>
        <Text style={{ fontSize: 12, color: 'gray' }}>
          of Rp. {ammount.toLocaleString('id-ID')}
        </Text>
      </View>

      {/* Date */}
      <View className="mt-2 flex-row items-center">
        <Text className="ml-2 text-xs text-gray-500">{format(new Date(date), 'MM/dd/yyyy')}</Text>
      </View>

      {/* Action Buttons */}
      <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
        {onDetailPress && (
          <Pressable
            onPress={onDetailPress}
            style={{ 
              flex: 1, 
              borderRadius: 8, 
              backgroundColor: '#6c757d', 
              paddingVertical: 8,
              marginRight: 4
            }}>
            <Text style={{ textAlign: 'center', fontWeight: '600', color: 'white' }}>
              View Details
            </Text>
          </Pressable>
        )}
        
        <Pressable
          onPress={onPress}
          style={{ 
            flex: 1, 
            borderRadius: 8, 
            backgroundColor: '#3b667c', 
            paddingVertical: 8,
            marginLeft: onDetailPress ? 4 : 0
          }}>
          <Text style={{ textAlign: 'center', fontWeight: '600', color: 'white' }}>
            {buttonLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
