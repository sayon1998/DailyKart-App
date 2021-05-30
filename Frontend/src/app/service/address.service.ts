/* eslint-disable no-underscore-dangle */
/* eslint-disable object-shorthand */
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
@Injectable()
export class AddressService {
  prefferedAddress: any;
  public addressArray: any[] = [
    {
      _id: '1',
      address: 'Madanpur, Kalyannagar Nadia ,pin-741245',
      pin: 741245,
      city: 'Madanpur',
      district: 'Nadia',
      state: 'WB',
      preferred: true,
    },
    {
      _id: '2',
      address: 'Kalyannagar Primary School',
      pin: 741245,
      city: 'Madanpur',
      district: 'Nadia',
      state: 'WB',
      preferred: true,
    },
    {
      _id: '3',
      address: 'Madanpur,Majdia Atheletic Club',
      pin: 741245,
      city: 'Madanpur',
      district: 'Nadia',
      state: 'WB',
      preferred: true,
    },
  ];
  constructor(private _auth: AuthService) {
    this.prefferedAddress = this.addressArray[0]._id;
  }
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
