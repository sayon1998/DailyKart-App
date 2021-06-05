/* eslint-disable no-underscore-dangle */
/* eslint-disable eol-last */
/* eslint-disable object-shorthand */
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { GlobalService } from './global.service';

@Injectable({ providedIn: 'root' })
export class UserDetailService {
  public wishArray: any[] = [];
  public cartArray: any[] = [];
  public checkOutArray: any = {
    productDetails: [],
    totalOriginalPrice: 0,
    totalOfferPrice: 0,
    deliveryCharge: 0,
    totalOfferPercentage: null,
    deliveryaddress: {},
  };
  constructor(private _auth: AuthService, public _global: GlobalService) {
    if (!_auth.isLogin()) {
      this.checkKart();
      this.checkWishList();
    }
  }
  // Check Wishlist
  checkWishList() {
    if (
      localStorage.getItem('wishList') &&
      typeof localStorage.getItem('wishList') !== 'object'
    ) {
      this.wishArray = JSON.parse(localStorage.getItem('wishList'));
    }
  }
  // Check Cart Details
  checkKart() {
    if (
      localStorage.getItem('cart') &&
      typeof localStorage.getItem('cart') !== 'object'
    ) {
      this.cartArray = JSON.parse(localStorage.getItem('cart'));
    }
  }

  //Remove from Cart
  onClickRemoveCart(product: any) {
    if (this._auth.isLogin()) {
    } else {
      this.cartArray.splice(
        this.cartArray.findIndex((x) => x === product._id),
        1
      );
      this._global.toasterValue(`${product.name} is removed from cart`);
    }
  }
}
