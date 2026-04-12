import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Account } from '../models/account.model';
import { Transaction } from '../models/transaction.model';
import { TransactionQuery } from '../models/transaction-query.model';
import { User, AuthSession } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private readonly baseUrl = environment.apiUrl;
  private readonly requestTimeoutMs = 8000;

  constructor(private readonly http: HttpClient) {}

  authenticate(username: string, password: string): Observable<AuthSession | null> {
    const params = new HttpParams().set('username', username.trim());

    return this.http
      .get<User[]>(`${this.baseUrl}/users`, { params })
      .pipe(
        timeout(this.requestTimeoutMs),
        map((users) => {
          const user = users.find(
            (u) => u.username === username.trim() && u.password === password,
          );

          if (!user) {
            return null;
          }

          return {
            token: `Bearer ${user.id}`,
            username: user.username,
            fullName: user.fullName,
          } satisfies AuthSession;
        }),
      );
  }

  getAccounts(): Observable<Account[]> {
    return this.http
      .get<Account[]>(`${this.baseUrl}/accounts`)
      .pipe(timeout(this.requestTimeoutMs));
  }

  getTransactions(query: TransactionQuery): Observable<Transaction[]> {
    const params = this.buildTransactionParams(query);

    return this.http
      .get<Transaction[]>(`${this.baseUrl}/transactions`, { params })
      .pipe(timeout(this.requestTimeoutMs));
  }

  private buildTransactionParams(query: TransactionQuery): HttpParams {
    let params = new HttpParams()
      .set('accountId', query.accountId)
      .set('_page', String(query.page))
      .set('_limit', String(query.limit))
      .set('_sort', query.sortField)
      .set('_order', query.sortOrder);

    if (query.type) {
      params = params.set('type', query.type);
    }

    if (query.minAmount != null) {
      params = params.set('amount_gte', String(query.minAmount));
    }

    if (query.maxAmount != null) {
      params = params.set('amount_lte', String(query.maxAmount));
    }

    if (query.startDate) {
      params = params.set('date_gte', query.startDate);
    }

    if (query.endDate) {
      params = params.set('date_lte', query.endDate);
    }

    return params;
  }
}
