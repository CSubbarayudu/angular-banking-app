import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AccountsService } from '../../services/accounts.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { Account } from '../../models/account.model';
import { Transaction } from '../../models/transaction.model';
import { AccountCardComponent } from '../../components/account-card/account-card.component';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, LoaderComponent, ErrorMessageComponent, TableComponent, AccountCardComponent],
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css']
})
export class AccountDetailsComponent implements OnInit {
  accountId = '';
  account: Account | null = null;
  transactions: Transaction[] = [];

  loading = false;
  accountLoading = false;
  transactionsError = '';
  accountError = '';

  headers: Array<string> = ['Date', 'Description', 'Amount', 'Type', 'Status'];
  columns: Array<keyof Transaction> = ['date', 'description', 'amount', 'type', 'status'];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly service: AccountsService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') || '';
    this.loadAccount();
    this.loadTransactions();
  }

  hasUnsavedChanges(): boolean {
    return false;
  }

  loadAccount(): void {
    this.accountLoading = true;
    this.accountError = '';

    this.service.getAccounts().subscribe({
      next: (res) => {
        this.account = res.find((a) => a.id === this.accountId) || null;
        if (!this.account) {
          this.accountError = 'Account not found.';
        }
        this.accountLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.accountError = err.message;
        this.accountLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTransactions(): void {
    this.loading = true;
    this.transactionsError = '';

    this.service.getTransactions({
      accountId: this.accountId,
      page: 1,
      limit: 5,
      sortField: 'date',
      sortOrder: 'desc'
    }).subscribe({
      next: (res) => {
        this.transactions = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.transactionsError = err.message;
        this.transactions = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void { this.router.navigate(['/accounts']); }

  viewStatement(): void {
    this.router.navigate(['/accounts', this.accountId, 'statements']);
  }

  viewAllTransactions(): void {
    this.router.navigate(['/accounts', this.accountId, 'transactions']);
  }

  downloadFilteredPDF(): void {
    if (!this.account) {
      return;
    }

    this.service.getTransactions({
      accountId: this.accountId,
      page: 1,
      limit: 100,
      sortField: 'date',
      sortOrder: 'desc'
    }).subscribe({
      next: (allFiltered) => {
        if (!allFiltered.length) {
          this.transactionsError = 'No transactions found for this account.';
          this.cdr.detectChanges();
          return;
        }
        this.generatePDF(allFiltered);
      },
      error: (err: Error) => {
        this.transactionsError = err.message;
        this.cdr.detectChanges();
      }
    });
  }

  private generatePDF(data: Transaction[]): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 14;
    let currentY = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BANK STATEMENT', pageWidth / 2, currentY, { align: 'center' });

    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Last 100 Transactions', pageWidth / 2, currentY, { align: 'center' });

    currentY += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const accountNumber = this.account?.accountNumber || 'N/A';
    const accountType = this.account?.accountType || 'N/A';
    const balanceValue = this.account?.balance != null
      ? `Rs. ${Number(this.account.balance).toFixed(2)}` : 'N/A';

    const loggedInUser = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('loggedInUser') || 'N/A'
      : 'N/A';

    const generatedDate = this.formatDate(new Date());

    const details = [
      `Bank Name:      XYZ Bank`,
      `Account Holder: ${loggedInUser}`,
      `Account Number: ${accountNumber}`,
      `Account Type:   ${accountType}`,
      `Balance:        ${balanceValue}`,
      `Total Records:  ${data.length} transaction(s)`,
      `Generated Date: ${generatedDate}`
    ];

    details.forEach((line) => { currentY += 6; doc.text(line, marginLeft, currentY); });
    currentY += 10;

    const tableRows = data.map((tx) => [
      tx.date ? this.formatDate(tx.date) : 'N/A',
      tx.description || '',
      `Rs. ${Number(tx.amount || 0).toFixed(2)}`,
      tx.type || 'N/A',
      tx.status || 'N/A'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Description', 'Amount', 'Type', 'Status']],
      body: tableRows,
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: 'grid',
      margin: { left: marginLeft, right: marginLeft },
      showHead: 'everyPage',
    });

    const sanitized = String(accountNumber).replace(/\s+/g, '_');
    doc.save(`statement_${sanitized}_${generatedDate}.pdf`);
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }
}
