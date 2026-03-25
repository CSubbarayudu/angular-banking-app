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
    <h3>Transactions</h3>

    <div style="background: #f4f6f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-end;">
      
      <div>
        <label style="display:block; font-size: 12px; margin-bottom: 4px;">Type:</label>
        <select [(ngModel)]="filterType" style="padding: 6px;">
          <option value="">All</option>
          <option value="Credit">Credit</option>
          <option value="Debit">Debit</option>
        </select>
      </div>

      <div>
        <label style="display:block; font-size: 12px; margin-bottom: 4px;">From Date:</label>
        <input type="date" [(ngModel)]="startDate" style="padding: 5px;">
      </div>

      <div>
        <label style="display:block; font-size: 12px; margin-bottom: 4px;">To Date:</label>
        <input type="date" [(ngModel)]="endDate" style="padding: 5px;">
      </div>

      <div>
        <label style="display:block; font-size: 12px; margin-bottom: 4px;">Min Amount (₹):</label>
        <input type="number" [(ngModel)]="minAmount" placeholder="0" style="padding: 5px; width: 100px;">
      </div>

      <div>
        <label style="display:block; font-size: 12px; margin-bottom: 4px;">Max Amount (₹):</label>
        <input type="number" [(ngModel)]="maxAmount" placeholder="50000" style="padding: 5px; width: 100px;">
      </div>

      <div style="display:flex; gap: 10px;">
        <button (click)="applyFilters()" style="background: #0056b3; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Apply</button>
        <button (click)="clearFilters()" style="background: #ccc; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Clear</button>
      </div>
    </div>

    <div style="margin-bottom: 10px;">
      <button (click)="sort('amount')" style="margin-right: 5px; padding: 5px 10px; cursor: pointer;">↕ Sort by Amount</button>
      <button (click)="sort('date')" style="padding: 5px 10px; cursor: pointer;">↕ Sort by Date</button>
    </div>

    <div *ngIf="loading" style="padding: 20px; color: #555;">Loading transactions...</div>
    <div *ngIf="error" style="padding: 20px; color: red;">{{ error }}</div>

    <app-table
      *ngIf="!loading && transactions.length"
      [headers]="headers"
      [columns]="columns"
      [data]="transactions">
    </app-table>

    <p *ngIf="!loading && !transactions.length" style="padding: 20px; text-align: center; color: #666;">
      No transactions found matching your filters.
    </p>

    <div *ngIf="transactions.length || page > 1" style="margin-top:20px; display: flex; align-items: center; gap: 15px;">
      <button (click)="prevPage()" [disabled]="page === 1" style="padding: 8px 15px; cursor: pointer;">Prev</button>
      <span style="font-weight: bold;">Page: {{ page }}</span>
      <button (click)="nextPage()" style="padding: 8px 15px; cursor: pointer;">Next</button>
    </div>
  `
})
export class TransactionsContainerComponent implements OnInit {

  transactions: Transaction[] = [];
  loading = false;
  error = '';

  headers = ['Date', 'Amount', 'Type', 'Status'];
  columns = ['date', 'amount', 'type', 'status'];

  // Pagination & Sorting State
  page = 1;
  limit = 5; 
  sortField = 'date';
  sortOrder = 'desc';

  // Advanced Filter State
  filterType = '';
  startDate = '';
  endDate = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;

  constructor(private service: AccountsService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    
    // Bundle all filters into one object to pass to the service
    const currentFilters = {
      type: this.filterType,
      startDate: this.startDate,
      endDate: this.endDate,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount
    };

    this.service.getTransactions(
      '1', // We are hardcoding Account ID 1 for this specific screen
      this.page,
      this.limit,
      currentFilters,
      this.sortField,
      this.sortOrder
    ).subscribe({
      next: (res) => {
        this.transactions = res;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.page = 1; // Always reset to page 1 when applying new filters
    this.loadTransactions();
  }

  clearFilters() {
    this.filterType = '';
    this.startDate = '';
    this.endDate = '';
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
}