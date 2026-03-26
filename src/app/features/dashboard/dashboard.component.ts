import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; font-family: Arial, sans-serif;">
      <h1 style="color: #343a40;">🏦 Retail Banking Portal</h1>
      <p style="color: #6c757d; font-size: 16px;">
        Welcome! Use the navigation below to access your accounts.
      </p>

      <div style="margin-top: 30px;">
        <button
          (click)="goToAccounts()"
          style="background: #007bff; color: white; padding: 12px 25px;
                 border: none; border-radius: 6px; font-size: 15px; cursor: pointer;">
          View My Accounts
        </button>
      </div>
    </div>
  `
})
export class DashboardComponent {
  constructor(private router: Router) {}

  goToAccounts(): void {
    this.router.navigate(['/accounts']);
  }
}