export interface Account {
  id: string;
  accountNumber: string;
  accountType: 'Savings' | 'Current' | 'Credit';
  balance: number;
  currency: string;
  status: 'Active' | 'Inactive' | 'Blocked';
}