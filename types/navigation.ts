import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DebtLoanItem } from './DebtLoan';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  Wallets: undefined;
  CreateWallet: undefined;
  Debt: undefined;
  Repayment: { debtItem: DebtLoanItem };
  Loan: undefined;
  DebtCollection: { loanItem: DebtLoanItem };
  Report: undefined;
  Create: undefined;
  Update: { _id: string };
  Chat: undefined;
  Profile: undefined;
  Home: undefined;

  CreateCategory: undefined;
  UpgradePlan: { uri: string };
  Notification: undefined;
  NotificationDetail: {
    id: string;
    title: string;
    description: string;
  };
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
