import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountsService } from '../../services/accounts.service';
import { Account } from '../../models/account.model';
import { TableComponent } from '../../../../shared/components/table/table.component';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent],
  template: `
    <div style="padding: 20px;">
      <h2>Account Details</h2>

      <!-- Account Info -->
      <div *ngIf="account"
           style="border: 1px solid #ccc; padding: 15px; border-radius: 6px; margin-bottom: 20px; background: #f9f9f9;">
        <p><b>Account No:</b> {{ account.accountNumber }}</p>
        <p><b>Type:</b> {{ account.accountType }}</p>
        <p><b>Balance:</b> ₹{{ account.balance }}</p>
        <p><b>Status:</b> {{ account.status }}</p>
      </div>

      <h3>Transactions</h3>

      <!-- Filters -->
      <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-end;">
        
        <div>
          <label style="display:block; font-size: 12px;">Type:</label>
          <select [(ngModel)]="filterType" style="padding: 5px;">
            <option value="">All</option>
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
          </select>
        </div>

        <div>
          <label style="display:block; font-size: 12px;">Min Amount:</label>
          <input type="number" [(ngModel)]="minAmount" style="padding: 5px; width: 100px;">
        </div>

        <div>
          <label style="display:block; font-size: 12px;">Max Amount:</label>
          <input type="number" [(ngModel)]="maxAmount" style="padding: 5px; width: 100px;">
        </div>

        <div style="display:flex; gap: 10px;">
          <button (click)="applyFilters()" style="background: #007bff; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">
            Apply
          </button>

          <button (click)="clearFilters()" style="background: #6c757d; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">
            Clear
          </button>
        </div>
      </div>

      <!-- Sorting -->
      <div style="margin-bottom: 10px;">
        <button (click)="sort('amount')" style="margin-right: 10px; padding: 5px 10px;">
          ↕ Sort by Amount
        </button>

        <button (click)="sort('date')" style="padding: 5px 10px;">
          ↕ Sort by Date
        </button>
      </div>

      <!-- Loader -->
      <div *ngIf="loading">Loading transactions...</div>

      <!-- Table -->
      <app-table
        *ngIf="!loading && transactions.length > 0"
        [headers]="['Date', 'Amount', 'Type', 'Status']"
        [columns]="['date', 'amount', 'type', 'status']"
        [data]="transactions">
      </app-table>

      <!-- Empty -->
      <p *ngIf="!loading && transactions.length === 0" style="color: #666;">
        No transactions found.
      </p>

      <!-- Pagination -->
      <div *ngIf="transactions.length > 0 || page > 1"
           style="margin-top:20px; display: flex; align-items: center; gap: 15px;">
        
        <button (click)="prevPage()" [disabled]="page === 1">
          Prev
        </button>

        <span><b>Page: {{ page }}</b></span>

        <button (click)="nextPage()">
          Next
        </button>
      </div>

      <!-- Download -->
      <button (click)="downloadStatement()"
              style="margin-top: 20px; background: #28a745; color: white; padding: 10px 15px; border: none; border-radius: 4px;">
        Download Statement
      </button>
    </div>
  `
})
export class AccountDetailsComponent implements OnInit {

  accountId!: string;
  account: Account | null = null;
  transactions: any[] = [];
  loading = false;

  // Filters & State
  page = 1;
  limit = 5;
  sortField = 'date';
  sortOrder = 'desc';
  filterType = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private service: AccountsService
  ) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') || '1';
    this.loadAccount();
    this.loadTransactions();
  }

  // ✅ FIXED: NO .data
  loadAccount(): void {
    this.service.getAccounts().subscribe(res => {
      console.log('Accounts:', res);

      this.account =
        res.find((acc: any) => acc.id === this.accountId) || res[0];
    });
  }

  // ✅ FIXED: NO .data
  loadTransactions(): void {
    this.loading = true;

    const filters = {
      type: this.filterType,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount
    };

    this.service.getTransactions(
      this.accountId,
      this.page,
      this.limit,
      filters,
      this.sortField,
      this.sortOrder
    ).subscribe({
      next: (res) => {
        console.log('Transactions:', res);

        this.transactions = res; // 🔥 DIRECT ARRAY
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.page = 1;
    this.loadTransactions();
  }

  clearFilters() {
    this.filterType = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.page = 1;
    this.loadTransactions();
  }

  sort(field: string) {
    this.sortField = field;
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadTransactions();
  }

  nextPage() {
    this.page++;
    this.loadTransactions();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadTransactions();
    }
  }

  downloadStatement() {
    if (!this.transactions.length) return;

    const data = JSON.stringify(this.transactions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `statement_account_${this.accountId}.json`;
    a.click();

    window.URL.revokeObjectURL(url);
  }
}