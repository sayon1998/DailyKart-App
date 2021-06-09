/* eslint-disable radix */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  AnimationController,
  IonRouterOutlet,
  ModalController,
  NavController,
  Platform,
} from '@ionic/angular';
import { SheetState } from 'ion-bottom-sheet';
import { DynamicModelComponent } from '../Model/dynamic-model/dynamic-model.component';
import { AddressService } from '../service/address.service';
import { AuthService } from '../service/auth.service';
import { GlobalService } from '../service/global.service';
import { ProductService } from '../service/product-details.service';
import { UserDetailService } from '../service/user-details.service';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.component.html',
  styleUrls: ['./my-cart.component.scss'],
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
  deliveryCharge = 0;
  selectAllFlag = true;
  cartFlag = true;
  isLoading = false;
  lastPin = '';
  public cartArray: any[] = [];
  public address: any[] = [];
  public spin = true;
  public totalDeliveryCharge = 0;
  public chargeAmount = 0;
  constructor(
    public _address: AddressService,
    public _user: UserDetailService,
    public _product: ProductService,
    public _global: GlobalService,
    public _auth: AuthService,
    public _router: Router,
    public nav: NavController,
    private route: ActivatedRoute,
    public modalController: ModalController,
    private platform: Platform,
    public animationCtrl: AnimationController,
    private routerOutlet: IonRouterOutlet,
    public alertController: AlertController
  ) {}

  ngOnInit(): void {
    // this._global.goBackToForoward();
    this.platform.ready().then(() => {
      this.backbuttonSubscribeMethod();
    });
    this.getDeliveryCharge();
  }
  getDeliveryCharge() {
    this._global.get('order/get-delivery-charge').subscribe((resData: any) => {
      if (resData.status) {
        if (resData.data) {
          this.totalDeliveryCharge = parseInt(resData.data.deliveryCharge);
          this.chargeAmount = parseInt(resData.data.chargeAmt);
          this.checkKart();
          this.getAllAddressess();
        } else {
          this.checkKart();
          this.getAllAddressess();
        }
      } else {
        this.checkKart();
        this.getAllAddressess();
      }
    });
  }
  backbuttonSubscribeMethod() {
    this.platform.backButton.subscribe(async () => {
      await this.modalController.dismiss();
      // this.nav.navigateRoot([this._global.previousUrl]);
    });
  }
  // Get Address Details
  getAllAddressess() {
    if (this._auth.isLogin()) {
      this._global
        .get('address/get-all-address/', localStorage.getItem('userId'))
        .subscribe(
          (resData: any) => {
            if (resData.status) {
              if (resData.data) {
                this.address = resData.data;
              }
            }
          },
          (err) => {
            this._global.toasterValue(err.message, 'Error');
          }
        );
    }
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
                resData.data[index].status = false;
                resData.data[index].message = '';
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
          this.cartFlag = false;
          this.spin = false;
          console.log(err.message);
          this._global.toasterValue(err.message);
        }
      );
    } else {
      this.cartFlag = false;
      this.spin = false;
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
          this.cartArray[index].orderqty *
          parseFloat(this.cartArray[index].originalprice);
        this.totalOfferPrice +=
          this.cartArray[index].orderqty *
          parseFloat(this.cartArray[index].price);
        if (this.cartArray[index].deliverycharge) {
          this.deliveryCharge += parseInt(this.cartArray[index].deliverycharge);
        }
      } else {
        this.selectAllFlag = false;
        this.totalPrice -=
          this.cartArray[index].orderqty *
          parseFloat(this.cartArray[index].originalprice);
        this.totalOfferPrice -=
          this.cartArray[index].orderqty *
          parseFloat(this.cartArray[index].price);
        this.deliveryCharge = 0;
        this.cartArray.forEach((x, i) => {
          if (x.isCheckout) {
            if (
              x.deliverycharge &&
              this.totalOfferPrice < this.totalDeliveryCharge &&
              i !== index
            ) {
              this.deliveryCharge += parseInt(x.deliverycharge);
            }
          }
        });
        console.log(this.deliveryCharge);
      }
    }
  }
  getPrice() {
    this.totalOfferPrice = 0;
    this.totalPrice = 0;
    this.deliveryCharge = 0;
    this.cartArray.forEach((x) => {
      if (x.isCheckout) {
        this.totalPrice += x.orderqty * parseFloat(x.originalprice);
        this.totalOfferPrice += x.orderqty * parseFloat(x.price);
        if (
          x.deliverycharge &&
          this.totalOfferPrice < this.totalDeliveryCharge
        ) {
          this.deliveryCharge += parseInt(x.deliverycharge);
        }
      }
    });
    if (this.totalOfferPrice >= this.totalDeliveryCharge) {
      this.deliveryCharge = 0;
    }
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
                this.getPrice();
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
      this.getPrice();
    }
  }
  async onClickDelete(item: any) {
    const alert = await this.alertController.create({
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
              param.cart.push(item._id);
              item.isSpin = true;
              this._global
                .post('product/delete-cart-wishlist', param)
                .subscribe(
                  (resData: any) => {
                    if (resData.status) {
                      if (resData.data) {
                        // localStorage.setItem('cart', JSON.stringify(resData.data.cart));
                        this.spin = true;
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
              this._user.cartArray.splice(
                this._user.cartArray.indexOf(item._id),
                1
              );
              localStorage.removeItem('cart');
              localStorage.setItem(
                'cart',
                JSON.stringify(this._user.cartArray)
              );
              this._global.toasterValue(
                `${item.name} is successfully deleted from your cart`,
                'Success'
              );
            }
            this.getPrice();
          },
        },
      ],
    });
    await alert.present();
  }
  async onClickBuyNow() {
    console.log(this.cartArray);
    if (this.totalPrice !== 0 && this.totalOfferPrice !== 0) {
      if (this._auth.isLogin()) {
        this._user.checkOutArray.productDetails = [];
        const param = {
          pin: this.address[0].pin.toString(),
          productId: [],
        };
        this.lastPin = this.address[0].pin.toString();
        this.cartArray.forEach((x) => {
          if (x.isCheckout) {
            this._user.checkOutArray.productDetails.push(x);
            param.productId.push(x._id);
          }
        });
        this._user.checkOutArray.deliveryCharge =
          this.totalOfferPrice < this.totalDeliveryCharge
            ? this.deliveryCharge + this.chargeAmount
            : this.deliveryCharge;
        this._user.checkOutArray.totalOriginalPrice =
          this.totalOfferPrice < this.totalDeliveryCharge
            ? this.totalPrice + this.deliveryCharge + this.chargeAmount
            : this.totalPrice + this.deliveryCharge;
        this._user.checkOutArray.totalOfferPrice =
          this.totalOfferPrice < this.totalDeliveryCharge
            ? this.totalOfferPrice + this.deliveryCharge + this.chargeAmount
            : this.totalOfferPrice + this.deliveryCharge;
        this._user.checkOutArray.totalOfferPercentage =
          (
            100 -
            (this._user.checkOutArray.totalOfferPrice /
              this._user.checkOutArray.totalOriginalPrice) *
              100
          ).toFixed(2) + '% Off';
        this._user.checkOutArray.deliveryaddress = this.address[0];
        this._user.checkOutArray.userId = localStorage.getItem('userId');
        console.log(this._user.checkOutArray);
        if (this.totalOfferPrice < this.totalDeliveryCharge) {
          const alert = await this.alertController.create({
            header: 'Delivery Charge',
            message: `You have to pay rs ${this._user.checkOutArray.deliveryCharge} extra `,
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
                text: 'Procced',
                handler: () => {
                  console.log('Confirm Ok');
                  this.isLoading = true;
                  this._global
                    .post('address/check-multiple-order-deliveriable', param)
                    .subscribe(
                      (resData: any) => {
                        if (resData.status) {
                          if (resData.data && resData.data.length > 0) {
                            console.log(resData.data);
                            this.isLoading = false;
                            let flag = true;
                            resData.data.forEach(
                              (element: any, index: number) => {
                                if (
                                  this.cartArray.findIndex(
                                    (x) => x._id === element.productId
                                  ) > -1
                                ) {
                                  if (element.status) {
                                    flag = false;
                                    this.cartArray[
                                      this.cartArray.findIndex(
                                        (x) => x._id === element.productId
                                      )
                                    ].status = element.status;
                                    this.cartArray[
                                      this.cartArray.findIndex(
                                        (x) => x._id === element.productId
                                      )
                                    ].message = element.message;
                                  }
                                }
                              }
                            );
                            if (flag) {
                              console.log(this._user.checkOutArray);
                              this.nav.navigateRoot(['/checkout']);
                            }
                          }
                        } else {
                          this.isLoading = false;
                          this._global.toasterValue(resData.message, 'Error');
                        }
                      },
                      (err) => {
                        this.isLoading = false;
                        this._global.toasterValue(err.message, 'Error');
                      }
                    );
                },
              },
            ],
          });
          await alert.present();
        } else {
          this.isLoading = true;
          this._global
            .post('address/check-multiple-order-deliveriable', param)
            .subscribe(
              (resData: any) => {
                if (resData.status) {
                  if (resData.data && resData.data.length > 0) {
                    console.log(resData.data);
                    this.isLoading = false;
                    let flag = true;
                    resData.data.forEach((element: any, index: number) => {
                      if (
                        this.cartArray.findIndex(
                          (x) => x._id === element.productId
                        ) > -1
                      ) {
                        if (element.status) {
                          flag = false;
                          this.cartArray[
                            this.cartArray.findIndex(
                              (x) => x._id === element.productId
                            )
                          ].status = element.status;
                          this.cartArray[
                            this.cartArray.findIndex(
                              (x) => x._id === element.productId
                            )
                          ].message = element.message;
                        }
                      }
                    });
                    if (flag) {
                      console.log(this._user.checkOutArray);
                      this.nav.navigateRoot(['/checkout']);
                    }
                  }
                } else {
                  this.isLoading = false;
                  this._global.toasterValue(resData.message, 'Error');
                }
              },
              (err) => {
                this.isLoading = false;
                this._global.toasterValue(err.message, 'Error');
              }
            );
        }
      } else {
        this.nav.navigateRoot(['/login']);
      }
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
      if (this._auth.isLogin()) {
        this.presentModal('Add your address', '');
      } else {
        this.nav.navigateRoot(['/login']);
      }
    } else if (type === 'change') {
      this.title = 'Change Your' + ' ' + this.title;
      this.sheetState = SheetState.Docked;
    }
  }

  onClickAddressChange(index: number) {
    const tempAdd = this.address[index];
    tempAdd.isRecentlyUsed = true;
    this.address.splice(index, 1);
    this.address.splice(0, 0, tempAdd);
    console.log(index, this.address);
    if (this.lastPin !== this.address[0].pin.toString()) {
      this.cartArray.forEach((element: any) => {
        element.status = false;
        element.message = '';
      });
    }
    this.sheetState = SheetState.Bottom;
  }
  async presentModal(type: string, data: any) {
    const enterAnimation = (baseEl: any) => {
      const backdropAnimation = this.animationCtrl
        .create()
        .addElement(baseEl.querySelector('ion-backdrop')!)
        .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

      const wrapperAnimation = this.animationCtrl
        .create()
        .addElement(baseEl.querySelector('.modal-wrapper')!)
        .keyframes([
          { offset: 0, opacity: '0', transform: 'scale(0)' },
          { offset: 1, opacity: '0.99', transform: 'scale(1)' },
        ]);

      return this.animationCtrl
        .create()
        .addElement(baseEl)
        .easing('ease-out')
        .duration(500)
        .addAnimation([backdropAnimation, wrapperAnimation]);
    };

    const leaveAnimation = (baseEl: any) =>
      enterAnimation(baseEl).direction('reverse');

    const modal = await this.modalController.create({
      component: DynamicModelComponent,
      enterAnimation,
      leaveAnimation,
      cssClass: 'my-custom-class',
      swipeToClose: true,
      animated: true,
      backdropDismiss: false,
      mode: 'md',
      keyboardClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        data,
        type,
      },
    });
    return await modal.present();
  }
}
