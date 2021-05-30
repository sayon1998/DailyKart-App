/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable guard-for-in */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Capacitor, Plugins } from '@capacitor/core';
import { IonContent, NavController, Platform } from '@ionic/angular';
const { Geolocation } = Plugins;
import { SheetState } from 'ion-bottom-sheet';
import { AddressService } from '../service/address.service';
import { AuthService } from '../service/auth.service';
import { GlobalService } from '../service/global.service';
import { PreviousRouteService } from '../service/previou-state.service';
import { ProductService } from '../service/product-details.service';
import { UserDetailService } from '../service/user-details.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  providers: [AddressService],
})
export class ProductDetailsComponent implements OnInit {
  slideOpts = {
    initialSlide: 0,
    speed: 400,
  };
  openDrawerFlag = false;
  index: number;
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
  productID = '';
  addressFlag = true;
  @ViewChild(IonContent) content: IonContent;
  backToTop = false;
  public inCartFlag = false;
  public productDetails: any;
  public pincode: any;
  public cLocationFLag = false;
  public isDisabled = false;
  constructor(
    public _router: Router,
    public nav: NavController,
    public _product: ProductService,
    public _address: AddressService,
    private route: ActivatedRoute,
    private _global: GlobalService,
    private _auth: AuthService,
    public _user: UserDetailService,
    public _prvUrl: PreviousRouteService,
    public platform: Platform
  ) {
    console.log('product-detail');
  }
  ionViewWillEnter() {
    console.log('********ionViewWillEnter_product-details**********');
    this.route.queryParams.subscribe((params) => {
      // _global.goBackToForoward();
      if (params && params._id) {
        this.getDetailsById(params._id);
        this._address.getUserAddress();
        this.productID = params._id;
      } else {
        this.nav.back();
      }
    });
  }
  ngOnInit(): void {
    console.log('product-detail ngOnInit');
  }
  getDetailsById(_id: any) {
    this._global.get('product/productbyid/', _id).subscribe(
      (resData: any) => {
        if (resData.status) {
          if (resData.data) {
            this.productDetails = resData.data;
            if (this._auth.isLogin()) {
              this.checkKart();
              this.checkWishList();
            } else {
              this.checkLocalWishlist(this.productDetails);
              this.inCart();
            }
          }
        } else {
          this._global.toasterValue(resData.message, 'Error');
        }
      },
      (err) => {
        this._global.toasterValue(err.message, 'Error');
      }
    );
  }
  //Check Wish-list
  checkLocalWishlist(item: any) {
    if (!this._auth.isLogin()) {
      if (typeof localStorage.getItem('wishList') !== 'object') {
        let localArray: any[] = [];
        localArray = JSON.parse(localStorage.getItem('wishList'));
        if (localArray && localArray.length > 0) {
          console.log(item.length);
          if (item && item.length !== undefined) {
            item.forEach((e: any) => {
              if (localArray.findIndex((x) => x === e._id) > -1) {
                e.icon = 'heart';
                // document.getElementById(
                //   `${item.findIndex((x) => x._id === e._id)}`
                // ).style.color = 'red';
              } else if (
                localArray.findIndex((x) => x === e._id) === -1 &&
                e.icon === 'heart'
              ) {
                e.icon = 'heart-outline';
              }
            });
          } else {
            if (localArray.findIndex((x) => x === item._id) > -1) {
              item.icon = 'heart';
              // document.getElementById(
              //   `${item.findIndex((x) => x._id === e._id)}`
              // ).style.color = 'red';
            } else if (
              localArray.findIndex((x) => x === item._id) === -1 &&
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
    } else {
      if (this._user.wishArray && this._user.wishArray.length > 0) {
        if (this._user.wishArray.findIndex((x) => x === item._id) > -1) {
          item.icon = 'heart';
        }
      }
    }
  }
  // Check Cart Details
  checkKart() {
    this._global
      .get(
        'product/get-cart-wishlist/',
        `${localStorage.getItem('userId')}/cart`
      )
      .subscribe(
        (resData: any) => {
          if (resData.status) {
            if (resData.data) {
              this._user.cartArray = resData.data.cart;
              this.inCart();
            }
          } else {
            this._global.toasterValue(resData.message, 'Error');
          }
        },
        (err) => {
          this._global.toasterValue(err.message, 'Error');
        }
      );
  }
  // Is this Available in Cart
  inCart() {
    console.log(this._user.cartArray);
    if (
      this._user.cartArray &&
      this._user.cartArray.findIndex((x) => x === this.productDetails._id) ===
        -1
    ) {
      this.inCartFlag = false;
    } else {
      this.inCartFlag = true;
    }
  }
  gotToTop() {
    this.content.scrollToTop(1000);
  }
  getScrollPos(pos: any) {
    if (pos.detail.scrollTop > this.platform.height()) {
      this.backToTop = true;
    } else {
      this.backToTop = false;
    }
  }

  onClickAddress(type: any) {
    // this.nav.navigateRoot(['/product-details/address'], {
    //   queryParams: {
    //     _id: this.productDetails._id,
    //     index: this.index,
    //   },
    // });
    this.openDrawerFlag = true;
    this.title = 'Address';
    if (type === 'add') {
      this.title = 'Add' + ' ' + this.title;
    } else if (type === 'change') {
      this.title = 'Change Your' + ' ' + this.title;
    }

    this.sheetState = SheetState.Docked;
  }
  async onClickLocation(type: string = '', pin: any = '') {
    // http://api.geonames.org/findNearbyPostalCodesJSON?lat=23.0057344&lng=88.4865504&username=sayon
    if (type === '') {
      this.cLocationFLag = true;
      await Geolocation.getCurrentPosition({
        timeout: 1000,
        enableHighAccuracy: true,
      })
        .then((res) => {
          console.log(
            'lat: ' + res.coords.latitude + ' long:' + res.coords.longitude
          );
          this._global
            .get(
              'address/get-current-location/',
              `${res.coords.latitude}/${res.coords.longitude}`
            )
            .subscribe(
              (resData: any) => {
                if (resData.status) {
                  if (resData.data) {
                    this._address.addressArray.push(resData.data);
                    this.pincode = resData.data.pin;
                    this._global
                      .get(
                        'address/address-deliveriable/',
                        `${this._address.addressArray[0].pin}/${this.productID}`
                      )
                      .subscribe((resAddres: any) => {
                        if (resAddres.status) {
                          this.addressFlag = true;
                          this.cLocationFLag = false;
                          this.sheetState = SheetState.Bottom;
                        } else {
                          this.addressFlag = false;
                          this.cLocationFLag = false;
                          this.sheetState = SheetState.Bottom;
                        }
                      });
                  }
                } else {
                  this.cLocationFLag = false;
                  this._global.toasterValue(
                    'Unable to get Current Location',
                    'Error'
                  );
                }
              },
              (err) => {
                this.cLocationFLag = false;
                this._global.toasterValue(err.message, 'Error');
              }
            );
        })
        .catch((err) => {
          this.cLocationFLag = false;
          console.log(err.message);
          this._global.toasterValue(err.message, 'Error');
        });
    } else if (type === 'pincode') {
      this.isDisabled = true;
      this._global
        .get('address/address-deliveriable/', `${pin}/${this.productID}`)
        .subscribe(
          (resAddres: any) => {
            if (resAddres.status) {
              this._address.addressArray.push({
                pin,
                address: pin,
              });
              this.pincode = pin;
              this.addressFlag = true;
              this.isDisabled = false;
              this.sheetState = SheetState.Bottom;
            } else {
              this._address.addressArray.push({
                pin,
                address: pin,
              });
              this.pincode = pin;
              this.addressFlag = false;
              this.isDisabled = false;
              this.sheetState = SheetState.Bottom;
            }
          },
          (err) => {
            this.isDisabled = false;
            this._global.toasterValue(err.message, 'Error');
          }
        );
    }
  }
  onClickNavigate() {
    if (!this.inCartFlag) {
      if (
        this._user.cartArray.findIndex(
          (x) => x._id === this.productDetails._id
        ) === -1
      ) {
        this.onClickCart(this.productDetails);
      } else {
        // Navigate to Cart page
        this.nav.navigateForward(['/cart']);
      }
      this.inCart();
    } else {
      // Navigate to Cart Page
      this.nav.navigateForward(['/cart']);
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
              this._user.cartArray = [];
              this._user.cartArray = resData.data.cart;
              this.inCart();
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
        this._user.cartArray &&
        this._user.cartArray.findIndex((x) => x === product._id) === -1
      ) {
        this._user.cartArray.push(product._id);
        localStorage.setItem('cart', JSON.stringify(this._user.cartArray));
        this._global.toasterValue(`${product.name} is added to cart`);
        this.inCart();
      } else {
        this._global.toasterValue(`${product.name} is already added to cart`);
      }
    }
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
              if (resData.data) {
                this._user.wishArray = resData.data.wishlist;
                this.checkLocalWishlist(this.productDetails);
              }
            } else {
              this._global.toasterValue(resData.message, 'Error');
            }
          },
          (err) => {
            this._global.toasterValue(err.message, 'Error');
          }
        );
    } else {
      if (
        localStorage.getItem('wishList') &&
        typeof localStorage.getItem('wishList') !== 'object'
      ) {
        this._user.wishArray = JSON.parse(localStorage.getItem('wishList'));
      }
    }
  }
  // Wish-list
  onClickWishList(item: any) {
    if (item.icon && item.icon === 'heart') {
      // document.getElementById(`${index}`).style.color = '';
      item.icon = 'heart-outline';
      if (!this._auth.isLogin()) {
        let localArray: any[] = [];
        localArray = JSON.parse(localStorage.getItem('wishList'));
        localArray.splice(
          localArray.findIndex((x) => x === item._id),
          1
        );
        localStorage.removeItem('wishList');
        if (localArray && localArray.length > 0) {
          localStorage.setItem('wishList', JSON.stringify(localArray));
        }
        this._global.toasterValue('Remove from Your local Wishlist');
      } else {
        // If User is Login then
        const param = {
          userId: localStorage.getItem('userId'),
          cart: [],
          wishlist: [item._id],
        };
        this._global.post('product/delete-cart-wishlist', param).subscribe(
          (resData: any) => {
            if (resData.status) {
              if (resData.data) {
                this._user.wishArray = [];
                this._user.wishArray = resData.data.wishlist;
                this.checkWishList();
                this._global.toasterValue(resData.message, 'Success');
              }
            }
          },
          (err) => {
            this._global.toasterValue(err.message, 'Error');
          }
        );
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
          localArray = localArray.concat(item._id);
          localStorage.removeItem('wishList');
          console.log(localArray);
          localStorage.setItem('wishList', JSON.stringify(localArray));
        } else {
          localStorage.setItem('wishList', JSON.stringify([item._id]));
        }
        this._global.toasterValue('Added to Your local Wishlist');
      } else {
        // If User is Login then
        const param = {
          userId: localStorage.getItem('userId'),
          cart: [],
          wishlist: [item._id],
        };
        this._global.post('product/save-cart-wishlist', param).subscribe(
          (resData: any) => {
            if (resData.status) {
              if (resData.data) {
                this._user.wishArray = [];
                this._user.wishArray = resData.data.wishlist;
                this.checkWishList();
                this._global.toasterValue(resData.message, 'Success');
              }
            }
          },
          (err) => {
            this._global.toasterValue(err.message, 'Error');
          }
        );
      }
    }
  }
  onClickBuyNow() {}
  ngOnDestroy(): void {
    console.log('Destroy Product-Details');
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    // this.platform.backButton.unsubscribe();
  }
}
