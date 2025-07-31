import React, { useState, useEffect } from 'react';
import { View, Button, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Pressable, Text } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList, RootStackNavigationProp } from 'types/navigation';
import { DebtLoanItem } from 'types/DebtLoan';
import DebtLoanService, { Wallet } from 'utils/DebtLoanService';
import CardRepayCollect from '../components/CardRepayCollect';

type DebtCollectionScreenRouteProp = RouteProp<RootStackParamList, 'DebtCollection'>;

export default function DebtCollectionScreen() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [amount, setAmount] = useState(0);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const insets = useSafeAreaInsets();
  const route = useRoute<DebtCollectionScreenRouteProp>();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { loanItem } = route.params;

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setIsLoadingWallets(true);
      const data = await DebtLoanService.getWallets();
      setWallets(data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      Alert.alert('Error', 'Failed to fetch wallets');
    } finally {
      setIsLoadingWallets(false);
    }
  };

  const handleCollect = async () => {
    if (!selectedWalletId || amount <= 0) {
      Alert.alert('Error', 'Please fill out collection info');
      return;
    }

    if (amount > loanItem.remaining_ammount) {
      Alert.alert('Error', `Amount cannot exceed remaining loan amount (Rp. ${loanItem.remaining_ammount.toLocaleString('id-ID')})`);
      return;
    }

    try {
      setIsLoading(true);
      
      const collectionData = {
        description: `Collection for ${loanItem.name}`,
        ammount: amount,
        wallet_id: selectedWalletId,
        parent_id: loanItem._id,
      };

      await DebtLoanService.createCollection(collectionData);
      
      Alert.alert(
        'Success',
        `Collection of Rp ${amount.toLocaleString('id-ID')} has been processed successfully!`,
        [{ 
          text: 'OK', 
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
            });
          }
        }]
      );
    } catch (error) {
      console.error('Error creating collection:', error);
      Alert.alert('Error', 'Failed to process collection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingWallets) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b667c" />
        </View>
      </SafeAreaProvider>
    );
  }

  // Convert wallet data to format expected by CardRepayCollect
  const walletOptions = wallets.map(wallet => ({
    id: wallet._id,
    name: wallet.name,
    balance: wallet.balance,
  }));

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#F9FAFB' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1 }}>
          <CardRepayCollect
            amount={amount}
            wallets={walletOptions}
            selectedWalletId={selectedWalletId}
            onChangeAmount={setAmount}
            onSelectWallet={setSelectedWalletId}
            mode="collect"
            targetName={loanItem.name}
          />
        </View>

        <View
          style={{
            backgroundColor: 'white',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: insets.bottom + 20,
            borderTopWidth: 1,
            borderColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
          <Pressable
            style={{
              backgroundColor: isLoading ? '#9CA3AF' : '#10B981',
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={handleCollect}
            disabled={isLoading}>
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '700',
              }}>
              {isLoading ? "Processing Collection..." : "Confirm Collection"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}
