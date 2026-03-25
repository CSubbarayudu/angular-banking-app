import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  private baseUrl = 'http://localhost:3005';

  constructor(private http: HttpClient) {}

  // ✅ Always returns ARRAY
  getAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/accounts`);
  }

  // ✅ Always returns ARRAY (json-server style)
  getTransactions(
    accountId: string,
    page: number,
    limit: number,
    filters: any,
    sortField: string,
    sortOrder: string
  ): Observable<any[]> {

    let params = new HttpParams().set('accountId', accountId);

    if (page) params = params.set('_page', page);
    if (limit) params = params.set('_limit', limit);

    if (sortField) params = params.set('_sort', sortField);
    if (sortOrder) params = params.set('_order', sortOrder);

    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    if (filters?.minAmount !== null && filters?.minAmount !== undefined) {
      params = params.set('amount_gte', filters.minAmount);
    }

    if (filters?.maxAmount !== null && filters?.maxAmount !== undefined) {
      params = params.set('amount_lte', filters.maxAmount);
    }

    return this.http.get<any[]>(`${this.baseUrl}/transactions`, { params });
  }
}