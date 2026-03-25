import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'accounts',
    pathMatch: 'full'
  },
  {
    path: 'accounts',
    loadChildren: () =>
      import('./features/accounts/accounts.module').then(m => m.AccountsModule)
  },
  {
    path: '**',
    redirectTo: 'accounts'
  }
];