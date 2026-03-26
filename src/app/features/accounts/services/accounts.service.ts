import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

    // Build params compatible with BOTH json-server v0 and v1
    let params = new HttpParams()
      .set('accountId', accountId)
      .set('_page', page.toString())
      .set('_per_page', limit.toString())
      .set('_limit', limit.toString());    // v0 fallback

    // Sorting: json-server v1 uses '-field' for desc
    if (sortField) {
      const sortValue = sortOrder === 'desc' ? `-${sortField}` : sortField;
      params = params.set('_sort', sortValue);
    }

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

    // Handle BOTH json-server v0 (returns array) and v1 (returns {data:[...]})
    return this.http.get<any>(`${this.baseUrl}/transactions`, { params }).pipe(
      map((res: any) => {
        if (Array.isArray(res)) return res;           // v0 returns plain array
        if (res && Array.isArray(res.data)) return res.data;  // v1 wraps in {data:[]}
        return [];
      })
    );
  }
}