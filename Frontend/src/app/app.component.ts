/* eslint-disable no-underscore-dangle */
import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { AnimationOptions } from '@ionic/angular/providers/nav-controller';
import { GlobalService } from './service/global.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private lastBack = Date.now();
  private previousUrl: string = undefined;
  private currentUrl: string = undefined;
  constructor(
    public platform: Platform,
    private _global: GlobalService,
    private _router: Router,
    private nav: NavController,
    private zone: NgZone
  ) {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
        _global.previousUrl = this.previousUrl;
        _global.currentUrl = this.currentUrl;
        console.log(this.previousUrl, this.currentUrl);
      }
    });
    console.log(JSON.stringify(this._global.navigateRoute));
  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.platform.ready().then(() => {
      this.backbuttonSubscribeMethod();
    });
  }
  backbuttonSubscribeMethod() {
    this.platform.backButton.subscribe(() => {
      // logic for double tap: delay of 500ms between two clicks of back button
      console.log('App Component');
      if (
        Date.now() - this.lastBack < 500 &&
        (this.currentUrl === '/tabs/tab2' || this.currentUrl === '/')
      ) {
        (navigator as any).app.exitApp();
      } else if (this.currentUrl !== '/tabs/tab2' && this.currentUrl !== '/') {
        // this._global.goBackToBackward();
        this.zone.run(() => {});
        const animations: AnimationOptions = {
          animated: true,
          animationDirection: 'back',
        };
        this.nav.back(animations);
      } else {
        this._global.toasterValue('Double Click to Exit DailyKart');
      }
      this.lastBack = Date.now();
    });
  }
}
