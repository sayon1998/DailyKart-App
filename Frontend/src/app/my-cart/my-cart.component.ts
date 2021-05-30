/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { SheetState } from 'ion-bottom-sheet';
import { AddressService } from '../service/address.service';
import { AuthService } from '../service/auth.service';
import { GlobalService } from '../service/global.service';
import { ProductService } from '../service/product-details.service';
import { UserDetailService } from '../service/user-details.service';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.component.html',
  styleUrls: ['./my-cart.component.scss'],
  providers: [AddressService],
})
export class MyCartComponent implements OnInit {
  sheetState = SheetState.Bottom;
  minHeight = 0;
  dockedHeight = 500;
  transition = '0.5s ease-out';
  roundBorderOnTop = true;
  topDistance = 5;
  title = 'Address';
  disableDrag = true;
  hideDragIcon = true;
  enableScrollContent = true;
  shadowBorder = true;
  totalPrice = 0;
  totalOfferPrice = 0;
  selectAllFlag = true;
  cartFlag = true;
  public cartArray: any[] = [];
  public spin = true;
  constructor(
    public _address: AddressService,
    public _user: UserDetailService,
    public _product: ProductService,
    public _global: GlobalService,
    public _auth: AuthService,
    public _router: Router,
    public nav: NavController,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // this._global.goBackToForoward();
    this.checkKart();
  }

  // Check Cart Ids
  checkKart() {
    if (this._auth.isLogin()) {
      this._global
        .get(
          'product/get-cart-wishlist/',
          `${localStorage.getItem('userId')}/cart`
        )
        .subscribe(
          (resData: any) => {
            if (resData.status) {
              if (
                resData.data &&
                resData.data.cart &&
                resData.data.cart.length > 0
              ) {
                this._user.cartArray = [];
                this.cartArray = [];
                this._user.cartArray = resData.data.cart;
                this.getCartDetails();
              } else {
                this._user.cartArray = [];
                this.cartArray = [];
                this.spin = false;
                // this._global.toasterValue(resData.message, 'Success');
              }
            } else {
              this.spin = false;
              this._global.toasterValue(resData.message, 'Error');
            }
          },
          (err) => {
            this.spin = false;
            this._global.toasterValue(err.message, 'Error');
          }
        );
    } else {
      this.getCartDetails();
    }
  }

