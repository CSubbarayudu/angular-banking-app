import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { Account } from '../models/account.model';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(private api: ApiService) {}

  // 🔹 Account Overview (Mock Data)
  getAccounts(): Observable<Account[]> {
    return of([
      {
        id: '1',
        accountNumber: '123456789',
        accountType: 'Savings',
        balance: 5000,
        currency: 'INR',
        status: 'Active'
      },
      {
        id: '2',
        accountNumber: '987654321',
        accountType: 'Current',
        balance: 12000,
        currency: 'INR',
        status: 'Active'
      }
    ]);
  }

  // 🔹 Transactions (Mock Data)
  getTransactions(accountId: string): Observable<{ data: Transaction[] }> {
    return of({
      data: [
        {
          id: '1',
          accountId,
          date: '2024-03-01',
          amount: 1000,
          type: 'Credit',
          description: 'Salary',
          status: 'Completed'
        },
        {
          id: '2',
          accountId,
          date: '2024-03-02',
          amount: 200,
          type: 'Debit',
          description: 'Groceries',
          status: 'Completed'
        }
      ]
    });
  }
}