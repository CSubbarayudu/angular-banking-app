import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { Account } from '../models/account.model';
import { Transaction } from '../models/transaction.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(private api: ApiService) {}

  // 🔹 Account Overview
  getAccounts(): Observable<Account[]> {
    return this.api
      .get<ApiResponse<Account[]>>('/accounts')
      .pipe(map(res => res.data));
  }

  // 🔹 Transactions with filters
  getTransactions(
    accountId: string,
    page: number = 1,
    limit: number = 10,
    filters?: any
  ): Observable<ApiResponse<Transaction[]>> {

    let params = new HttpParams()
      .set('accountId', accountId)
      .set('_page', page)
      .set('_limit', limit);

    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    if (filters?.startDate) {
      params = params.set('date_gte', filters.startDate);
    }

    if (filters?.endDate) {
      params = params.set('date_lte', filters.endDate);
    }

    return this.api.get<ApiResponse<Transaction[]>>(
      '/transactions',
      params
    );
  }
}