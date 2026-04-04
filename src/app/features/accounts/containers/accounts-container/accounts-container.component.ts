import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';
import { AccountCardComponent } from '../../components/account-card/account-card.component';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';


@Component({
  selector: 'app-accounts-container',
  standalone: true,
  imports: [AccountCardComponent, LoaderComponent, ErrorMessageComponent],
  templateUrl: './accounts-container.component.html',
  styleUrls: ['./accounts-container.component.css']
})
export class AccountsContainerComponent implements OnInit {

  accounts: any[] = [];
  isLoading = true;
  errorMsg = '';
  loggedInUser = '';
  router: Router;

  constructor(
    private accountsService: AccountsService,
    router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.router = router;
  }

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
      next: (res: any[]) => {
        this.accounts = (Array.isArray(res) ? res : []).filter(
          (a: any) => a.username === this.loggedInUser
        );
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Unable to load accounts. Check json-server on port 3005.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToDetails(id: string): void {
    this.router.navigate(['/accounts', id]);
  }

  getAccountIcon(type: string): string {
    const icons: Record<string, string> = {
      'Savings': '🏦',
      'Current': '💼',
      'Fixed Deposit': '🔒'
    };
    return icons[type] || '💳';
  }

  getMaskedNumber(accountNumber: string): string {
    return '••••' + accountNumber.slice(-4);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Active': 'badge-active',
      'Inactive': 'badge-inactive',
      'Blocked': 'badge-blocked'
    };
    return map[status] || 'badge-active';
  }
}
