import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AccountsService } from '../../services/accounts.service';
import { Transaction } from '../../models/transaction.model';
import { TransactionQuery } from '../../models/transaction-query.model';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-transactions-container',
  standalone: true,
  imports: [FormsModule, TableComponent, LoaderComponent, ErrorMessageComponent],
  templateUrl: './transactions-container.component.html'
})
export class TransactionsContainerComponent implements OnInit {
  transactions: Transaction[] = [];
  loading = false;
  error = '';

  headers = ['Date', 'Amount', 'Type', 'Status'];
  columns: Array<keyof Transaction> = ['date', 'amount', 'type', 'status'];

  page = 1;
  limit = 5;
  sortField: TransactionQuery['sortField'] = 'date';
  sortOrder: TransactionQuery['sortOrder'] = 'desc';

  filterType: 'Credit' | 'Debit' | '' = '';
  startDate = '';
  endDate = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  accountId = '';

  constructor(
    private readonly service: AccountsService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') || '1';
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;

    const query: TransactionQuery = {
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
    };

    this.service.getTransactions(query).subscribe({
      next: (res) => {
        this.transactions = res;
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message;
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
    this.startDate = '';
    this.endDate = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.page = 1;
    this.loadTransactions();
  }

  sort(field: TransactionQuery['sortField']) {
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
