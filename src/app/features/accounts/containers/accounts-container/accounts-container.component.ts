import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-accounts-container',
  standalone: true,
  imports: [CommonModule, LoaderComponent, ErrorMessageComponent],
  templateUrl: './accounts-container.component.html'
})
export class AccountsContainerComponent implements OnInit {
  accounts: any[] = [];
  loading = true;
  error = '';

  constructor(
    private accountsService: AccountsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = '';

    this.accountsService.getAccounts().subscribe({
      next: (res: any) => {
        this.accounts = Array.isArray(res) ? res : (res?.data ?? []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('API ERROR:', err);
        this.error = 'Failed to load accounts from server.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToDetails(id: string): void {
    this.router.navigate(['/accounts', id]);
  }
}
