import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.css']
})
export class AccountCardComponent {
  @Input() account: any;
  @Input() interactive: boolean = true;  // 👈 ADD THIS LINE
  @Output() cardClicked = new EventEmitter<string>();

  onSelect(): void {
    if (this.interactive) {             // 👈 ADD THIS CHECK
      this.cardClicked.emit(this.account.id);
    }
  }

  getAccountIcon(type: string): string {
    const icons: Record<string, string> = {
      'Savings': '🏦',
      'Current': '💼',
      'Fixed Deposit': '🔒'
    };
    return icons[type] || '💳';
  }

  getMaskedNumber(accountNumber: string): string {
    return '••••' + accountNumber.slice(-4);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Active': 'badge-active',
      'Inactive': 'badge-inactive',
      'Blocked': 'badge-blocked'
    };
    return map[status] || 'badge-active';
  }
}