import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';
import { TableComponent } from '../../../../shared/components/table/table.component';

@Component({
  selector: 'app-accounts-container',
  standalone: true,
  imports: [CommonModule, TableComponent],
  changeDetection: ChangeDetectionStrategy.Default,  // ← keep Default, NOT OnPush
  template: `
    <div style="padding: 20px;">
      <h2>Accounts Overview</h2>

      <ng-container *ngIf="loading">
        <p style="color: blue;">Loading accounts...</p>
      </ng-container>

      <ng-container *ngIf="error">
        <p style="color: red;">{{ error }}</p>
      </ng-container>

      <ng-container *ngIf="!loading && accounts.length > 0">
        <app-table
          [headers]="['Account No', 'Type', 'Balance', 'Status']"
          [columns]="['accountNumber', 'accountType', 'balance', 'status']"
          [data]="accounts">
        </app-table>
      </ng-container>

      <ng-container *ngIf="!loading && accounts.length === 0 && !error">
        <p>No accounts found.</p>
      </ng-container>

      <!-- Remove this block before assessment submission -->
      <div style="margin-top: 30px; background:#e9ecef; padding:12px; border-radius:5px;">
        <strong>Debug: Total Accounts = {{ accounts.length }}</strong>
        <pre style="font-size:11px; max-height:200px; overflow-y:auto;">{{ accounts | json }}</pre>
      </div>
    </div>
  `
})
export class AccountsContainerComponent implements OnInit {

  accounts: any[] = [];
  loading = true;   // ← START as true, not false
  error = '';

  constructor(
    private accountsService: AccountsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

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
        this.cdr.markForCheck();   // ← tells Angular: "re-check this component now"
        this.cdr.detectChanges();  // ← forces immediate DOM update
      },
      error: (err: any) => {
        console.error('API ERROR:', err);
        this.error = 'Failed to load accounts from server.';
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  goToDetails(id: string): void {
    this.router.navigate(['/accounts', id]);
  }
}