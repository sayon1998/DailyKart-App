import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GlobalService } from 'src/app/service/global.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from 'src/app/service/auth.service';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  exports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [GlobalService, AndroidPermissions, AuthService],
})
export class SharedModule {}
