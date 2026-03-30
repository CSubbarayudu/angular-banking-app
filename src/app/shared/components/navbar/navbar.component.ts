import { Component, OnInit, ChangeDetectorRef,
         Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive,
         NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isLoggedIn   = false;
  fullName     = '';
  loggedInUser = '';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.updateLoginStatus();
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateLoginStatus();
    });
  }

  updateLoginStatus(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = false;
      return;
    }

    const url = this.router.url;
    const onLoginPage = url === '/login'
                     || url === '/'
                     || url === ''
                     || url.startsWith('/login');

    const hasToken = !!localStorage.getItem('authToken');

    // isLoggedIn is TRUE only when:
    // user HAS a token AND is NOT on the login page
    this.isLoggedIn = hasToken && !onLoginPage;

    if (this.isLoggedIn) {
      this.fullName     = localStorage.getItem('fullName')     || '';
      this.loggedInUser = localStorage.getItem('loggedInUser') || '';
    } else {
      this.fullName     = '';
      this.loggedInUser = '';
    }
    this.cdr.detectChanges();
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('fullName');
    }
    this.isLoggedIn = false;
    this.cdr.detectChanges();
    this.router.navigate(['/login']);
  }

  getInitials(): string {
    if (!this.fullName) return 'U';
    const parts = this.fullName.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }
}