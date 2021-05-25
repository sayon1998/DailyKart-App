/* eslint-disable object-shorthand */
import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable()
export class GlobalService {
  passwordType = 'password';
  passwordIcon = 'eye-off';
  passwordType2 = 'password';
  passwordIcon2 = 'eye-off';
  constructor(
    private toaster: ToastController,
    public alertController: AlertController
  ) {}
  async toasterValue(msg: string, type: string = '', duration: number = 2000) {
    const toast = await this.toaster.create({
      message: msg,
      duration: duration,
      buttons: [
        {
          text: type === '' ? 'Done' : type,
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    toast.present();
  }
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm!',
      message: 'Message <strong>text</strong>!!!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          },
        },
        {
          text: 'Okay',
          handler: () => {
            console.log('Confirm Okay');
          },
        },
      ],
    });

    await alert.present();
  }
  hideShowPassword(second = '') {
    if (second === '') {
      this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
      this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
    } else {
      this.passwordType2 = this.passwordType2 === 'text' ? 'password' : 'text';
      this.passwordIcon2 = this.passwordIcon2 === 'eye-off' ? 'eye' : 'eye-off';
    }
  }
}
