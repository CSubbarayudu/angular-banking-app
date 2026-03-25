import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/accounts-container/accounts-container.component')
        .then(m => m.AccountsContainerComponent)
  },
  {
  path: ':id',
  loadComponent: () =>
    import('./containers/account-details.component/account-details.component')
      .then(m => m.AccountDetailsComponent)
},
  {
    path: ':id',
    loadComponent: () =>
      import('./containers/transactions-container/transactions-container.component')
        .then(m => m.TransactionsContainerComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule {}