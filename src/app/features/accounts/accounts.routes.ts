import { Routes } from '@angular/router';
import { unsavedFiltersGuard } from '../../core/guards/unsaved-filters.guard';

export const ACCOUNTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/accounts-container/accounts-container.component').then(
        (m) => m.AccountsContainerComponent,
      ),
  },
  {
    path: ':id/statements',
    loadComponent: () =>
      import('./containers/statements-container/statements-container.component').then(
        (m) => m.StatementsContainerComponent,
      ),
  },
  {
    path: ':id/transactions',
    canDeactivate: [unsavedFiltersGuard],
    loadComponent: () =>
      import('./containers/transactions-container/transactions-container.component').then(
        (m) => m.TransactionsContainerComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./containers/account-details.component/account-details.component').then(
        (m) => m.AccountDetailsComponent,
      ),
  },
];
