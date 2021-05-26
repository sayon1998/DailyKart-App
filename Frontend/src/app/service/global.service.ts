/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable object-shorthand */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { environment } from 'src/environments/environment';
const { Geolocation } = Plugins;

@Injectable()
export class GlobalService {
  passwordType = 'password';
  passwordIcon = 'eye-off';
  passwordType2 = 'password';
  passwordIcon2 = 'eye-off';
  public apiURL = environment.apiUrl;
  public latitude: number;
  public longitude: number;
  constructor(
    private toaster: ToastController,
    public alertController: AlertController,
    private _http: HttpClient
  ) {}
  async onClickLocation() {
    // http://api.geonames.org/findNearbyPostalCodesJSON?lat=23.0057344&lng=88.4865504&username=sayon

    await Geolocation.getCurrentPosition({
      timeout: 1000,
      enableHighAccuracy: true,
    })
      .then((res) => {
        console.log(res);
        // alert('lat: ' + res.coords.latitude + ' long:' + res.coords.longitude);
        this.latitude = res.coords.latitude;
        this.longitude = res.coords.longitude;
      })
      .catch((err) => {
        console.log(err.message);
      });
  }
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
  get(url: string, params = '') {
    if (params) {
      return this._http.get(this.apiURL + url + params);
    }
    return this._http.get(this.apiURL + url);
  }

  getip(url: string) {
    return this._http.get(url);
  }

  post(url: string, data: any) {
    console.log(this.apiURL, url, data);
    return this._http.post(this.apiURL + url, data);
  }

  delete(url: string, data: any) {
    return this._http.delete(this.apiURL + url, data);
  }

  put(url: string, data: any) {
    return this._http.put(this.apiURL + url, data);
  }
}
