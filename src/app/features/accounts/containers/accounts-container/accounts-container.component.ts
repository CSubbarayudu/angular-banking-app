import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';
import { Account } from '../../models/account.model';
import { AccountCardComponent } from '../../components/account-card/account-card.component';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-accounts-container',
  standalone: true,
  imports: [AccountCardComponent, LoaderComponent, ErrorMessageComponent, CurrencyPipe],
  templateUrl: './accounts-container.component.html',
  styleUrls: ['./accounts-container.component.css']
})
export class AccountsContainerComponent implements OnInit {
  accounts: Account[] = [];
  isLoading = true;
  errorMsg = '';
  loggedInUser = '';
  totalBalance = 0;

  constructor(
    private readonly accountsService: AccountsService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loggedInUser = localStorage.getItem('loggedInUser') || '';
    }
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.accountsService.getAccounts().subscribe({
      next: (res: Account[]) => {
        this.accounts = (Array.isArray(res) ? res : []).filter((a) => a.username === this.loggedInUser);
        this.totalBalance = this.accounts.reduce((sum, account) => sum + account.balance, 0);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.errorMsg = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToDetails(id: string): void {
    this.router.navigate(['/accounts', id]);
  }

  goToTransactions(id: string): void {
    this.router.navigate(['/accounts', id, 'transactions']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