  // get cart details
  getCartDetails() {
    if (this._user.cartArray && this._user.cartArray.length > 0) {
      const param = {
        product: this._user.cartArray,
      };
      this._global.post('/product/productbymultipleid', param).subscribe(
        (resData: any) => {
          if (resData.status) {
            if (resData.data) {
              for (const index in resData.data) {
                resData.data[index].isCheckout = true;
                resData.data[index].isSpin = false;
              }
              this.cartArray = resData.data;
              console.log(this.cartArray);
              this.selectAll(false, 'selectAll');
              this.cartFlag = false;
              this.spin = false;
            }
          }
        },
        (err) => {
          this._global.toasterValue(err.message);
        }
      );
    }
  }
  selectAll(value: boolean, type: string, index: number = null) {
    if (type === 'selectAll') {
      if (!value) {
        this.cartArray.forEach((x) => {
          if (!x.isCheckout) {
            x.isCheckout = true;
          }
        });
      } else {
        this.cartArray.forEach((x) => {
          if (x.isCheckout) {
            x.isCheckout = false;
          }
        });
      }
      this.getPrice();
    } else if (type === 'select') {
      let flag = false;
      if (value) {
        for (let i = 0; i < this.cartArray.length; i++) {
          if (index !== i && !this.cartArray[i].isCheckout) {
            flag = true;
            break;
          }
        }
        if (flag) {
          this.selectAllFlag = false;
        } else {
          this.selectAllFlag = true;
        }
        this.totalPrice +=
          this.cartArray[index].minqty *
          parseFloat(this.cartArray[index].originalprice);
        this.totalOfferPrice +=
          this.cartArray[index].minqty *
          parseFloat(this.cartArray[index].price);
      } else {
        this.selectAllFlag = false;
        this.totalPrice -=
          this.cartArray[index].minqty *
          parseFloat(this.cartArray[index].originalprice);
        this.totalOfferPrice -=
          this.cartArray[index].minqty *
          parseFloat(this.cartArray[index].price);
      }
    }
  }
  getPrice() {
    this.totalOfferPrice = 0;
    this.totalPrice = 0;
    this.cartArray.forEach((x) => {
      if (x.isCheckout) {
        this.totalPrice += x.minqty * parseFloat(x.originalprice);
        this.totalOfferPrice += x.minqty * parseFloat(x.price);
      }
    });
  }
  onClickMoveToWishlist(item: any) {
    if (this._auth.isLogin()) {
      const param = {
        userId: localStorage.getItem('userId'),
        cart: [],
        wishlist: [],
      };
      param.cart.push(item._id);
      item.isSpin = true;
      this._global
        .post('product/move-cart-wishlist-viceversa', param)
        .subscribe(
          (resData: any) => {
            if (resData.status) {
              if (resData.data) {
                // localStorage.removeItem('cart');
                // localStorage.removeItem('wishList');
                // localStorage.setItem('cart', JSON.stringify(resData.data.cart));
                // localStorage.setItem(
                //   'wishList',
                //   JSON.stringify(resData.wishlist)
                // );
                this._global.toasterValue(
                  `${item.name} is successfully move to wishlist`,
                  'Success'
                );
                item.isSpin = false;
                this._user.cartArray.splice(
                  this._user.cartArray.indexOf(item._id),
                  1
                );
                this.cartArray.splice(this.cartArray.indexOf(item), 1);
              }
            }
          },
          (err) => {
            this._global.toasterValue(err.message, 'Error');
          }
        );
    } else {
      if (typeof localStorage.getItem('wishList') !== 'object') {
        let wishlist: any[] = [];
        wishlist = JSON.parse(localStorage.getItem('wishList'));
        if (wishlist.findIndex((x) => x === item._id) === -1) {
          this.cartArray.splice(this.cartArray.indexOf(item), 1);
          this._user.cartArray.splice(
            this._user.cartArray.indexOf(item._id),
            1
          );
          localStorage.removeItem('cart');
          localStorage.setItem('cart', JSON.stringify(this._user.cartArray));
          wishlist.push(item._id);
          localStorage.removeItem('wishList');
          localStorage.setItem('wishList', JSON.stringify(wishlist));
          this._global.toasterValue(
            `${item.name} is successfully move to wishlist`,
            'Success'
          );
        } else {
          this._global.toasterValue(
            `${item.name} is already in your wishlist`,
            'Warning'
          );
        }
      } else {
        this.cartArray.splice(this.cartArray.indexOf(item), 1);
        this._user.cartArray.splice(this._user.cartArray.indexOf(item._id), 1);
        localStorage.removeItem('cart');
        localStorage.setItem('cart', JSON.stringify(this._user.cartArray));
        localStorage.setItem('wishList', JSON.stringify([item._id]));
      }
    }
    this.getPrice();
  }
  onClickDelete(item: any) {
    if (this._auth.isLogin()) {
      const param = {
        userId: localStorage.getItem('userId'),
        cart: [],
        wishlist: [],
      };
      param.cart.push(item._id);
      item.isSpin = true;
      this._global.post('product/delete-cart-wishlist', param).subscribe(
        (resData: any) => {
          if (resData.status) {
            if (resData.data) {
              // localStorage.setItem('cart', JSON.stringify(resData.data.cart));
              this.checkKart();
              this._global.toasterValue(
                `${item.name} is successfully deleted from your cart`,
                'Success'
              );
            }
          }
        },
        (err) => {
          this._global.toasterValue(err.message, 'Error');
        }
      );
    } else {
      this.cartArray.splice(this.cartArray.indexOf(item), 1);
      this._user.cartArray.splice(this._user.cartArray.indexOf(item._id), 1);
      localStorage.removeItem('cart');
      localStorage.setItem('cart', JSON.stringify(this._user.cartArray));
      this._global.toasterValue(
        `${item.name} is successfully deleted from your cart`,
        'Success'
      );
    }
    this.getPrice();
  }
  onClickBuyNow() {
    console.log(this.cartArray);
    if (this.totalPrice !== 0 && this.totalOfferPrice !== 0) {
      this._user.checkOutArray.productDetails = [];
      this.cartArray.forEach((x) => {
        if (x.isCheckout) {
          this._user.checkOutArray.productDetails.push(x);
        }
      });
      this._user.checkOutArray.totalOriginalPrice = this.totalPrice;
      this._user.checkOutArray.totalOfferPrice = this.totalOfferPrice;
      this._user.checkOutArray.totalOfferPercentage =
        (
          100 -
          (this._user.checkOutArray.totalOfferPrice /
            this._user.checkOutArray.totalOriginalPrice) *
            100
        ).toFixed(2) + '% Off';
      this._user.checkOutArray.deliveryaddress = this._address.addressArray[0];
      console.log(this._user.checkOutArray);
      this.nav.navigateRoot(['/checkout']);
      // if (this._auth.isLogin()) {
      // } else {
      //   this.nav.navigateRoot(['/login']);
      // }
    } else {
      this._global.toasterValue(
        'You have to select minimum one item',
        'Warning'
      );
    }
  }
  onClickAddress(type: any) {
    // this.nav.navigateRoot(['/product-details/address'], {
    //   queryParams: {
    //     _id: this._product.products[this.index]._id,
    //     index: this.index,
    //   },
    // });
    this.title = 'Address';
    if (type === 'add') {
      // Navigate to Address Page
    } else if (type === 'change') {
      this.title = 'Change Your' + ' ' + this.title;
      this.sheetState = SheetState.Docked;
    }
  }

  onClickAddressChange(index: number) {
    const tempAdd = this._address.addressArray[index];
    this._address.addressArray.splice(index, 1);
    this._address.addressArray.splice(0, 0, tempAdd);
    console.log(index, this._address.addressArray);
    this.sheetState = SheetState.Bottom;
  }
}
