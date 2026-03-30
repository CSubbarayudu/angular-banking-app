import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {

  isLoggedIn = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Re-check on every route navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateLoginStatus();
    });
    // Check immediately on component load
    this.updateLoginStatus();
  }

  private updateLoginStatus(): void {
    const hasToken    = !!localStorage.getItem('authToken');
    const onLoginPage = this.router.url === '/login' || this.router.url.startsWith('/login');
    // Show nav ONLY if token exists AND we are NOT on the login page
    this.isLoggedIn   = hasToken && !onLoginPage;
    this.cdr.detectChanges();
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('loggedInUser');
    this.isLoggedIn = false;
    this.cdr.detectChanges();
    this.router.navigate(['/login']);
  }
}