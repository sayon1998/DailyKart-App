/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
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
    public nav: NavController
  ) {}

  ngOnInit(): void {
    if (
      this._user.checkOutArray &&
      this._user.checkOutArray.productDetails &&
      this._user.checkOutArray.productDetails.length < 1
    ) {
      // this._router.navigate(['/cart']);
    }
  }
  onClickPayment() {
    console.log(this.paymentMode, this.paymentFlag);
    this.paymentFlag = true;
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
