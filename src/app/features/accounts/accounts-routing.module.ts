import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { canDeactivateGuard } from '../../core/guards/can-deactivate-guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/accounts-container/accounts-container.component')
        .then(m => m.AccountsContainerComponent)
  },
  {
    path: ':id/statements',
    loadComponent: () =>
      import('./containers/statements-container/statements-container.component')
        .then(m => m.StatementsContainerComponent)
  },
  {
    path: ':id/transactions',
    loadComponent: () =>
      import('./containers/transactions-container/transactions-container.component')
        .then(m => m.TransactionsContainerComponent)
  },
  {
    path: ':id',
    canDeactivate: [canDeactivateGuard],   // ← WIRED HERE
    loadComponent: () =>
      import('./containers/account-details.component/account-details.component')
        .then(m => m.AccountDetailsComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule {}