import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from 'types/navigation';

export default function DebtScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Debt Screen</Text>
      <Button title="Go to Repayment" onPress={() => navigation.navigate('Repayment')} />
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
}
