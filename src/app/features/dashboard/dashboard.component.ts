import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AccountsService } from '../accounts/services/accounts.service';
import { Account } from '../accounts/models/account.model';
import { Transaction } from '../accounts/models/transaction.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { TableComponent } from '../../shared/components/table/table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, LoaderComponent, ErrorMessageComponent, TableComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  fullName = '';
  loggedInUser = '';
  accounts: Account[] = [];
  allTransactions: Transaction[] = [];
  recentTransactions: Transaction[] = [];

  totalBalance = 0;
  totalCredit = 0;
  totalDebit = 0;

  tableHeaders = ['Date', 'Description', 'Amount', 'Type'];
  tableColumns: Array<keyof Transaction> = ['date', 'description', 'amount', 'type'];

  isLoading = true;
  errorMsg = '';

  constructor(
    private readonly accountsService: AccountsService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fullName = localStorage.getItem('fullName') || 'User';
      this.loggedInUser = localStorage.getItem('loggedInUser') || '';
    }
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.accountsService.getAccounts().subscribe({
      next: (res: Account[]) => {
        this.accounts = res.filter((a) => a.username === this.loggedInUser);
        this.totalBalance = this.accounts.reduce((sum, a) => sum + a.balance, 0);
        this.loadAllTransactions();
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMsg = err.message;
        this.cdr.detectChanges();
      }
    });
  }

  loadAllTransactions(): void {
    if (this.accounts.length === 0) {
      this.computeSummary();
      return;
    }

    this.allTransactions = [];
    let loaded = 0;

    this.accounts.forEach((account) => {
      this.accountsService.getTransactions({
        accountId: account.id,
        page: 1,
        limit: 100,
        sortField: 'date',
        sortOrder: 'desc'
      }).subscribe({
        next: (txns) => {
          this.allTransactions.push(...txns);
          loaded++;
          if (loaded === this.accounts.length) {
            this.computeSummary();
          }
        },
        error: () => {
          loaded++;
          if (loaded === this.accounts.length) {
            this.computeSummary();
          }
        }
      });
    });
  }

  computeSummary(): void {
    this.totalCredit = this.allTransactions
      .filter((t) => t.type === 'Credit')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalDebit = this.allTransactions
      .filter((t) => t.type === 'Debit')
      .reduce((sum, t) => sum + t.amount, 0);

    this.recentTransactions = [...this.allTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  goToAccounts(): void {
    this.router.navigate(['/accounts']);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}
