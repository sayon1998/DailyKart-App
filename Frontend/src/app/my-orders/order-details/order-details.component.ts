/* eslint-disable max-len */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/service/auth.service';
import { GlobalService } from 'src/app/service/global.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnInit {
  public orderData: any[] = [];
  public address: any = {};
  public totalofferPercentage: any = '';
  public deliveryCharge = 0;
  public totalorderPrice: any;
  public totaloriginalPrice: any;
  public orderId: any;
  public statusValue = 0;
  public orderStatus = {
    isOrderDelivered: false,
    isOrderDispatched: false,
    isOrderOutForDelivery: false,
    isOrderPacked: false,
    isOrderPlaced: true,
    orderPlacedDate: '',
    orderDeliveredDate: '',
    orderDispatchedDate: '',
    orderOutForDeliveryDate: '',
    orderPackedDate: '',
  };
  public orderMessage = '';
  public isReturn = false;
  public isCancel = true;
  constructor(
    public _global: GlobalService,
    public _auth: AuthService,
    public nav: NavController,
    private alertController: AlertController,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params && params.orderId) {
        console.log(params.orderId);
        this.orderId = params.orderId;
        if (this._auth.isLogin()) {
          this.getOrderDetails();
        }
      }
    });

    console.log(this.orderData, this.address);
  }
  getOrderDetails() {
    this._global
      .get(
        `order/get-order-details/${
          localStorage.getItem('userId') + '/' + this.orderId
        }`
      )
      .subscribe((resData: any) => {
        console.log(resData);
        if (resData.status) {
          if (resData.data) {
            this.address = resData.data.addressDetail;
            this.orderData = resData.data.orderDetail;
            this.totalofferPercentage = resData.data.totalofferPercentage;
            this.totalorderPrice = resData.data.totalorderPrice;
            this.totaloriginalPrice = resData.data.totaloriginalPrice;
            this.deliveryCharge = resData.data.deliveryCharge;
            this.orderStatus.isOrderDelivered = resData.data.isOrderDelivered;
            this.orderStatus.isOrderDispatched = resData.data.isOrderDispatched;
            this.orderStatus.isOrderOutForDelivery =
              resData.data.isOrderOutForDelivery;
            this.orderStatus.isOrderPacked = resData.data.isOrderPacked;
            this.orderStatus.isOrderPlaced = resData.data.isOrderPlaced;
            this.orderStatus.orderPlacedDate =
              resData.data.orderDetail[0].orderTime;
            this.orderStatus.orderDeliveredDate =
              resData.data.orderDeliveredDate;
            this.orderStatus.orderDispatchedDate =
              resData.data.orderDispatchedDate;
            this.orderStatus.orderOutForDeliveryDate =
              resData.data.orderOutForDeliveryDate;
            this.orderStatus.orderPackedDate = resData.data.orderPackedDate;
            this.orderMessage = `---- Order Placed ----<br>Date: ${this.orderStatus.orderPlacedDate}`;
            if (
              this.orderStatus.isOrderPlaced &&
              this.orderStatus.isOrderPacked &&
              !this.orderStatus.isOrderDispatched &&
              !this.orderStatus.isOrderOutForDelivery &&
              !this.orderStatus.isOrderDelivered
            ) {
              // Order Packed
              this.statusValue = 0;
              this.orderMessage = `---- Order Placed ----<br>Date: ${this.orderStatus.orderPlacedDate}<br>---- Order is Packed ----<br>Date: ${this.orderStatus.orderPackedDate}`;
            } else if (
              this.orderStatus.isOrderPlaced &&
              this.orderStatus.isOrderPacked &&
              this.orderStatus.isOrderDispatched &&
              !this.orderStatus.isOrderOutForDelivery
            ) {
              // Order dispatched
              this.statusValue = 35;
              this.orderMessage = `---- Order Placed ----<br>Date: ${this.orderStatus.orderPlacedDate}<br>---- Order is Packed ----<br>Date: ${this.orderStatus.orderPackedDate}<br>---- Order Dispatched ----<br>Date: ${this.orderStatus.orderDispatchedDate}`;
            } else if (
              this.orderStatus.isOrderPlaced &&
              this.orderStatus.isOrderDispatched &&
              this.orderStatus.isOrderPacked &&
              this.orderStatus.isOrderOutForDelivery &&
              !this.orderStatus.isOrderDelivered
            ) {
              // Order Out for Delivery
              this.statusValue = 65;
              this.isCancel = false;
              this.orderMessage = `---- Order Placed ----<br>Date: ${this.orderStatus.orderPlacedDate}<br>---- Order is Packed ----<br>Date: ${this.orderStatus.orderPackedDate}<br>---- Order Dispatched ----<br>Date: ${this.orderStatus.orderDispatchedDate}<br>---- Out for Delivery ----<br>Date: ${this.orderStatus.orderOutForDeliveryDate}`;
            } else if (
              this.orderStatus.isOrderPlaced &&
              this.orderStatus.isOrderPacked &&
              this.orderStatus.isOrderOutForDelivery &&
              this.orderStatus.isOrderDispatched &&
              this.orderStatus.isOrderDelivered
            ) {
              // Order Delivered
              this.statusValue = 100;
              this.isReturn = true;
              this.isCancel = false;
              this.orderMessage = `---- Order Placed ----<br>Date: ${this.orderStatus.orderPlacedDate}<br>---- Order is Packed ----<br>Date: ${this.orderStatus.orderPackedDate}<br>---- Order Dispatched ----<br>Date: ${this.orderStatus.orderDispatchedDate}<br>---- Out for Delivery ----<br>Date: ${this.orderStatus.orderOutForDeliveryDate}<br>---- Delivered ----<br>Date: ${this.orderStatus.orderDeliveredDate}`;
            }
            document.getElementById('myinput').style.background =
              'linear-gradient(to right, #53e436 0%, #53e436 ' +
              this.statusValue +
              '%, #fff ' +
              this.statusValue +
              '%, white 100%)';
          }
        }
      });
  }
  logRatingChange(event: any) {
    console.log(event);
  }
  async onClickSeeDetails() {
    const alert = await this.alertController.create({
      header: 'Tracking Details',
      mode: 'md',
      message: this.orderMessage,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.alertController.dismiss();
            console.log('Confirm Cancel');
          },
        },
      ],
    });
    await alert.present();
  }
}
