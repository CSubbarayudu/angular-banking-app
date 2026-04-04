import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [],
  templateUrl: './table.component.html',
  styles: []
})
export class TableComponent {
  @Input() headers: string[] = [];
  @Input() data: any[] = [];
  @Input() columns: string[] = [];
}