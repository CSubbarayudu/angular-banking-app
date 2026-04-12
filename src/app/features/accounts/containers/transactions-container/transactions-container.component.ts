import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';
import { Transaction } from '../../models/transaction.model';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-transactions-container',
  standalone: true,
  imports: [CommonModule, TableComponent, LoaderComponent, ErrorMessageComponent],
  template: `
    <div style="padding: 20px;">
      <h2>Transaction History</h2>

      @if (loading) {
        <app-loader></app-loader>
      }

      @if (errorMsg && !loading) {
        <app-error-message [message]="errorMsg"></app-error-message>
      }

      @if (!loading && !errorMsg) {
        <app-table
          [headers]="headers"
          [columns]="columns"
          [data]="transactions">
        </app-table>

        @if (transactions.length === 0) {
          <p style="color: #666; margin-top: 16px;">No transactions found.</p>
        }

        <div style="margin-top: 16px; display: flex; gap: 12px; align-items: center;">
          <button
            (click)="prevPage()"
            [disabled]="page === 1"
            style="padding: 6px 14px; cursor: pointer;">
            ← Previous
          </button>
          <span>Page {{ page }}</span>
          <button
            (click)="nextPage()"
            [disabled]="transactions.length < limit"
            style="padding: 6px 14px; cursor: pointer;">
            Next →
          </button>
        </div>
      }
    </div>
  `
})
export class TransactionsContainerComponent implements OnInit {
  transactions: Transaction[] = [];
  headers = ['Date', 'Amount', 'Type', 'Status', 'Description'];
  columns: Array<keyof Transaction> = ['date', 'amount', 'type', 'status', 'description'];
  accountId = '';
  loading = false;
  errorMsg = '';
  page = 1;
  limit = 5;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly accountsService: AccountsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.errorMsg = '';

    this.accountsService
      .getTransactions({
        accountId: this.accountId,
        page: this.page,
        limit: this.limit,
        sortField: 'date',
        sortOrder: 'desc',
      })
      .subscribe({
        next: (data) => {
          this.transactions = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          this.errorMsg = err?.message ?? 'Failed to load transactions.';
          this.loading = false;
          this.cdr.detectChanges();
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
