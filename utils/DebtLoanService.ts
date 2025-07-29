import * as SecureStore from 'expo-secure-store';
import { DebtLoanItem } from 'types/DebtLoan';

const BASE_URL = 'https://ssa-server-omega.vercel.app';

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

export interface RepaymentData {
  description: string;
  ammount: number;
  wallet_id: string;
  parent_id: string;
}

export interface CollectionData {
  description: string;
  ammount: number;
  wallet_id: string;
  parent_id: string;
}

class DebtLoanService {
  private static async getAuthToken(): Promise<string> {
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) {
      throw new Error('No access token found');
    }
    return token;
  }

  private static async makeRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const token = await this.getAuthToken();

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getDebts(): Promise<DebtLoanItem[]> {
    return this.makeRequest<DebtLoanItem[]>('/api/debts');
  }

  static async getLoans(): Promise<DebtLoanItem[]> {
    return this.makeRequest<DebtLoanItem[]>('/api/loans');
  }

  static async getWallets(): Promise<Wallet[]> {
    return this.makeRequest<Wallet[]>('/api/wallets');
  }

  static async createRepayment(data: RepaymentData): Promise<any> {
    return this.makeRequest('/api/debts/repayments', 'POST', data);
  }

  static async createCollection(data: CollectionData): Promise<any> {
    return this.makeRequest('/api/loans/collects', 'POST', data);
  }
}

export default DebtLoanService;
