import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  Wallets: undefined;
  CreateWallet: undefined;
  Debt: undefined;
  Repayment: undefined;
  Loan: undefined;
  DebtCollection: undefined;
  Report: undefined;
  Create: undefined;
  Chat: undefined;
  Profile: undefined;
  Home: undefined;

  CreateCategory: undefined;
  UpgradePlan: { uri: string };
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
