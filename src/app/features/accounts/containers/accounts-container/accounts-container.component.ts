import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsService } from '../../services/accounts.service';
import { Account } from '../../models/account.model';

import { TableComponent } from '../../../../shared/components/table/table.component';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accounts-container',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    LoaderComponent,
    ErrorMessageComponent
  ],
  template: `
    <h2>Accounts Overview</h2>

<app-loader *ngIf="loading"></app-loader>
<app-error-message *ngIf="error" [message]="error"></app-error-message>

<table border="1" width="100%" *ngIf="accounts.length">
  <thead>
    <tr>
      <th>Account No</th>
      <th>Type</th>
      <th>Balance</th>
      <th>Status</th>
    </tr>
  </thead>

  <tbody>
<tr 
  *ngFor="let acc of accounts" 
  (click)="goToDetails(acc.id)"
  style="cursor:pointer;"
  onmouseover="this.style.background='#f5f5f5'"
  onmouseout="this.style.background='white'"
>
        <td>{{ acc.accountNumber }}</td>
      <td>{{ acc.accountType }}</td>
      <td>{{ acc.balance }}</td>
      <td>{{ acc.status }}</td>
    </tr>
  </tbody>
</table>
<p *ngIf="!loading && !accounts.length" style="padding: 20px; text-align: center;">
  No accounts available
</p>
  `
})
export class AccountsContainerComponent implements OnInit {

  accounts: Account[] = [];
  loading = false;
  error = '';

  headers = ['Account No', 'Type', 'Balance', 'Status'];

  constructor(private accountsService: AccountsService,
    private router:Router
  ) {}

  goToDetails(id: string){
    this.router.navigate(['/accounts', id]);
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading = true;

    this.accountsService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}