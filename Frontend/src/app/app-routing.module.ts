import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';
import { CanDeactivateTab } from './guard/deactive.guard';

const routes: Routes = [
  // canActivate: [AuthGuard],
  {
    path: '',
    // canDeactivate: [CanDeactivateTab],
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login-or-register/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'product-details',
    loadChildren: () =>
      import('./product-details/product-details.module').then(
        (m) => m.ProductDetailsModule
      ),
  },
  {
    path: 'address',
    loadChildren: () =>
      import('./address/address.module').then((m) => m.AddressModule),
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./my-cart/my-cart.module').then((m) => m.MyCartModule),
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./checkout/checkout.module').then((m) => m.CheckoutModule),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
