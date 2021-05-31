/* eslint-disable no-underscore-dangle */
/* eslint-disable object-shorthand */
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root',
})
export class AddressService {
  public addressArray: any[] = [];
  constructor(private _auth: AuthService) {}
  getUserAddress() {
    if (this._auth.isLogin()) {
      if (typeof localStorage.getItem('user-details') !== 'object') {
        this.addressArray.push({
          address:
            JSON.parse(localStorage.getItem('user-details')).address +
            ' ,pin-' +
            JSON.parse(localStorage.getItem('user-details')).pin,
        });
      }
    } else {
    }
  }
}
