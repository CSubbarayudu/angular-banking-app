import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `<p style="color:red;">{{ message }}</p>`
})
export class ErrorMessageComponent {
  @Input() message: string = '';
}