/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable guard-for-in */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { AuthService } from '../service/auth.service';
import { GlobalService } from '../service/global.service';
import { UserDetailService } from '../service/user-details.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-my-wishlist',
  templateUrl: './my-wishlist.component.html',
  styleUrls: ['./my-wishlist.component.scss'],
})
export class MyWishlistComponent implements OnInit {
  public wishArray: any = ([] = []);
  public isSpin = true;
  public lastKey = 0;
  public totalLimit = 0;
  public isDisabled = false;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  constructor(
    public nav: NavController,
    public _global: GlobalService,
    public _user: UserDetailService,
    public _auth: AuthService,
    public alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.checkWishList();
  }
  // Check Wishlist
  checkWishList() {
    if (this._auth.isLogin()) {
      this._global
        .get(
          'product/get-cart-wishlist/',
          `${localStorage.getItem('userId')}/wishlist`
        )
        .subscribe(
          (resData: any) => {
            if (resData.status) {
              if (
                resData.data &&
                resData.data.wishlist &&
                resData.data.wishlist.length > 0
              ) {
                this._user.wishArray = resData.data.wishlist;
                this.getWishlistProductDetails();
              } else {
                this.isSpin = false;
              }
            } else {
              this.isSpin = false;
              this._global.toasterValue(resData.message, 'Error');
            }
          },
          (err) => {
            this.isSpin = false;
            this._global.toasterValue(err.message, 'Error');
          }
        );
    } else {
      if (
        localStorage.getItem('wishList') &&
        typeof localStorage.getItem('wishList') !== 'object'
      ) {
        this._user.wishArray = JSON.parse(localStorage.getItem('wishList'));
        this.getWishlistProductDetails();
      }
    }
  }
  // Get Product Details against wishlist id
  getWishlistProductDetails() {
    if (this._user.wishArray && this._user.wishArray.length > 0) {
      this.totalLimit = this._user.wishArray.length;
      const param = {
        product: [],
      };
      for (let i = this.lastKey; i < this.lastKey + 6; i++) {
        param.product.push(this._user.wishArray[i]);
      }
      this._global.post('/product/productbymultipleid', param).subscribe(
        (resData: any) => {
          if (resData.status) {
            if (resData.data) {
              for (const index in resData.data) {
                resData.data[index].isSpin = false;
              }
              this.wishArray = this.wishArray.concat(resData.data);
              this.lastKey += 6;
              this.isSpin = false;
              console.log(this.wishArray);
            }
          }
        },
        (err) => {
          this.isSpin = false;
          this._global.toasterValue(err.message);
        }
      );
    }
  }
  // Infinite Scroll
  loadData(event: any) {
    console.log('##### Infinite Scroll #####');
    setTimeout(() => {
      event.target.complete();
      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (this.lastKey >= this.totalLimit) {
        this.infiniteScroll.disabled = true; // For Disable Infinte Scroll when last data load
      } else {
        console.log('calling');
        this.getWishlistProductDetails();
      }
    }, 600);
  }
  async onClickDeleteWishList(item: any) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Are you want to delete ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          },
        },
        {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm Ok');
            if (this._auth.isLogin()) {
              const param = {
                userId: localStorage.getItem('userId'),
                cart: [],
                wishlist: [],
              };
              param.wishlist.push(item._id);
              this.isDisabled = true;
              this._global
                .post('product/delete-cart-wishlist', param)
                .subscribe(
                  (resData: any) => {
                    if (resData.status) {
                      if (resData.data) {
                        // localStorage.setItem('cart', JSON.stringify(resData.data.cart));
                        this.wishArray.splice(this.wishArray.indexOf(item), 1);
                        this._user.wishArray.splice(
                          this._user.wishArray.indexOf(item._id),
                          1
                        );
                        this.isDisabled = false;
                        this._global.toasterValue(
                          `${item.name} is successfully deleted from your wishlist`,
                          'Success'
                        );
                      }
                    }
                  },
                  (err) => {
                    this.isDisabled = false;
                    this._global.toasterValue(err.message, 'Error');
                  }
                );
            } else {
              this.wishArray.splice(this.wishArray.indexOf(item), 1);
              this._user.wishArray.splice(
                this._user.wishArray.indexOf(item._id),
                1
              );
              localStorage.removeItem('wishList');
              localStorage.setItem(
                'wishList',
                JSON.stringify(this._user.wishArray)
              );
              this._global.toasterValue(
                `${item.name} is successfully deleted from your wishlist`,
                'Success'
              );
            }
          },
        },
      ],
    });

    await alert.present();
  }
  onClickMoveToCart(item: any) {
    if (this._auth.isLogin()) {
      const param = {
        userId: localStorage.getItem('userId'),
        cart: [],
        wishlist: [],
      };
      param.wishlist.push(item._id);
      item.isSpin = true;
      this.isDisabled = true;
      this._global
        .post('product/move-cart-wishlist-viceversa', param)
        .subscribe(
          (resData: any) => {
            if (resData.status) {
              if (resData.data) {
                this._global.toasterValue(
                  `${item.name} is successfully move to cart`,
                  'Success'
                );
                item.isSpin = false;
                this.isDisabled = false;
                if (
                  this._user.cartArray.findIndex((x) => x === item._id) === -1
                ) {
                  this._user.cartArray.push(item._id);
                }
                this._user.wishArray.splice(
                  this._user.wishArray.indexOf(item._id),
                  1
                );
                this.wishArray.splice(this.wishArray.indexOf(item), 1);
                this.isDisabled = false;
              }
            }
          },
          (err) => {
            this.isDisabled = false;
            this._global.toasterValue(err.message, 'Error');
          }
        );
    } else {
      if (typeof localStorage.getItem('cart') !== 'object') {
        let cart: any[] = [];
        cart = JSON.parse(localStorage.getItem('cart'));
        if (cart.findIndex((x) => x === item._id) === -1) {
          this.wishArray.splice(this.wishArray.indexOf(item), 1);
          this._user.wishArray.splice(
            this._user.wishArray.indexOf(item._id),
            1
          );
          localStorage.removeItem('wishList');
          localStorage.setItem(
            'wishList',
            JSON.stringify(this._user.wishArray)
          );
          cart.push(item._id);
          localStorage.removeItem('cart');
          localStorage.setItem('cart', JSON.stringify(cart));
          this._global.toasterValue(
            `${item.name} is successfully move to cart`,
            'Success'
          );
        } else {
          this._global.toasterValue(
            `${item.name} is already in your cart`,
            'Warning'
          );
        }
      } else {
        this.wishArray.splice(this.wishArray.indexOf(item), 1);
        this._user.wishArray.splice(this._user.wishArray.indexOf(item._id), 1);
        localStorage.removeItem('wishList');
        localStorage.setItem('wishList', JSON.stringify(this._user.wishArray));
        localStorage.setItem('cart', JSON.stringify([item._id]));
      }
    }
  }
  goBack() {
    this.nav.navigateRoot(['/tabs/tab2'], {
      queryParams: { isReload: 'true' },
    });
  }
  onClickProductDetails(index: number) {
    if (!this.isDisabled) {
      // this.nav.navigateForward(['/product-details'], {
      //   queryParams: { _id: this.productDetails[index]._id },
      // });
      this.nav.navigateRoot(['/product-details'], {
        queryParams: { _id: this.wishArray[index]._id },
      });
    }
  }
}
