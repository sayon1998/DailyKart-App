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
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpConfigInterceptor } from './service/http-interceptor';
import { DynamicModelComponent } from './Model/dynamic-model/dynamic-model.component';
@NgModule({
  declarations: [AppComponent, DynamicModelComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    firebase.AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true,
    },
    CanDeactivateTab,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
