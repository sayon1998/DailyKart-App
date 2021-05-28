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
  public products: any[] = [];

  constructor(
    public _auth: AuthService,
    public _global: GlobalService,
    public _user: UserDetailService
  ) {}
  //Check Wish-list
  checkLocalWishlist(item: any) {
    if (
      !this._auth.isLogin() &&
      localStorage.getItem('wishList') !== undefined
    ) {
      let localArray: any[] = [];
      localArray = JSON.parse(localStorage.getItem('wishList'));
      if (localArray && localArray.length > 0) {
        console.log(item.length);
        if (item && item.length !== undefined) {
          item.forEach((e: any) => {
            if (localArray.findIndex((x) => x._id === e._id) > -1) {
              e.icon = 'heart';
              // document.getElementById(
              //   `${item.findIndex((x) => x._id === e._id)}`
              // ).style.color = 'red';
            } else if (
              localArray.findIndex((x) => x._id === e._id) === -1 &&
              e.icon === 'heart'
            ) {
              e.icon = 'heart-outline';
            }
          });
        } else {
          if (localArray.findIndex((x) => x._id === item._id) > -1) {
            item.icon = 'heart';
            // document.getElementById(
            //   `${item.findIndex((x) => x._id === e._id)}`
            // ).style.color = 'red';
          } else if (
            localArray.findIndex((x) => x._id === item._id) === -1 &&
            item.icon === 'heart'
          ) {
            item.icon = 'heart-outline';
          }
        }
      }
      // else {
      //   if (item && item.length > 0 && !localArray) {
      //     item.forEach((x) => {
      //       if (x.icon === 'heart') {
      //         x.icon = 'heart-outline';
      //       }
      //     });
      //   }
      // }
    }
  }
  // Wish-list
  onClickWishList(item: any) {
    console.log(JSON.parse(localStorage.getItem('wishList')));
    if (item.icon && item.icon === 'heart') {
      // document.getElementById(`${index}`).style.color = '';
      item.icon = 'heart-outline';
      if (!this._auth.isLogin()) {
        let localArray: any[] = [];
        localArray = JSON.parse(localStorage.getItem('wishList'));
        localArray.splice(
          localArray.findIndex((x) => x._id === item._id),
          1
        );
        localStorage.removeItem('wishList');
        console.log(localArray);
        if (localArray && localArray.length > 0) {
          localStorage.setItem('wishList', JSON.stringify(localArray));
        }
        this._global.toasterValue('Remove from Your local Wishlist');
      } else {
        // If User is Login then
      }
    } else {
      // document.getElementById(`${index}`).style.color = 'red';
      item.icon = 'heart';
      if (!this._auth.isLogin()) {
        if (
          localStorage.getItem('wishList') &&
          typeof localStorage.getItem('wishList') != undefined
        ) {
          let localArray: any[] = [];
          localArray = JSON.parse(localStorage.getItem('wishList'));
          localArray = localArray.concat(item);
          localStorage.removeItem('wishList');
          console.log(localArray);
          localStorage.setItem('wishList', JSON.stringify(localArray));
        } else {
          localStorage.setItem('wishList', JSON.stringify([item]));
        }
        this._global.toasterValue('Added to Your local Wishlist');
      } else {
        // If User is Login then
      }
    }
  }
  // Quantity increase decrease
  onClickQuantity(product: any, index: number, type: string) {
    if (type === 'increase') {
      if (product.highestquentity === product.minqty) {
        this._global.toasterValue('Highest Quantity Reached');
      } else {
        product.minqty += 1;
      }
    } else if (type === 'decrease') {
      if (product.minqty === product.minqty) {
        this._global.toasterValue(`Minimum Quantity is ${product.minqty}`);
      } else {
        product.minqty -= 1;
      }
    }
  }
}
