import { Component, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountsService } from '../accounts/services/accounts.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, ErrorMessageComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly accountsService: AccountsService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private readonly platformId: object,
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

    this.accountsService.authenticate(this.username, this.password).subscribe({
      next: (session) => {
        this.isLoading = false;

        if (!session) {
          this.errorMessage = 'Invalid username or password. Please try again.';
          this.cdr.detectChanges();
          return;
        }

        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('authToken', session.token);
          localStorage.setItem('loggedInUser', session.username);
          localStorage.setItem('fullName', session.fullName);
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message;
        this.cdr.detectChanges();
      }
    });
  }
}
