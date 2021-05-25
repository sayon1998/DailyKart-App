import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyCartComponent } from './my-cart.component';
import { SharedModule } from 'src/shared/shared.module';
import { MyCartRoutingModule } from './my-cart.routing';
import { IonBottomSheetModule } from 'ion-bottom-sheet';

@NgModule({
  declarations: [MyCartComponent],
  imports: [
    CommonModule,
    SharedModule,
    MyCartRoutingModule,
    IonBottomSheetModule,
  ],
})
export class MyCartModule {}
