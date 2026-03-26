import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/accounts/accounts.module')
        .then(m => m.AccountsModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];