import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AccountsService } from '../../services/accounts.service';
import { Account } from '../../models/account.model';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-accounts-container',
  standalone: true,
  imports: [CommonModule, LoaderComponent, ErrorMessageComponent],
  template: `
    <div style="padding: 20px;">
      <h2>Accounts Overview</h2>

      <app-loader *ngIf="loading"></app-loader>
      <app-error-message *ngIf="error" [message]="error"></app-error-message>

      <table border="1" width="100%" *ngIf="!loading && accounts.length > 0" style="border-collapse: collapse; margin-top: 20px; text-align: left;">
        <thead style="background-color: #f4f6f8;">
          <tr>
            <th style="padding: 10px;">Account No</th>
            <th style="padding: 10px;">Type</th>
            <th style="padding: 10px;">Balance</th>
            <th style="padding: 10px;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let acc of accounts" (click)="goToDetails(acc.id)" style="cursor: pointer; border-bottom: 1px solid #ddd;">
            <td style="padding: 10px;">{{ acc.accountNumber }}</td>
            <td style="padding: 10px;">{{ acc.accountType }}</td>
            <td style="padding: 10px;">₹{{ acc.balance }}</td>
            <td style="padding: 10px;">{{ acc.status }}</td>
          </tr>
        </tbody>
      </table>

      <p *ngIf="!loading && accounts.length === 0" style="padding: 20px;">No accounts available</p>
    </div>
  `
})
export class AccountsContainerComponent implements OnInit {
  accounts: Account[] = [];
  loading = false;
  error = '';

  constructor(private accountsService: AccountsService, private router: Router) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading = true;
    this.accountsService.getAccounts().subscribe({
      next: (res: any) => {
        // Safely open the envelope to fix the infinite loading screen!
        this.accounts = res.data ? res.data : res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load accounts. Ensure json-server is running.';
        this.loading = false;
      }
    });
  }

  goToDetails(id: string) {
    this.router.navigate(['/accounts', id]);
  }
}