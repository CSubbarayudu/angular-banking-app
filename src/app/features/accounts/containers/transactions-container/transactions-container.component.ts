import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';
import { Transaction } from '../../models/transaction.model';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { HasUnsavedState } from '../../../../core/guards/unsaved-filters.guard';

@Component({
  selector: 'app-transactions-container',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, LoaderComponent, ErrorMessageComponent],
  templateUrl: './transactions-container.component.html',
  styleUrls: ['./transactions-container.css']
})
export class TransactionsContainerComponent implements OnInit, HasUnsavedState {
  transactions: Transaction[] = [];
  headers = ['Date', 'Amount', 'Type', 'Status', 'Description'];
  columns: Array<keyof Transaction> = ['date', 'amount', 'type', 'status', 'description'];
  accountId = '';
  loading = false;
  error = '';
  isDirty = false;

  headers = ['Date', 'Description', 'Amount', 'Type', 'Status'];
  columns: Array<keyof Transaction> = ['date', 'description', 'amount', 'type', 'status'];

  page = 1;
  limit = 5;
  sortField: 'date' | 'amount' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  filterType: 'Credit' | 'Debit' | '' = '';
  startDate = '';
  endDate = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  accountId = '';

  constructor(
    private readonly service: AccountsService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTransactions();
  }

  hasUnsavedChanges(): boolean {
    return this.isDirty;
  }

  markDirty(): void {
    this.isDirty = true;
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = '';

    this.service.getTransactions({
      accountId: this.accountId,
      page: this.page,
      limit: this.limit,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      type: this.filterType,
      startDate: this.startDate,
      endDate: this.endDate,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount,
    }).subscribe({
      next: (res) => {
        this.transactions = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.error = err.message;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.isDirty = false;
    this.page = 1;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterType = '';
    this.startDate = '';
    this.endDate = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.page = 1;
    this.isDirty = false;
    this.loadTransactions();
  }

  sort(field: 'date' | 'amount'): void {
    this.sortField = field;
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadTransactions();
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
