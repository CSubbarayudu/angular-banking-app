import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountsService } from '../../services/accounts.service';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-details.component.html'
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