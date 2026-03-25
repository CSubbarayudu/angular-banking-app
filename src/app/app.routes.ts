import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'accounts',
    pathMatch: 'full'
  },
  {
    path: 'accounts',
    canActivate: [authGuard], // 🛡️ Section 5.3 Requirement Met!
    loadChildren: () => import('./features/accounts/accounts.module').then(m => m.AccountsModule)
  },
  {
    path: '**', // 🛡️ Section 5.5 Fallback route handling
    redirectTo: 'accounts'
  }
];