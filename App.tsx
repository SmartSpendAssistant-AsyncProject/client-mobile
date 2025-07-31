import './global.css';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'MainTabs' : 'Login'}
        screenOptions={{
          headerShown: false, // Hide headers by default
          headerStyle: {
            backgroundColor: '#3b667c',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '500',
          },
          headerTitleAlign: 'center',
        }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="Wallets"
          component={WalletsScreen}
          options={{ headerShown: true, title: 'My Wallets' }}
        />
        <Stack.Screen
          name="CreateWallet"
          component={CreateWalletScreen}
          options={{ headerShown: true, title: 'Create Wallet' }}
        />
        <Stack.Screen
          name="Debt"
          component={DebtScreen}
          options={{ headerShown: true, title: 'Debt Management' }}
        />
        <Stack.Screen
          name="DebtDetail"
          component={DebtDetailScreen}
          options={{ headerShown: true, title: 'Debt Details' }}
        />
        <Stack.Screen
          name="Repayment"
          component={RepaymentScreen}
          options={{ headerShown: true, title: 'Repayment' }}
        />
        <Stack.Screen
          name="Loan"
          component={LoanScreen}
          options={{ headerShown: true, title: 'Loan Management' }}
        />
        <Stack.Screen
          name="LoanDetail"
          component={LoanDetailScreen}
          options={{ headerShown: true, title: 'Loan Details' }}
        />
        <Stack.Screen
          name="DebtCollection"
          component={DebtcollectionScreen}
          options={{ headerShown: true, title: 'Debt Collection' }}
        />
        <Stack.Screen
          name="CreateCategory"
          component={CreateCategoryScreen}
          options={{ headerShown: true, title: 'Create Category' }}
        />
        <Stack.Screen
          name="UpgradePlan"
          component={UpgradePlanScreen}
          options={{ headerShown: true, title: 'Upgrade Plan' }}
        />
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
          options={{ headerShown: true, title: 'Notifications' }}
        />
        <Stack.Screen
          name="NotificationDetail"
          component={NotificationDetailScreen}
          options={{ headerShown: true, title: 'Notification Detail' }}
        />
        <Stack.Screen
          name="Update"
          component={UpdateScreen}
          options={{ headerShown: true, title: 'Edit Transaction' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
