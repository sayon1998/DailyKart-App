/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private lastBack = Date.now();
  constructor(public platform: Platform) {}
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
      if (Date.now() - this.lastBack < 500) {
        (navigator as any).app.exitApp();
      }
      this.lastBack = Date.now();
    });
  }
}
