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
    totalOfferPercentage: null,
    deliveryaddress: {},
  };
  constructor(private _auth: AuthService, private _global: GlobalService) {
    console.log(this.cartArray);
    this.checkKart();
    this.checkWishList();
  }
  // Check Wishlist
  checkWishList() {
    if (this._auth.isLogin()) {
    } else {
      if (
        localStorage.getItem('wishList') &&
        typeof localStorage.getItem('wishList') !== 'object'
      ) {
        this.wishArray = JSON.parse(localStorage.getItem('wishList'));
      }
    }
  }
  // Check Cart Details
  checkKart() {
    if (this._auth.isLogin()) {
    } else {
      if (
        localStorage.getItem('cart') &&
        typeof localStorage.getItem('cart') !== 'object'
      ) {
        this.cartArray = JSON.parse(localStorage.getItem('cart'));
      }
    }
  }
  // Cart Product
  onClickCart(product: any) {
    if (this._auth.isLogin()) {
      const param = {
        userId: localStorage.getItem('userId'),
        cart: [product._id],
        wishlist: [],
      };
      this._global.post('product/save-cart-wishlist', param).subscribe(
        (resData: any) => {
          if (resData.status) {
            if (resData.data) {
              this.cartArray = [];
              this.cartArray = resData.data.cart;
              this._global.toasterValue(resData.message, 'Success');
            }
          }
        },
        (err) => {
          this._global.toasterValue(err.message, 'Error');
        }
      );
    } else {
      if (
        this.cartArray &&
        this.cartArray.findIndex((x) => x === product._id) === -1
      ) {
        this.cartArray.push(product._id);
        localStorage.setItem('cart', JSON.stringify(this.cartArray));
        this._global.toasterValue(`${product.name} is added to cart`);
        return true;
      } else {
        this._global.toasterValue(`${product.name} is already added to cart`);
        return false;
      }
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
