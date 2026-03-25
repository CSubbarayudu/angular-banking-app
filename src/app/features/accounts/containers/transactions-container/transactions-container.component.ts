import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AccountsService } from '../../services/accounts.service';
import { Transaction } from '../../models/transaction.model';
import { TableComponent } from '../../../../shared/components/table/table.component';

@Component({
  selector: 'app-transactions-container',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent],
  template: `
   <h2>Transaction History</h2>

<!-- FILTER -->
<div style="margin-bottom: 10px;">
  <label>Type:</label>
  <select [(ngModel)]="filterType" (change)="loadTransactions()">
    <option value="">All</option>
    <option value="Credit">Credit</option>
    <option value="Debit">Debit</option>
  </select>
</div>

<!-- LOADING -->
<div *ngIf="loading">Loading...</div>

<!-- ERROR -->
<div *ngIf="error">{{ error }}</div>

<!-- TABLE -->
<app-table
  *ngIf="transactions.length"
  [headers]="headers"
  [columns]="columns"
  [data]="transactions">
</app-table>

<!-- EMPTY -->
<p *ngIf="!loading && !transactions.length">No transactions found</p>

<!-- PAGINATION -->
<div style="margin-top: 10px;">
  <button (click)="prevPage()">Prev</button>
  <span>Page {{ page }}</span>
  <button (click)="nextPage()">Next</button>
</div>
  `
})
export class TransactionsContainerComponent implements OnInit {

  headers = ['Date', 'Amount', 'Type', 'Status'];
  columns = ['date', 'amount', 'type', 'status'];

  transactions: Transaction[] = [];
  loading: boolean = false;
  error: string = '';

  page: number = 1;
  filterType: string = '';

  constructor(private service: AccountsService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;

   this.service.getTransactions('1').subscribe({
      next: (res) => {
        this.transactions = res.data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  nextPage(): void {
    this.page++;
    this.loadTransactions();
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadTransactions();
    }
  }
}