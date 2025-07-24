import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from 'types/navigation';

export default function HomeScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Home Screen</Text>
      <Button title="Go to Wallets" onPress={() => navigation.navigate('Wallets')} />
      <Button title="Go to Debt" onPress={() => navigation.navigate('Debt')} />
      <Button title="Go to Loan" onPress={() => navigation.navigate('Loan')} />
      <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}
