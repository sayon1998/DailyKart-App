/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { filter } from 'rxjs/internal/operators/filter';
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
    public _user: UserDetailService
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
  ngOnInit() {}
  onClickRoute(index: any) {
    // this.nav.navigateRoot([`/tabs/${this.tabArray[index].link}`]);
    this.nav.navigateForward([`/tabs/${this.tabArray[index].link}`]);
  }
}
