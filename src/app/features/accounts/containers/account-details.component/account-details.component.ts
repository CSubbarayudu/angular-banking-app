import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { AccountsService } from '../../services/accounts.service';
import { Account } from '../../models/account.model';
import { Transaction } from '../../models/transaction.model';
import { TableComponent } from '../../../../shared/components/table/table.component';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, TableComponent],
  template: `
    <h2>Account Details</h2>

    <!-- ACCOUNT INFO -->
    <div style="margin-bottom: 15px;">
      <p><b>Account No:</b> {{ account?.accountNumber }}</p>
      <p><b>Type:</b> {{ account?.accountType }}</p>
      <p><b>Balance:</b> {{ account?.balance }}</p>
      <p><b>Status:</b> {{ account?.status }}</p>
    </div>

    <h3>Transactions</h3>

    <!-- LOADING -->
    <div *ngIf="loading">Loading transactions...</div>

    <!-- ERROR -->
    <div *ngIf="error" style="color:red;">
      {{ error }}
    </div>

    <!-- TABLE -->
    <app-table
      *ngIf="transactions.length"
      [headers]="['Date', 'Amount', 'Type', 'Status']"
      [columns]="['date', 'amount', 'type', 'status']"
      [data]="transactions">
    </app-table>

    <!-- EMPTY STATE -->
    <p *ngIf="!loading && !transactions.length">
      No transactions available
    </p>

    <br>

    <!-- DOWNLOAD BUTTON -->
    <button (click)="downloadStatement()">
      Download Statement
    </button>
  `
})
export class AccountDetailsComponent implements OnInit {

  account!: Account;
  transactions: Transaction[] = [];

  loading = false;
  error = '';

  accountId!: string;

  constructor(
    private route: ActivatedRoute,
    private service: AccountsService
  ) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') || '';

    this.loadAccount();
    this.loadTransactions();
  }

  loadAccount(): void {
    this.service.getAccounts().subscribe(res => {
      this.account = res.find(a => a.id === this.accountId)!;
    });
  }

  loadTransactions(): void {
    this.loading = true;

    this.service.getTransactions(this.accountId).subscribe({
      next: (res) => {
        this.transactions = res.data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  downloadStatement(): void {
    alert('Statement downloaded (mock)');
  }
}