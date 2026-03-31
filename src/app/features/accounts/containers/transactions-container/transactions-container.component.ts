import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AccountsService } from '../../services/accounts.service';
import { Transaction } from '../../models/transaction.model';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-transactions-container',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, LoaderComponent, ErrorMessageComponent],
  templateUrl: './transactions-container.component.html'
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

  constructor(private service: AccountsService) { }

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