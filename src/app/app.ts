import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {

  isLoginPage = true;
  sidebarOpen = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object  // ✅ ADDED
  ) {
    this.isLoginPage = this.checkUrl(this.router.url);
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart || event instanceof NavigationEnd) {
        const url = (event as any).urlAfterRedirects
                 || (event as any).url
                 || '';
        this.isLoginPage = this.checkUrl(url);

        // ✅ FIXED: was window.innerWidth directly — crashes during SSR build
        if (isPlatformBrowser(this.platformId) && window.innerWidth <= 768) {
          this.sidebarOpen = false;
        }

        this.cdr.detectChanges();
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private checkUrl(url: string): boolean {
    return url === ''
        || url === '/'
        || url === '/login'
        || url.startsWith('/login?')
        || url.startsWith('/login#');
  }
}