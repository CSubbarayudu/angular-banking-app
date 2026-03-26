import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';
// 1. IMPORT YOUR SHARED TABLE
import { TableComponent } from '../../../../shared/components/table/table.component';
@Component({
  selector: 'app-accounts-container',
  standalone: true,
  // 2. ADD TABLECOMPONENT TO IMPORTS
  imports: [CommonModule, TableComponent], 
  template: `
    <div style="padding: 20px;">
      <h2>Accounts Overview</h2>

      <div *ngIf="loading" style="padding: 10px; color: blue;">
        Loading data from server...
      </div>

      <div *ngIf="error" style="padding: 10px; color: red;">
        {{ error }}
      </div>

      <div *ngIf="!loading && accounts.length > 0" style="margin-top: 20px;">
        <app-table 
          [headers]="['Account No', 'Type', 'Balance', 'Status']"
          [columns]="['accountNumber', 'accountType', 'balance', 'status']"
          [data]="accounts">
        </app-table>
      </div>

      <div *ngIf="!loading && accounts.length === 0 && !error" style="margin-top: 20px;">
        No accounts found.
      </div>

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

  loadAccounts(): void {
    this.loading = true;
    console.log('🔥 Calling API...');

    this.accountsService.getAccounts().subscribe({
      next: (res: any) => {
        console.log('✅ RAW Accounts API Response:', res);

        // 4. BULLETPROOF DATA ASSIGNMENT
        // This handles both pure Arrays AND objects with a 'data' property
        if (Array.isArray(res)) {
          this.accounts = res;
        } else if (res && Array.isArray(res.data)) {
          this.accounts = res.data;
        } else {
          console.error('🚨 Unexpected Data Format!', res);
          this.accounts = []; 
        }

        console.log('📊 Final Assigned Accounts:', this.accounts);
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