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

      <div *ngIf="account" style="border: 1px solid #ccc; padding: 15px; border-radius: 6px; margin-bottom: 20px; background: #f9f9f9;">
        <p><b>Account No:</b> {{ account.accountNumber }}</p>
        <p><b>Type:</b> {{ account.accountType }}</p>
        <p><b>Balance:</b> ₹{{ account.balance }}</p>
        <p><b>Status:</b> {{ account.status }}</p>
      </div>

      <h3>Transactions</h3>

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
          <button (click)="applyFilters()" style="background: #007bff; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">Apply</button>
          <button (click)="clearFilters()" style="background: #6c757d; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">Clear</button>
        </div>
      </div>

      <div style="margin-bottom: 10px;">
        <button (click)="sort('amount')" style="margin-right: 10px; padding: 5px 10px; cursor: pointer;">↕ Sort by Amount</button>
        <button (click)="sort('date')" style="padding: 5px 10px; cursor: pointer;">↕ Sort by Date</button>
      </div>

      <div *ngIf="loading">Loading transactions...</div>

      <app-table
        *ngIf="!loading && transactions.length > 0"
        [headers]="['Date', 'Amount', 'Type', 'Status']"
        [columns]="['date', 'amount', 'type', 'status']"
        [data]="transactions">
      </app-table>

      <p *ngIf="!loading && transactions.length === 0" style="color: #666;">
        No transactions found matching your filters.
      </p>

      <div *ngIf="transactions.length > 0 || page > 1" style="margin-top:20px; display: flex; align-items: center; gap: 15px;">
        <button (click)="prevPage()" [disabled]="page === 1" style="padding: 6px 12px; cursor: pointer;">Prev</button>
        <span style="font-weight: bold;">Page: {{ page }}</span>
        <button (click)="nextPage()" style="padding: 6px 12px; cursor: pointer;">Next</button>
      </div>

      <button (click)="downloadStatement()" style="margin-top: 20px; background: #28a745; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">
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

  // Filter States
  page = 1;
  limit = 5;
  sortField = 'date';
  sortOrder = 'desc';
  filterType = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;

  constructor(private route: ActivatedRoute, private service: AccountsService) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') || '1';
    this.loadAccount();
    this.loadTransactions();
  }

  loadAccount(): void {
    this.service.getAccounts().subscribe(res => {
      // Safely extract data
      const accountsArray = (res as any).data ? (res as any).data : res;
      this.account = accountsArray.find((acc: any) => acc.id === this.accountId) || accountsArray[0];
    });
  }

  loadTransactions(): void {
    this.loading = true;
    const filters = {
      type: this.filterType,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount
    };

    this.service.getTransactions(this.accountId, this.page, this.limit, filters, this.sortField, this.sortOrder)
      .subscribe({
        next: (res: any) => {
          // THIS IS THE FIX. Extracts the data from the json-server envelope.
          this.transactions = res.data ? res.data : res;
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
    if (!this.transactions || this.transactions.length === 0) return;
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