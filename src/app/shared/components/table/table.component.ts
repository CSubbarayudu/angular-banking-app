import { Component, Input } from '@angular/core';
import { Transaction } from '../../../features/accounts/models/transaction.model';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [],
  templateUrl: './table.component.html',
  styles: []
})
export class TableComponent {
  @Input() headers: string[] = [];
  @Input() data: Transaction[] = [];
  @Input() columns: Array<keyof Transaction> = [];
}
