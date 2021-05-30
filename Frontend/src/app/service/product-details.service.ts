/* eslint-disable no-underscore-dangle */
/* eslint-disable object-shorthand */
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { GlobalService } from './global.service';
import { UserDetailService } from './user-details.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(
    public _auth: AuthService,
    public _global: GlobalService,
    public _user: UserDetailService
  ) {}

  // Quantity increase decrease
  onClickQuantity(product: any, index: number, type: string) {
    if (type === 'increase') {
      if (product.highestquentity === product.orderqty) {
        this._global.toasterValue('Highest Quantity Reached');
      } else {
        product.orderqty += 1;
      }
    } else if (type === 'decrease') {
      if (product.minqty === product.orderqty) {
        this._global.toasterValue(`Minimum Quantity is ${product.minqty}`);
      } else {
        product.orderqty -= 1;
      }
    }
  }
}
