import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from 'types/navigation';

export default function WalletsScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Wallets Screen</Text>
      <Button title="Go to Create Wallet" onPress={() => navigation.navigate('CreateWallet')} />
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
}
