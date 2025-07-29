import './global.css';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuth } from './utils/AuthContext';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import UpdateScreen from './screens/UpdateScreen';

import DebtScreen from './screens/DebtScreen';
import DebtDetailScreen from './screens/DebtDetailScreen';
import LoanScreen from './screens/LoanScreen';
import LoanDetailScreen from './screens/LoanDetailScreen';
import RepaymentScreen from './screens/RepaymentScreen';
import DebtcollectionScreen from './screens/DebtcollectionScreen';
import WalletsScreen from './screens/WalletsScreen';
import CreateWalletScreen from './screens/CreateWalletScreen';
import MainTabs from 'navigators/MainTabs';
import CreateCategoryScreen from './screens/CreateCategoryScreen';
import NotificationScreen from './screens/NotificationScreen';
import NotificationDetailScreen from './screens/NotificationDetailScreen';
import UpgradePlanScreen from './screens/UpgradePlanScreen';

import { RootStackParamList } from './types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // You can return a loading screen here if needed
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? "MainTabs" : "Login"}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />

        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Wallets" component={WalletsScreen} />
        <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
        <Stack.Screen name="Debt" component={DebtScreen} />
        <Stack.Screen name="DebtDetail" component={DebtDetailScreen} />
        <Stack.Screen name="Repayment" component={RepaymentScreen} />
        <Stack.Screen name="Loan" component={LoanScreen} />
        <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
        <Stack.Screen name="DebtCollection" component={DebtcollectionScreen} />
        <Stack.Screen name="CreateCategory" component={CreateCategoryScreen} />
        <Stack.Screen name="UpgradePlan" component={UpgradePlanScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
        <Stack.Screen name="Update" component={UpdateScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
