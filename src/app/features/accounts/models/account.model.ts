export type AccountType = 'Savings' | 'Current' | 'Fixed Deposit';
export type AccountStatus = 'Active' | 'Inactive' | 'Blocked';

export interface Account {
  id: string;
  username: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  ifscCode: string;
  branch: string;
}
