import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductDetailsComponent } from './product-details.component';
import { RecommendedProductsComponent } from './recommended-products/recommended-products.component';

const routes: Routes = [
  {
    path: '',
    component: ProductDetailsComponent,
  },
  {
    path: 'recommended',
    component: RecommendedProductsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductDetailsRoutingModule {}
