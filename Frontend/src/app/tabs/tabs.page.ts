/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { filter } from 'rxjs/internal/operators/filter';
import { AuthService } from '../service/auth.service';
import { GlobalService } from '../service/global.service';
import { UserDetailService } from '../service/user-details.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage implements OnInit {
  tabArray: any[] = [
    {
      title: 'Category',
      link: 'tab1',
      icon: 'apps-outline',
      fotter: 'Categories',
    },
    { title: 'DailyKart', link: 'tab2', icon: 'home', fotter: 'Home' },
    {
      title: 'My Account',
      link: 'tab3',
      icon: 'person-circle-outline',
      fotter: 'Account',
    },
  ];
  public headerTitle = '';
  constructor(
    public nav: NavController,
    public _router: Router,
    private _activatedRoute: ActivatedRoute,
    public _user: UserDetailService,
    public _global: GlobalService,
    public _auth: AuthService
  ) {
    _router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((params) => {
        _router.navigated = false;
        const current_url = _router.url
          .split('?')[0]
          .slice(_router.url.split('?')[0].lastIndexOf('/') + 1);
        if (this.tabArray.findIndex((x) => x.link === current_url) !== -1) {
          this.headerTitle =
            this.tabArray[
              this.tabArray.findIndex((x) => x.link === current_url)
            ].title;
        }
      });
  }
  ngOnInit() {
    this.checkCartList();
  }
  // Check Wishlist & Cart
  checkCartList() {
    if (this._auth.isLogin()) {
      this._global
        .get(
          'product/get-cart-wishlist/',
          `${localStorage.getItem('userId')}/cart`
        )
        .subscribe(
          (resData: any) => {
            if (resData.status) {
              if (resData.data) {
                this._user.cartArray = resData.data.cart;
                if (
                  typeof localStorage.getItem('cart') !== 'object' ||
                  typeof localStorage.getItem('wishList') !== 'object'
                ) {
                  const param = {
                    userId: localStorage.getItem('userId'),
                    cart:
                      typeof localStorage.getItem('cart') !== 'object'
                        ? JSON.parse(localStorage.getItem('cart'))
                        : [],
                    wishlist:
                      typeof localStorage.getItem('wishList') !== 'object'
                        ? JSON.parse(localStorage.getItem('wishList'))
                        : [],
                  };
                  console.log(param);
                  this._global
                    .post('product/save-cart-wishlist', param)
                    .subscribe(
                      (res: any) => {
                        if (resData.status) {
                          if (resData.data) {
                            this._user.cartArray = res.data.cart;
                            // this._user.wishArray = [];
                            this._user.wishArray = res.data.wishlist;
                            // this._global.toasterValue(res.message, 'Success');
                          }
                        }
                      },
                      (err) => {
                        // this._global.toasterValue(err.message, 'Error');
                      }
                    );
                }
              }
            } else {
              this._global.toasterValue(resData.message, 'Error');
            }
          },
          (err) => {
            this._global.toasterValue(err.message, 'Error');
          }
        );
    } else {
      if (
        localStorage.getItem('cart') &&
        typeof localStorage.getItem('cart') !== 'object'
      ) {
        this._user.cartArray = JSON.parse(localStorage.getItem('cart'));
      }
    }
  }
  onClickRoute(index: any) {
    // this.nav.navigateRoot([`/tabs/${this.tabArray[index].link}`]);
    this.nav.navigateForward([`/tabs/${this.tabArray[index].link}`]);
  }
}
