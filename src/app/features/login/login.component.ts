import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isSubmitted: boolean = false;

  // Hardcoded credentials
  private readonly validCredentials = [
    { username: 'admin', password: 'admin123' },
    { username: 'user', password: 'user123' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;

    // Check against hardcoded credentials
    const isValidUser = this.validCredentials.some(
      cred => cred.username === username && cred.password === password
    );

    if (isValidUser) {
      // Save to localStorage
      localStorage.setItem('authToken', 'mock-token-12345');
      localStorage.setItem('loggedInUser', username);

      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // Show error message
      this.errorMessage = 'Invalid credentials. Please try again.';
    }
  }
}
