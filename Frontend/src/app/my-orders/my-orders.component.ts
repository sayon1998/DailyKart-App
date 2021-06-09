/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AuthService } from '../service/auth.service';
import { GlobalService } from '../service/global.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss'],
})
export class MyOrdersComponent implements OnInit {
  public orderDetail: any[] = [];
  public isLoading = true;
  constructor(
    public nav: NavController,
    public _global: GlobalService,
    public _auth: AuthService
  ) {}

  ngOnInit(): void {
    this.getOrderDetails();
  }
  getOrderDetails() {
    if (this._auth.isLogin()) {
      this._global
        .get('order/get-order-details/', localStorage.getItem('userId'))
        .subscribe(
          (resData: any) => {
            if (resData.status) {
              if (resData.data && resData.data.length > 0) {
                this.orderDetail = resData.data;
                this.isLoading = false;
                console.log(this.orderDetail);
              } else {
                this.isLoading = false;
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
    } else {
      this.isLoading = false;
    }
  }
  logRatingChange(event: any, orderData: any) {
    const param = {
      productId: orderData._id,
      userId: localStorage.getItem('userId'),
      rate: String(event),
    };
    this._global
      .post('product/rate-product', param)
      .subscribe((resData: any) => {
        console.log(resData);
        if (resData.status) {
          this._global.toasterValue(resData.message, 'Success');
        } else {
          this._global.toasterValue(resData.message, 'Error');
        }
      });
  }
  onClickOrderDetails(index: number) {
    console.log(this.orderDetail[index].orderId);
    // this._global.order.next(this.orderDetail[index]);
    this.nav.navigateRoot([
      'my-order/order-detail',
      {
        queryParams: { orderId: this.orderDetail[index].orderId },
      },
    ]);
  }
}
