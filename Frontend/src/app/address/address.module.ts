import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressComponent } from './address.component';
import { AddressRoutingModule } from './address.routing';
import { SharedModule } from 'src/shared/shared.module';
import { IonBottomSheetModule } from 'ion-bottom-sheet';

@NgModule({
  declarations: [AddressComponent],
  imports: [
    CommonModule,
    AddressRoutingModule,
    SharedModule,
    IonBottomSheetModule,
  ],
})
export class AddressModule {}
