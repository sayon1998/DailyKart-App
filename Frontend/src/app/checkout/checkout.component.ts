/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, NavController, Platform } from '@ionic/angular';
import { AuthService } from '../service/auth.service';
import { GlobalService } from '../service/global.service';
import { UserDetailService } from '../service/user-details.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  public paymentArray: any[] = [
    { paymentname: 'COD', isAvailable: true },
    { paymentname: 'Online', isAvailable: false },
  ];
  public paymentMode: any = 'COD';
  public paymentFlag = false;
  constructor(
    public _user: UserDetailService,
    public _router: Router,
    public platform: Platform,
    public nav: NavController,
    public _global: GlobalService,
    public _auth: AuthService,
    public loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    if (
      this._user.checkOutArray &&
      this._user.checkOutArray.productDetails &&
      this._user.checkOutArray.productDetails.length < 1
    ) {
      this.nav.navigateRoot(['/cart']);
    }
  }
  async onClickPayment() {
    console.log(this.paymentMode, this.paymentFlag);
    if (this._auth.isLogin()) {
      if (this.paymentMode === 'COD') {
        await this._global.startLoading();
        this._global
          .post('order/save-orders', this._user.checkOutArray)
          .subscribe(
            (resData: any) => {
              console.log(resData);
              if (resData.status) {
                if (resData.data) {
                  this._global.loadingController.dismiss();
                  this.paymentFlag = true;
                } else {
                  this._global.loadingController.dismiss();
                  this._global.toasterValue(resData.message, 'Error');
                }
              } else {
                this._global.loadingController.dismiss();
                this._global.toasterValue(resData.message, 'Error');
              }
            },
            (err) => {
              this._global.loadingController.dismiss();
              this._global.toasterValue(err.message, 'Error');
            }
          );
      }
    } else {
      this.nav.navigateRoot(['/login']);
    }
  }
  goToNavigate(type: string) {
    this._user.checkOutArray.productDetails.forEach((element) => {
      this._user.cartArray.splice(
        this._user.cartArray.findIndex((x) => x._id === element._id),
        1
      );
    });
    localStorage.removeItem('cart');
    localStorage.setItem('cart', JSON.stringify(this._user.cartArray));
    this.nav.navigateRoot([type]);
  }
}
