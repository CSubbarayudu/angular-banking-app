import { Component, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment'; // ✅ ADDED

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  onLogin(): void {
    if (!this.username || !this.username.trim()) {
      this.errorMessage = 'Please enter your username.';
      return;
    }
    if (!this.password || !this.password.trim()) {
      this.errorMessage = 'Please enter your password.';
      return;
    }
    this.errorMessage = '';

    this.isLoading = true;
    this.cdr.detectChanges();

    // ✅ FIXED: was http://localhost:3005 hardcoded
    this.http.get<any[]>(
      `${environment.apiUrl}/users?username=${this.username.trim()}`
    ).subscribe({
      next: (users) => {
        this.isLoading = false;

        const user = users.find(
          u => u.username === this.username.trim()
            && u.password === this.password
        );

        if (user) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('authToken', 'Bearer ' + user.id);
            localStorage.setItem('loggedInUser', user.username);
            localStorage.setItem('fullName', user.fullName);
          }
          this.router.navigate(['/dashboard']);
        } else {
          this.isLoading = false;
          this.errorMessage = 'Invalid username or password. Please try again.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.status === 0
          ? 'Cannot connect to server. Ensure json-server is running on port 3005.'
          : 'Login failed. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}