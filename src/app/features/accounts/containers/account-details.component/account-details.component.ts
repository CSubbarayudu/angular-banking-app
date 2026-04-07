import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountsService } from '../../services/accounts.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AccountCardComponent } from '../../components/account-card/account-card.component';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, AccountCardComponent],
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css']
})
export class AccountDetailsComponent implements OnInit {

  accountId!: string;
  account: any = null;
  transactions: any[] = [];
  loading = false;
  accountLoading = false;

  filterType = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  startDate = '';
  endDate = '';

  page = 1;
  limit = 5;
  sortField = 'date';
  sortOrder = 'desc';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: AccountsService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object  // ✅ ADDED
  ) { }

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') || '1';
    this.loadAccount();
    this.loadTransactions();
  }

  loadAccount(): void {
    this.accountLoading = true;
    this.service.getAccounts().subscribe({
      next: (res: any[]) => {
        this.account = res.find((a: any) => String(a.id) === String(this.accountId)) || res[0];
        this.accountLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.accountLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTransactions(): void {
    this.loading = true;
    this.cdr.detectChanges();

    const filters = {
      type: this.filterType,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount,
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.service.getTransactions(
      this.accountId, this.page, this.limit,
      filters, this.sortField, this.sortOrder
    ).subscribe({
      next: (res: any) => {
        this.transactions = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Transactions API error:', err);
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

  sort(field: string): void {
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
    if (!this.account) return;

    const filters = {
      type: this.filterType,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount,
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.service.getTransactions(
      this.accountId, 1, 100,
      filters, this.sortField, this.sortOrder
    ).subscribe({
      next: (allFiltered: any[]) => {
        if (!allFiltered?.length) {
          alert('No transactions found for the selected filters.');
          return;
        }
        this.generatePDF(allFiltered);
      },
      error: () => {
        alert('Failed to fetch transactions for PDF.');
      }
    });
  }

  private generatePDF(data: any[]): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 14;
    let currentY = 20;

    // ── HEADER ──────────────────────────────────────────────
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BANK STATEMENT', pageWidth / 2, currentY, { align: 'center' });

    // ── SUBTITLE ─────────────────────────────────────────────
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(this.buildFilterLabel(), pageWidth / 2, currentY, { align: 'center' });

    currentY += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // ── ACCOUNT DETAILS ──────────────────────────────────────
    const accountNumber = this.account.accountNumber || this.account.id || 'N/A';
    const accountType = this.account.accountType || this.account.type || 'N/A';
    const balanceValue = this.account.balance != null
      ? `Rs. ${Number(this.account.balance).toFixed(2)}` : 'N/A';

    // ✅ SSR SAFE — only read localStorage in browser
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

    details.forEach(line => { currentY += 6; doc.text(line, marginLeft, currentY); });
    currentY += 10;

    // ── TRANSACTIONS TABLE ───────────────────────────────────
    const tableRows = data.map(tx => [
      tx.date ? this.formatDate(tx.date) : 'N/A',
      tx.description || '',
      `Rs. ${Number(tx.amount || 0).toFixed(2)}`,
      tx.type || 'N/A',
      tx.status || 'N/A'
    ]);

    const totalDebits = data.filter(tx => String(tx.type).toLowerCase() === 'debit')
      .reduce((s, tx) => s + Number(tx.amount || 0), 0);
    const totalCredits = data.filter(tx => String(tx.type).toLowerCase() === 'credit')
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

    const finalY = (doc as any).lastAutoTable?.finalY || doc.internal.pageSize.getHeight() - 30;
    const summaryY = finalY + 12;

    // ── SUMMARY ──────────────────────────────────────────────
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', marginLeft, summaryY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total Debits:  Rs. ${totalDebits.toFixed(2)}`, marginLeft, summaryY + 8);
    doc.text(`Total Credits: Rs. ${totalCredits.toFixed(2)}`, marginLeft, summaryY + 14);
    doc.text(`Net Change:    Rs. ${netChange.toFixed(2)}`, marginLeft, summaryY + 20);

    // ── FOOTER ───────────────────────────────────────────────
    const timestamp = new Date().toLocaleTimeString();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `End of Statement - ${generatedDate} ${timestamp}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 15,
      { align: 'center' }
    );

    // ── SAVE ─────────────────────────────────────────────────
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