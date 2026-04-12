import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/accounts/accounts.routes').then((m) => m.ACCOUNTS_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
