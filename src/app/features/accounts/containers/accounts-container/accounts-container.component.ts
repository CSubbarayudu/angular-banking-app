import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';

@Component({
  selector: 'app-accounts-container',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
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
        <table border="1" style="width:100%; border-collapse:collapse; margin-top:10px;">
          <thead style="background:#f0f0f0;">
            <tr>
              <th style="padding:10px; text-align:left;">Account No</th>
              <th style="padding:10px; text-align:left;">Type</th>
              <th style="padding:10px; text-align:left;">Balance</th>
              <th style="padding:10px; text-align:left;">Status</th>
              <th style="padding:10px; text-align:left;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let acc of accounts">
              <td style="padding:10px;">{{ acc.accountNumber }}</td>
              <td style="padding:10px;">{{ acc.accountType }}</td>
              <td style="padding:10px;">₹{{ acc.balance }}</td>
              <td style="padding:10px;">{{ acc.status }}</td>
              <td style="padding:10px;">
                <button
                  (click)="goToDetails(acc.id)"
                  style="background:#007bff; color:white; border:none; padding:6px 14px; border-radius:4px; cursor:pointer;">
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </ng-container>

      <ng-container *ngIf="!loading && accounts.length === 0 && !error">
        <p>No accounts found.</p>
      </ng-container>
    </div>
  `
})
export class AccountsContainerComponent implements OnInit {

  accounts: any[] = [];
  loading = true;
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
        this.cdr.markForCheck();
        this.cdr.detectChanges();
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