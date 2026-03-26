import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountsService } from '../../services/accounts.service';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 1000px;">

      <button (click)="goBack()"
        style="margin-bottom:15px; padding:6px 16px; cursor:pointer;
               border:1px solid #ccc; border-radius:4px; background:#f8f9fa;">
        ← Back to Accounts
      </button>

      <h2>Account Details</h2>

      <p *ngIf="accountLoading" style="color:blue;">Loading account info...</p>

      <div *ngIf="account && !accountLoading"
           style="border:1px solid #ccc; padding:15px; border-radius:6px;
                  margin-bottom:20px; background:#f9f9f9;">
        <p><b>Account No:</b> {{ account.accountNumber }}</p>
        <p><b>Type:</b> {{ account.accountType }}</p>
        <p><b>Balance:</b> ₹{{ account.balance }}</p>
        <p><b>Status:</b>
          <span [style.color]="account.status === 'Active' ? 'green' : 'red'">
            {{ account.status }}
          </span>
        </p>
      </div>

      <h3>Transaction History</h3>

      <!-- Filters -->
      <div style="background:#e9ecef; padding:15px; border-radius:8px;
                  margin-bottom:20px; display:flex; flex-wrap:wrap; gap:15px; align-items:flex-end;">
        <div>
          <label style="display:block; font-size:12px; font-weight:bold;">Type:</label>
          <select [(ngModel)]="filterType" style="padding:6px; border-radius:4px; border:1px solid #ccc;">
            <option value="">All</option>
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:bold;">Min Amount (₹):</label>
          <input type="number" [(ngModel)]="minAmount"
            style="padding:6px; width:100px; border-radius:4px; border:1px solid #ccc;">
        </div>
        <div>
          <label style="display:block; font-size:12px; font-weight:bold;">Max Amount (₹):</label>
          <input type="number" [(ngModel)]="maxAmount"
            style="padding:6px; width:100px; border-radius:4px; border:1px solid #ccc;">
        </div>
        <div style="display:flex; gap:10px;">
          <button (click)="applyFilters()"
            style="background:#007bff; color:white; padding:6px 14px;
                   border:none; border-radius:4px; cursor:pointer;">
            Apply
          </button>
          <button (click)="clearFilters()"
            style="background:#6c757d; color:white; padding:6px 14px;
                   border:none; border-radius:4px; cursor:pointer;">
            Clear
          </button>
        </div>
      </div>

      <!-- Sort Buttons -->
      <div style="margin-bottom:15px; display:flex; gap:10px;">
        <button (click)="sort('amount')"
          style="padding:5px 12px; border:1px solid #aaa; border-radius:4px; cursor:pointer;">
          ↕ Amount
        </button>
        <button (click)="sort('date')"
          style="padding:5px 12px; border:1px solid #aaa; border-radius:4px; cursor:pointer;">
          ↕ Date
        </button>
        <small style="align-self:center; color:#888;">
          Sorted by <b>{{ sortField }}</b> ({{ sortOrder }})
        </small>
      </div>

      <!-- Loading -->
      <p *ngIf="loading" style="color:blue;">Loading transactions...</p>

      <!-- Transactions Table -->
      <ng-container *ngIf="!loading && transactions.length > 0">
        <table border="1" style="width:100%; border-collapse:collapse;">
          <thead style="background:#f0f0f0;">
            <tr>
              <th style="padding:10px; text-align:left;">Date</th>
              <th style="padding:10px; text-align:left;">Description</th>
              <th style="padding:10px; text-align:left;">Amount (₹)</th>
              <th style="padding:10px; text-align:left;">Type</th>
              <th style="padding:10px; text-align:left;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let txn of transactions">
              <td style="padding:10px;">{{ txn.date }}</td>
              <td style="padding:10px;">{{ txn.description || '-' }}</td>
              <td style="padding:10px;"
                  [style.color]="txn.type === 'Credit' ? 'green' : 'red'">
                {{ txn.type === 'Credit' ? '+' : '-' }}₹{{ txn.amount }}
              </td>
              <td style="padding:10px;">{{ txn.type }}</td>
              <td style="padding:10px;">{{ txn.status }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div style="margin-top:15px; display:flex; align-items:center; gap:15px;">
          <button (click)="prevPage()" [disabled]="page === 1"
            style="padding:6px 14px; border:1px solid #ccc; border-radius:4px; cursor:pointer;">
            ← Prev
          </button>
          <span>Page <b>{{ page }}</b></span>
          <button (click)="nextPage()" [disabled]="transactions.length < limit"
            style="padding:6px 14px; border:1px solid #ccc; border-radius:4px; cursor:pointer;">
            Next →
          </button>
        </div>
      </ng-container>

      <!-- Empty State -->
      <p *ngIf="!loading && transactions.length === 0" style="color:#888; margin-top:10px;">
        No transactions found for selected filters.
      </p>

      <!-- Download Statement -->
      <div style="margin-top:25px;">
        <button (click)="downloadStatement()"
          [disabled]="transactions.length === 0"
          style="background:#28a745; color:white; padding:10px 20px;
                 border:none; border-radius:5px; cursor:pointer; font-size:14px;">
          ⬇ Download Statement (CSV)
        </button>
      </div>

    </div>
  `
})
export class AccountDetailsComponent implements OnInit {

  accountId!: string;
  account: any = null;
  transactions: any[] = [];
  loading = false;
  accountLoading = false;

  filterType = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;

  page = 1;
  limit = 5;
  sortField = 'date';
  sortOrder = 'desc';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: AccountsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') || '1';
    this.loadAccount();
    this.loadTransactions();
  }

  loadAccount(): void {
    this.accountLoading = true;
    this.service.getAccounts().subscribe({
      next: (res: any[]) => {
        // String comparison — URL params are always strings
        this.account = res.find((a: any) => String(a.id) === String(this.accountId)) || res[0];
        this.accountLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.accountLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTransactions(): void {
    this.loading = true;
    this.cdr.detectChanges();

    const filters = {
      type: this.filterType,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount
    };

    this.service.getTransactions(
      this.accountId, this.page, this.limit,
      filters, this.sortField, this.sortOrder
    ).subscribe({
      next: (res: any) => {
        this.transactions = res;   // service already unwraps to plain array
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Transactions API error:', err);
        this.transactions = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void { this.page = 1; this.loadTransactions(); }

  clearFilters(): void {
    this.filterType = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.page = 1;
    this.loadTransactions();
  }

  sort(field: string): void {
    this.sortField = field;
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadTransactions();
  }

  nextPage(): void { this.page++; this.loadTransactions(); }

  prevPage(): void { if (this.page > 1) { this.page--; this.loadTransactions(); } }

  goBack(): void { this.router.navigate(['/accounts']); }

  downloadStatement(): void {
    if (!this.transactions.length) return;

    const headers = ['Date', 'Description', 'Amount', 'Type', 'Status'];
    const rows = this.transactions.map((t: any) =>
      [`"${t.date}"`, `"${t.description || ''}"`, t.amount, t.type, t.status].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `statement_account_${this.accountId}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}