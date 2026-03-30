import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-padding">
      <div class="card">
        <h1 class="section-title" style="font-size: 28px; margin: 0;">Welcome back, {{ username }}!</h1>
        <p style="color: #718096; font-size: 16px; margin-top: 8px; margin-bottom: 32px;">Manage your accounts and transactions securely</p>

        <div style="margin-bottom: 24px;">
          <button (click)="goToAccounts()" style="background: #1a56db; color: white; padding: 12px 28px; font-size: 16px; border-radius: 8px; border: none; cursor: pointer;">
            View My Accounts
          </button>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  get username(): string {
    return localStorage.getItem('loggedInUser') || 'User';
  }

  constructor(private router: Router) {}

  goToAccounts(): void {
    this.router.navigate(['/accounts']);
  }
}