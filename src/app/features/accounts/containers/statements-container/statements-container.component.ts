import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from '../../services/accounts.service';

@Component({
  selector: 'app-statements-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statements-container.component.html',
  styleUrls: ['./statements-container.component.css']
})
export class StatementsContainerComponent implements OnInit {

  accountId = '';
  account: any = null;
  transactions: any[] = [];

  accountLoading = false;
  transactionsLoading = false;
  accountError = '';
  transactionsError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountsService: AccountsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') || '';
    this.loadAccount();
    this.loadTransactions();
  }

  loadAccount(): void {
    this.accountLoading = true;
    this.accountError = '';

    this.accountsService.getAccounts().subscribe({
      next: (accounts: any[]) => {
        this.account = accounts.find(a => String(a.id) === String(this.accountId)) || accounts[0] || null;
        if (!this.account) {
          this.accountError = 'Account not found';
        }
        this.accountLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load account', err);
        this.accountError = 'Unable to load account details';
        this.accountLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTransactions(): void {
    this.transactionsLoading = true;
    this.transactionsError = '';

    this.accountsService.getTransactions(this.accountId, 1, 100, {}, 'date', 'desc').subscribe({
      next: (transactions: any[]) => {
        this.transactions = transactions || [];
        this.transactionsLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load transactions', err);
        this.transactionsError = 'Unable to load transactions';
        this.transactions = [];
        this.transactionsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  isCredit(transaction: any): boolean {
    return String(transaction.type).toLowerCase() === 'credit';
  }

  isDebit(transaction: any): boolean {
    return String(transaction.type).toLowerCase() === 'debit';
  }

  downloadCsv(): void {
    if (!this.transactions?.length) {
      return;
    }

    const header = ['Date', 'Description', 'Amount', 'Type', 'Status'];
    const rows = this.transactions.map(tx => [
      tx.date || '',
      tx.description || '',
      tx.amount != null ? tx.amount : '',
      tx.type || '',
      tx.status || ''
    ]);

    const csvContent = [header, ...rows]
      .map(row =>
        row
          .map(cell => '"' + String(cell).replace(/"/g, '""') + '"')
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `account_${this.accountId}_full_statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  goBack(): void {
    this.router.navigate(['/accounts', this.accountId]);
  }
}
