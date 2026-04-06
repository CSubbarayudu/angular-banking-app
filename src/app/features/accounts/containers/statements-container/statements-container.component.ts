import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountsService } from '../../services/accounts.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AccountCardComponent } from '../../components/account-card/account-card.component';
@Component({
  selector: 'app-statements-container',
  standalone: true,
  imports: [CommonModule, FormsModule, AccountCardComponent],
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

  selectedFromDate = '';
  selectedToDate = '';

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

  get loggedInUser(): string {
    return localStorage.getItem('loggedInUser') || 'N/A';
  }

  get filteredTransactions(): any[] {
    if (!this.selectedFromDate && !this.selectedToDate) {
      return this.transactions;
    }

    return this.transactions.filter(tx => {
      if (!tx.date) return true;
      const txDate = new Date(tx.date);
      const from = this.selectedFromDate ? new Date(this.selectedFromDate) : null;
      const to = this.selectedToDate ? new Date(this.selectedToDate) : null;

      if (from && txDate < from) return false;
      if (to && txDate > to) return false;
      return true;
    });
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

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  applyFilters(): void {
    this.loadTransactions();
  }

  clearFilters(): void {
    this.selectedFromDate = '';
    this.selectedToDate = '';
    this.loadTransactions();
  }

  downloadPDF(): void {
    if (!this.account || !this.filteredTransactions.length) {
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 14;
    let currentY = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BANK STATEMENT', pageWidth / 2, currentY, { align: 'center' });

    currentY += 12;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const accountNumber = this.account.accountNumber || this.account.id || 'N/A';
    const accountType = this.account.accountType || this.account.type || 'N/A';
    const balanceValue = this.account.balance != null
      ? `Rs. ${Number(this.account.balance).toFixed(2)}`
      : 'N/A';
    const fromDate = this.selectedFromDate || 'All';
    const toDate = this.selectedToDate || 'All';
    const generatedDate = this.formatDate(new Date());

    const details = [
      `Bank Name:        XYZ Bank`,
      `Account Holder:    ${this.loggedInUser}`,
      `Account Number:    ${accountNumber}`,
      `Account Type:      ${accountType}`,
      `Balance:           ${balanceValue}`,
      `Statement Period:  ${fromDate} to ${toDate}`,
      `Total Records:     ${this.filteredTransactions.length} transaction(s)`,
      `Generated Date:    ${generatedDate}`
    ];

    details.forEach(line => {
      currentY += 6;
      doc.text(line, marginLeft, currentY);
    });

    currentY += 10;

    const data = this.filteredTransactions.map(tx => [
      tx.date ? this.formatDate(tx.date) : 'N/A',
      tx.description || '',
      `Rs. ${Number(tx.amount || 0).toFixed(2)}`,
      tx.type || 'N/A',
      tx.status || 'N/A'
    ]);

    const totalDebits = this.filteredTransactions
      .filter(tx => this.isDebit(tx))
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const totalCredits = this.filteredTransactions
      .filter(tx => this.isCredit(tx))
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const netChange = totalCredits - totalDebits;

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Description', 'Amount', 'Type', 'Status']],
      body: data,
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: 'grid',
      margin: { left: marginLeft, right: marginLeft },
      showHead: 'everyPage'
    });

    const finalY = (doc as any).lastAutoTable?.finalY || doc.internal.pageSize.getHeight() - 30;
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
    const footerText = `End of Statement - ${generatedDate} ${timestamp}`;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });

    const sanitized = String(accountNumber).replace(/\s+/g, '_');
    const fromLabel = this.selectedFromDate || 'All';
    const toLabel = this.selectedToDate || 'All';
    doc.save(`statement_${sanitized}_${fromLabel}_to_${toLabel}.pdf`);
  }

  goBack(): void {
    this.router.navigate(['/accounts', this.accountId]);
  }

  getTotalCredits(): number {
    return (this.filteredTransactions || this.transactions || [])
      .filter((t: any) => t.type === 'Credit')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  }

  getTotalDebits(): number {
    return (this.filteredTransactions || this.transactions || [])
      .filter((t: any) => t.type === 'Debit')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  }
}