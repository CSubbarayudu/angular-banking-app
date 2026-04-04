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
  @Output() cardClicked = new EventEmitter<string>();

  onSelect(): void {
    this.cardClicked.emit(this.account.id);
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'Active': 'green',
      'Inactive': 'orange',
      'Blocked': 'red'
    };
    return colorMap[status] || 'black';
  }
}
