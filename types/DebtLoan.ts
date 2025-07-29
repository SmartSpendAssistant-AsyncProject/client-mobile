// API Types for Debt and Loan data
export interface Category {
  _id: string;
  name: string;
  type: 'debt' | 'loan' | 'income' | 'expense';
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  _id: string;
  name: string;
  description: string;
  type: string;
  balance: number;
  target: number;
  threshold: number;
  user_id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface DebtLoanItem {
  _id: string;
  name: string;
  description: string;
  ammount: number;
  date: string;
  category_id: string;
  wallet_id: string;
  parent_id: string | null;
  remaining_ammount: number;
  message_id: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface DebtLoanDetailItem extends DebtLoanItem {
  wallet: Wallet;
  children: DebtLoanItem[];
}

// API Response types
export interface DebtLoanResponse {
  success: boolean;
  data: DebtLoanItem[];
}
