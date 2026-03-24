export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  type: 'Credit' | 'Debit';
  description: string;
  status: 'Completed' | 'Pending' | 'Failed';
}