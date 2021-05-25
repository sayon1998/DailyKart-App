import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SharedModule } from 'src/shared/shared.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CanDeactivateTab } from './guard/deactive.guard';
import * as firebase from '@angular/fire';
import { environment } from '../environments/environment';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    firebase.AngularFireModule.initializeApp({
      apiKey: 'AIzaSyDtAUt8OGlhJvlAsdt5a0Bfwt6GzJph8IQ',
      authDomain: 'dailykart-57abc.firebaseapp.com',
      projectId: 'dailykart-57abc',
      storageBucket: 'dailykart-57abc.appspot.com',
      messagingSenderId: '609237155387',
      appId: '1:609237155387:web:1b69b082e5b093a045661e',
      measurementId: 'G-R9BBZWBBS7',
    }),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    CanDeactivateTab,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
