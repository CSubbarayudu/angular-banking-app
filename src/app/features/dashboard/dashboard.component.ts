import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AccountsService } from '../accounts/services/accounts.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, LoaderComponent, ErrorMessageComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  fullName = '';
  loggedInUser = '';
  accounts: any[] = [];
  allTransactions: any[] = [];
  recentTransactions: any[] = [];

  totalBalance = 0;
  totalCredit = 0;
  totalDebit = 0;

  isLoading = true;
  errorMsg = '';

  constructor(
    private accountsService: AccountsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fullName = localStorage.getItem('fullName') || 'User';
      this.loggedInUser = localStorage.getItem('loggedInUser') || '';
    }
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.accountsService.getAccounts().subscribe({
      next: (res: any[]) => {
        // Filter only this user's accounts
        this.accounts = res.filter(
          (a: any) => a.username === this.loggedInUser
        );

        // Calculate total balance
        this.totalBalance = this.accounts.reduce(
          (sum: number, a: any) => sum + (a.balance || 0), 0
        );

        // Fetch transactions for all accounts
        this.loadAllTransactions();
      },
      error: () => {
        this.isLoading = false;
        this.errorMsg = 'Unable to load data. Check json-server on port 3005.';
        this.cdr.detectChanges();
      }
    });
  }

  loadAllTransactions(): void {
    if (this.accounts.length === 0) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    let loaded = 0;
    this.allTransactions = [];

    this.accounts.forEach((account: any) => {
      this.accountsService
        .getTransactions(account.id, 1, 100, {}, 'date', 'desc')
        .subscribe({
          next: (txns: any[]) => {
            const txnsWithAccount = (Array.isArray(txns) ? txns : [])
              .map((t: any) => ({
                ...t,
                accountNumber: account.accountNumber,
                accountType: account.accountType
              }));
            this.allTransactions.push(...txnsWithAccount);
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
    // Total Credit and Debit from transactions
    this.totalCredit = this.allTransactions
      .filter((t: any) => t.type === 'Credit')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    this.totalDebit = this.allTransactions
      .filter((t: any) => t.type === 'Debit')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    // Recent 5 transactions sorted by date desc
    this.recentTransactions = [...this.allTransactions]
      .sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  goToAccounts(): void {
    this.router.navigate(['/accounts']);
  }

  goToAccountDetails(accountId: string): void {
    this.router.navigate(['/accounts', accountId]);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  }
}