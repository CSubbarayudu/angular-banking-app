import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationStart,
         NavigationEnd } from '@angular/router';
import { NavbarComponent } from
  './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {

  isLoginPage = true;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Run check in constructor — before ANY template renders
    this.isLoginPage = this.checkUrl(this.router.url);
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart
       || event instanceof NavigationEnd) {
        const url = (event as any).urlAfterRedirects
                 || (event as any).url
                 || '';
        this.isLoginPage = this.checkUrl(url);
        this.cdr.detectChanges();
      }
    });
  }

  private checkUrl(url: string): boolean {
    return url === ''
        || url === '/'
        || url === '/login'
        || url.startsWith('/login?')
        || url.startsWith('/login#');
  }
}
