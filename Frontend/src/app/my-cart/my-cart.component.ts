/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
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
  providers: [AddressService, ProductService],
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
    if (this._user.cartArray && this._user.cartArray.length > 0) {
      this.cartFlag = false;
    }
    this.getPrice();
    this.selectAll(false, 'selectAll');
  }
  selectAll(value: boolean, type: string, index: number = null) {
    if (type === 'selectAll') {
      if (!value) {
        this._user.cartArray.forEach((x) => {
          if (!x.isCheckout) {
            x.isCheckout = true;
          }
        });
      } else {
        this._user.cartArray.forEach((x) => {
          if (x.isCheckout) {
            x.isCheckout = false;
          }
        });
      }
      this.getPrice();
    } else if (type === 'select') {
      let flag = false;
      if (value) {
        for (let i = 0; i < this._user.cartArray.length; i++) {
          if (index !== i && !this._user.cartArray[i].isCheckout) {
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
          this._user.cartArray[index].quantity *
          parseFloat(this._user.cartArray[index].originalprice.split('₹')[1]);
        this.totalOfferPrice +=
          this._user.cartArray[index].quantity *
          parseFloat(this._user.cartArray[index].price.split('₹')[1]);
      } else {
        this.selectAllFlag = false;
        this.totalPrice -=
          this._user.cartArray[index].quantity *
          parseFloat(this._user.cartArray[index].originalprice.split('₹')[1]);
        this.totalOfferPrice -=
          this._user.cartArray[index].quantity *
          parseFloat(this._user.cartArray[index].price.split('₹')[1]);
      }
    }
  }

  getPrice() {
    this.totalOfferPrice = 0;
    this.totalPrice = 0;
    this._user.cartArray.forEach((x) => {
      if (x.isCheckout) {
        this.totalPrice +=
          x.quantity * parseFloat(x.originalprice.split('₹')[1]);
        this.totalOfferPrice += x.quantity * parseFloat(x.price.split('₹')[1]);
      }
    });
  }
  onClickBuyNow() {
    console.log(this._user.cartArray);
    if (this.totalPrice !== 0 && this.totalOfferPrice !== 0) {
      this._user.checkOutArray.productDetails = [];
      this._user.cartArray.forEach((x) => {
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
      this._router.navigate(['/checkout']);
      // if (this._auth.isLogin()) {
      // } else {
      //   this._router.navigate(['/login']);
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
