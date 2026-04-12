import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AccountsService } from '../../services/accounts.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { Account } from '../../models/account.model';
import { Transaction } from '../../models/transaction.model';
import { TransactionFilters, TransactionQuery } from '../../models/transaction-query.model';
import { AccountCardComponent } from '../../components/account-card/account-card.component';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, ErrorMessageComponent, AccountCardComponent],
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

  filterType: 'Credit' | 'Debit' | '' = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  startDate = '';
  endDate = '';

  page = 1;
  limit = 5;
  sortField: 'date' | 'amount' | 'type' | 'status' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  private lastAppliedFilters: TransactionFilters = {};

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
    return JSON.stringify(this.getCurrentFilters()) !== JSON.stringify(this.lastAppliedFilters);
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
    this.lastAppliedFilters = this.getCurrentFilters();

    const query: TransactionQuery = {
      accountId: this.accountId,
      page: this.page,
      limit: this.limit,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      ...this.lastAppliedFilters,
    };

    this.service.getTransactions(query).subscribe({
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

  applyFilters(): void { this.page = 1; this.loadTransactions(); }

  clearFilters(): void {
    this.filterType = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.startDate = '';
    this.endDate = '';
    this.page = 1;
    this.loadTransactions();
  }

  sort(field: 'date' | 'amount' | 'type' | 'status'): void {
    this.sortField = field;
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadTransactions();
  }

  nextPage(): void { this.page++; this.loadTransactions(); }

  prevPage(): void {
    if (this.page > 1) { this.page--; this.loadTransactions(); }
  }

  goBack(): void { this.router.navigate(['/accounts']); }

  viewStatement(): void {
    this.router.navigate(['/accounts', this.accountId, 'statements']);
  }

  downloadFilteredPDF(): void {
    if (!this.account) {
      return;
    }

    const query: TransactionQuery = {
      accountId: this.accountId,
      page: 1,
      limit: 100,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      ...this.getCurrentFilters(),
    };

    this.service.getTransactions(query).subscribe({
      next: (allFiltered) => {
        if (!allFiltered.length) {
          this.transactionsError = 'No transactions found for the selected filters.';
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

  private getCurrentFilters(): TransactionFilters {
    return {
      type: this.filterType,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount,
      startDate: this.startDate,
      endDate: this.endDate
    };
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
    doc.text(this.buildFilterLabel(), pageWidth / 2, currentY, { align: 'center' });

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

    const totalDebits = data.filter((tx) => String(tx.type).toLowerCase() === 'debit')
      .reduce((s, tx) => s + Number(tx.amount || 0), 0);
    const totalCredits = data.filter((tx) => String(tx.type).toLowerCase() === 'credit')
      .reduce((s, tx) => s + Number(tx.amount || 0), 0);
    const netChange = totalCredits - totalDebits;

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Description', 'Amount', 'Type', 'Status']],
      body: tableRows,
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: 'grid',
      margin: { left: marginLeft, right: marginLeft },
      showHead: 'everyPage',
    });

    const finalY = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || doc.internal.pageSize.getHeight() - 30;
    const summaryY = finalY + 12;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', marginLeft, summaryY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total Debits:  Rs. ${totalDebits.toFixed(2)}`, marginLeft, summaryY + 8);
    doc.text(`Total Credits: Rs. ${totalCredits.toFixed(2)}`, marginLeft, summaryY + 14);
    doc.text(`Net Change:    Rs. ${netChange.toFixed(2)}`, marginLeft, summaryY + 20);

    const timestamp = new Date().toLocaleTimeString();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `End of Statement - ${generatedDate} ${timestamp}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 15,
      { align: 'center' }
    );

    const sanitized = String(accountNumber).replace(/\s+/g, '_');
    const fromLabel = this.startDate || 'All';
    const toLabel = this.endDate || 'All';
    doc.save(`statement_${sanitized}_${fromLabel}_to_${toLabel}.pdf`);
  }

  private buildFilterLabel(): string {
    const parts: string[] = [];
    if (this.filterType) parts.push(`Type: ${this.filterType}`);
    if (this.minAmount) parts.push(`Min: Rs.${this.minAmount}`);
    if (this.maxAmount) parts.push(`Max: Rs.${this.maxAmount}`);
    if (this.startDate) parts.push(`From: ${this.startDate}`);
    if (this.endDate) parts.push(`To: ${this.endDate}`);
    return parts.length ? `Filters Applied - ${parts.join(' | ')}` : 'All Transactions';
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }
}
