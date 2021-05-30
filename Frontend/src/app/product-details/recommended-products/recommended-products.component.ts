/* eslint-disable radix */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/service/auth.service';
import { GlobalService } from 'src/app/service/global.service';
import { ProductService } from 'src/app/service/product-details.service';
import { UserDetailService } from 'src/app/service/user-details.service';

@Component({
  selector: 'app-recommended-products',
  templateUrl: './recommended-products.component.html',
  styleUrls: ['./recommended-products.component.scss'],
})
export class RecommendedProductsComponent implements OnInit {
  public lastKey = '0'; // Keep track of last product key
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  public productDetails: any[] = [];
  totalLimit = 0;
  constructor(
    public nav: NavController,
    private _auth: AuthService,
    public _global: GlobalService,
    public _product: ProductService,
    public _user: UserDetailService,
    private _router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {}
  // Navigate to Product Details page
  onClickProductDetails(index: number) {
    this.nav.navigateRoot(['/product-details'], {
      queryParams: { _id: this.productDetails[index]._id, index },
    });
    // this.nav.navigateRoot('/product-details', {
    //   queryParams: { _id: this.productDetails[index]._id, index },
    // });
  }
  ionViewWillEnter() {
    this.lastKey = '0';
    this.totalLimit = 0;
    this.productDetails = [];
    this.checkWishList();
  }
  //Get Products
  getProductDetails() {
    const param = {
      startIndex: this.lastKey,
      limit: '6',
    };
    console.log(param);
    this._global.post('product/products', param).subscribe(
      (resData: any) => {
        console.log(resData);
        if (resData.status) {
          if (resData.data) {
            this.lastKey = resData.data.startIndex;
            this.totalLimit = resData.data.totalLimit;
            this.productDetails = this.productDetails.concat(
              resData.data.productDetails
            );
            this.checkLocalWishlist(this.productDetails);
            // this._product.checkLocalWishlist(this.productDetails);
            console.log(this.productDetails);
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
  // Infinite Scroll
  loadData(event: any) {
    console.log('##### Infinite Scroll #####');
    setTimeout(() => {
      event.target.complete();
      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (parseInt(this.lastKey) > this.totalLimit) {
        this.infiniteScroll.disabled = true; // For Disable Infinte Scroll when last data load
      } else {
        this.getProductDetails();
      }
    }, 500);
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
        item.forEach((element: any) => {
          console.log(this._user.wishArray.findIndex((x) => x === element._id));
          if (this._user.wishArray.findIndex((x) => x === element._id) > -1) {
            element.icon = 'heart';
          }
        });
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
                this.getProductDetails();
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
      this.getProductDetails();
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
}
