import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page {
  name = '';
  phoneNumber = '';
  menuBar: any[] = [
    {
      _id: '1',
      name: 'My Orders',
      link: '',
      icon: 'file-tray-full',
    },
    {
      _id: '2',
      name: 'My Cart',
      link: '',
      icon: 'cart',
    },
    {
      _id: '3',
      name: 'My Wishlist',
      link: '',
      icon: 'heart',
    },
    {
      _id: '4',
      name: 'Account Details',
      link: '',
      icon: 'accessibility',
    },
    {
      _id: '5',
      name: 'My Addresses',
      link: '',
      icon: 'map',
    },
    {
      _id: '6',
      name: 'My Cards',
      link: '',
      icon: 'card',
    },
    {
      _id: '7',
      name: 'Help Center',
      link: '',
      icon: 'chatbox-ellipses',
    },
  ];
  constructor(
    public _router: Router,
    public _auth: AuthService,
    public nav: NavController
  ) {
    console.log('tab3');
  }
  onlogOut() {
    localStorage.clear();
    this.name = '';
    this.phoneNumber = '';
  }
  onClick() {}
}
