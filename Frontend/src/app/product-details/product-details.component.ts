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
  @ViewChild(IonContent) content: IonContent;
  backToTop = false;
  public inCartFlag = false;
  public productDetails: any;
  constructor(
    public _router: Router,
    public nav: NavController,
    public _product: ProductService,
    public _address: AddressService,
    private route: ActivatedRoute,
    private _global: GlobalService,
    public _user: UserDetailService,
    public _prvUrl: PreviousRouteService,
    public platform: Platform
  ) {
    console.log('product-detail');
    this.route.queryParams.subscribe((params) => {
      console.log(_product.products);
      this.getDetailsById(params._id);
      this._product.checkLocalWishlist();
      _address.getUserAddress();
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
      this._user.cartArray.findIndex(
        (x) => x._id === this.productDetails._id
      ) === -1
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

  ionViewWillEnter() {}

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
  async onClickLocation() {
    // http://api.geonames.org/findNearbyPostalCodesJSON?lat=23.0057344&lng=88.4865504&username=sayon

    await Geolocation.getCurrentPosition({
      timeout: 1000,
      enableHighAccuracy: true,
    })
      .then((res) => {
        console.log(res);
        alert('lat: ' + res.coords.latitude + ' long:' + res.coords.longitude);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }
  onClickCart() {
    if (!this.inCartFlag) {
      if (
        this._user.cartArray.findIndex(
          (x) => x._id === this.productDetails._id
        ) === -1
      ) {
        this._user.onClickCart(this.productDetails);
      } else {
        // Navigate to Cart page
        this._router.navigate(['/cart']);
      }
      this.inCart();
    } else {
      // Navigate to Cart Page
      this._router.navigate(['/cart']);
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
