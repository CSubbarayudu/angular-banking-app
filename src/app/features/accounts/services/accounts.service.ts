import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/accounts`);
  }

  getTransactions(
    accountId: string,
    page: number,
    limit: number,
    filters: any,
    sortField: string,
    sortOrder: string
  ): Observable<any> {
    let params = new HttpParams().set('accountId', accountId);

    // Safe Pagination 
    if (page) params = params.set('_page', page);
    if (limit) {
      params = params.set('_limit', limit);
      params = params.set('_per_page', limit);
    }
    if (sortField) params = params.set('_sort', sortField);
    if (sortOrder) params = params.set('_order', sortOrder);

    // Safe Filtering (Prevents sending 'null' and breaking the database)
    if (filters && filters.type && filters.type !== '') {
      params = params.set('type', filters.type);
    }
    if (filters && filters.minAmount !== null) {
      params = params.set('amount_gte', filters.minAmount);
    }
    if (filters && filters.maxAmount !== null) {
      params = params.set('amount_lte', filters.maxAmount);
    }

    return this.http.get<any>(`${this.baseUrl}/transactions`, { params });
  }
}