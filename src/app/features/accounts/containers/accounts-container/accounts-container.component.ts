import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';

@Component({
  selector: 'app-accounts-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h2>Accounts Overview</h2>

      <!-- Loading -->
      <div *ngIf="loading" style="padding: 10px; color: blue;">
        Loading data from server...
      </div>

      <!-- Error -->
      <div *ngIf="error" style="padding: 10px; color: red;">
        {{ error }}
      </div>

      <!-- Table -->
      <table *ngIf="!loading && accounts.length > 0"
             border="1"
             width="100%"
             style="border-collapse: collapse; margin-top: 20px; text-align: left;">
        
        <thead style="background-color: #f4f6f8;">
          <tr>
            <th style="padding: 10px;">Account No</th>
            <th style="padding: 10px;">Type</th>
            <th style="padding: 10px;">Balance</th>
            <th style="padding: 10px;">Status</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let acc of accounts"
              (click)="goToDetails(acc.id)"
              style="cursor: pointer; border-bottom: 1px solid #ddd;">
            
            <td style="padding: 10px;">{{ acc.accountNumber }}</td>
            <td style="padding: 10px;">{{ acc.accountType }}</td>
            <td style="padding: 10px;">₹{{ acc.balance }}</td>
            <td style="padding: 10px;">{{ acc.status }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div *ngIf="!loading && accounts.length === 0" style="margin-top: 20px;">
        No accounts found.
      </div>

      <!-- Debug Section -->
      <div style="margin-top: 40px; padding: 15px; background: #e9ecef; border-radius: 5px;">
        <h4>System Debugger</h4>
        <p><strong>Total Accounts Found:</strong> {{ accounts.length }}</p>
        <pre style="font-size: 12px; max-height: 200px; overflow-y: auto;">
{{ accounts | json }}
        </pre>
      </div>
    </div>
  `
})
export class AccountsContainerComponent implements OnInit {

  accounts: any[] = [];
  loading = false;
  error = '';

  constructor(
    private accountsService: AccountsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  // 🔥 FINAL FIXED METHOD
  loadAccounts(): void {
    this.loading = true;

    console.log('🔥 Calling API...');

    this.accountsService.getAccounts().subscribe({
      next: (res) => {
        console.log('✅ Accounts API:', res);

        // 🔥 CRITICAL FIX: force new reference
        this.accounts = [...res];

        console.log('📊 After assignment:', this.accounts);

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ API ERROR:', err);
        this.error = 'Failed to connect to JSON Server (port 3005)';
        this.loading = false;
      }
    });
  }

  goToDetails(id: string) {
    this.router.navigate(['/accounts', id]);
  }
}