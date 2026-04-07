import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; // ✅ ADDED

import { AccountsService } from '../../services/accounts.service';
import { Transaction } from '../../models/transaction.model';
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
  accountId = ''; // ✅ ADDED — no longer hardcoded

  constructor(
    private service: AccountsService,
    private route: ActivatedRoute  // ✅ ADDED
  ) { }

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') || '1'; // ✅ reads from URL
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;

    const currentFilters = {
      type: this.filterType,
      startDate: this.startDate,
      endDate: this.endDate,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount
    };

    this.service.getTransactions(
      this.accountId,  // ✅ dynamic — not hardcoded '1' anymore
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