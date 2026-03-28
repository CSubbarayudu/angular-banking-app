import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class AccountsService {

  private baseUrl = 'http://localhost:3005';

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts`);
  }

  getTransactions(
    accountId: string,
    page: number,
    limit: number,
    filters: any,
    sortField: string,
    sortOrder: string
  ): Observable<Transaction[]> {

    let params = new HttpParams()
      .set('accountId', accountId)
      .set('_page', page.toString())
      .set('_limit', limit.toString())
      .set('_sort', sortField)
      .set('_order', sortOrder);

    // Type filter
    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    // Amount range filters
    if (filters?.minAmount !== null && filters?.minAmount !== undefined) {
      params = params.set('amount_gte', filters.minAmount.toString());
    }
    if (filters?.maxAmount !== null && filters?.maxAmount !== undefined) {
      params = params.set('amount_lte', filters.maxAmount.toString());
    }

    // Date range filters (Task 2)
    if (filters?.startDate) {
      params = params.set('date_gte', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('date_lte', filters.endDate);
    }

    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions`, { params });
  }
}