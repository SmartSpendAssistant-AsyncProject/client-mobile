import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

import DebtScreen from './screens/DebtScreen';
import LoanScreen from './screens/LoanScreen';
import RepaymentScreen from './screens/RepaymentScreen';
import DebtcollectionScreen from './screens/DebtcollectionScreen';
import WalletsScreen from './screens/WalletsScreen';
import CreateWalletScreen from './screens/CreateWalletScreen';
import MainTabs from 'navigators/MainTabs';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Wallets" component={WalletsScreen} />
        <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
        <Stack.Screen name="Debt" component={DebtScreen} />
        <Stack.Screen name="Repayment" component={RepaymentScreen} />
        <Stack.Screen name="Loan" component={LoanScreen} />
        <Stack.Screen name="DebtCollection" component={DebtcollectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
