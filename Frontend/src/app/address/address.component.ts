/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import {
  AnimationController,
  IonRouterOutlet,
  ModalController,
  NavController,
  Platform,
} from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { DynamicModelComponent } from '../Model/dynamic-model/dynamic-model.component';
import { AddressService } from '../service/address.service';
import { AuthService } from '../service/auth.service';
import { GlobalService } from '../service/global.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css'],
})
export class AddressComponent implements OnInit {
  public address: any[] = [];
  public isLoading = true;
  constructor(
    public nav: NavController,
    public _global: GlobalService,
    public _auth: AuthService,
    public _address: AddressService,
    public actionSheetController: ActionSheetController,
    public modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private platform: Platform,
    public animationCtrl: AnimationController
  ) {
    console.log('address');
  }

  ngOnInit(): void {
    this.platform.ready().then(() => {
      this.backbuttonSubscribeMethod();
    });
    console.log(this.address);
    if (this._auth.isLogin()) {
      this.getAllAddressess();
    } else {
      this.isLoading = false;
    }
  }
  backbuttonSubscribeMethod() {
    this.platform.backButton.subscribe(async () => {
      await this.modalController.dismiss();
      this.nav.navigateRoot([this._global.previousUrl]);
    });
  }
  getAllAddressess() {
    this._global
      .get('address/get-all-address/', localStorage.getItem('userId'))
      .subscribe(
        (resData: any) => {
          if (resData.status) {
            if (resData.data) {
              this.address = resData.data;
              this.isLoading = false;
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
  }
  async presentActionSheet(index: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Address Preference',
      cssClass: 'my-custom-class',
      backdropDismiss: false,
      keyboardClose: true,
      mode: 'md',
      buttons: [
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => {
            this.presentModal('Edit your address', this.address[index]);
            console.log('Share clicked');
          },
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            console.log('Delete clicked');
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
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
