/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { GlobalService } from '../service/global.service';
import { UserDetailService } from '../service/user-details.service';

@Component({
  selector: 'app-my-wishlist',
  templateUrl: './my-wishlist.component.html',
  styleUrls: ['./my-wishlist.component.css'],
})
export class MyWishlistComponent implements OnInit {
  constructor(
    public nav: NavController,
    public _global: GlobalService,
    public _user: UserDetailService
  ) {}

  ngOnInit(): void {
    this._user.checkWishList();
  }
}
