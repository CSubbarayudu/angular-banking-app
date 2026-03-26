import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccountsService {

  private baseUrl = 'http://localhost:3005';

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/accounts`);
  }

  getTransactions(
    accountId: string,
    page: number,
    limit: number,
    filters: any,
    sortField: string,
    sortOrder: string
  ): Observable<any[]> {

    let params = new HttpParams()
      .set('accountId', accountId)   // ← json-server v0 uses exact field name match
      .set('_page', page.toString())
      .set('_limit', limit.toString())
      .set('_sort', sortField)
      .set('_order', sortOrder);     // 'asc' or 'desc'

    if (filters?.type) {
      params = params.set('type', filters.type);
    }
    if (filters?.minAmount !== null && filters?.minAmount !== undefined) {
      params = params.set('amount_gte', filters.minAmount.toString());
    }
    if (filters?.maxAmount !== null && filters?.maxAmount !== undefined) {
      params = params.set('amount_lte', filters.maxAmount.toString());
    }

    // json-server v0 always returns a plain array — no wrapping needed
    return this.http.get<any[]>(`${this.baseUrl}/transactions`, { params });
  }
}