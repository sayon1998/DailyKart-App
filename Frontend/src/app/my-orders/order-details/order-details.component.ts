/* eslint-disable max-len */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
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
  public address: any[] = [];
  public totalofferPercentage: any = '';
  public totalorderPrice: any;
  public totaloriginalPrice: any;
  public orderId: any;
  constructor(
    public _global: GlobalService,
    public _auth: AuthService,
    public nav: NavController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this._global.order.subscribe((res: any) => {
      if (res.orderDetail) {
        this.orderData = res.orderDetail;
      }
      if (res.addressDetail) {
        this.address = res.addressDetail;
      }
      if (
        res.totalofferPercentage &&
        res.totalorderPrice &&
        res.totaloriginalPrice &&
        res.orderId
      ) {
        this.totalofferPercentage = res.totalofferPercentage;
        this.totalorderPrice = res.totalorderPrice;
        this.totaloriginalPrice = res.totaloriginalPrice;
        this.orderId = res.orderId;
      }
    });
    const value = 50;
    document.getElementById('myinput').style.background =
      'linear-gradient(to right, #53e436 0%, #53e436 ' +
      value +
      '%, #fff ' +
      value +
      '%, white 100%)';

    console.log(this.orderData, this.address);
  }
  logRatingChange(event: any) {
    console.log(event);
  }
  async onClickSeeDetails() {
    const alert = await this.alertController.create({
      header: 'Tracking Details',
      mode: 'md',
      message:
        '---- Order Placed ----<br/> Jun 5,2021 (10:30 a.m) <br/>---- Order is Packed ----<br/> Jun 5,2021 (10:30 a.m) <br/>---- Order Dispatched ----<br/> Jun 5,2021 (10:30 a.m) <br/>---- Out for Delivery ----<br/> Jun 6,2021 (10:30 a.m)<br/>---- Delivered ----<br/> Jun 6,2021 (10:30 a.m)',
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
