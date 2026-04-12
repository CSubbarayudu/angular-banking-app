export interface TransactionFilters {
  type?: 'Credit' | 'Debit' | '';
  minAmount?: number | null;
  maxAmount?: number | null;
  startDate?: string;
  endDate?: string;
}

export interface TransactionQuery extends TransactionFilters {
  accountId: string;
  page: number;
  limit: number;
  sortField: 'date' | 'amount' | 'type' | 'status';
  sortOrder: 'asc' | 'desc';
}
