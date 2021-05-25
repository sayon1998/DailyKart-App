import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComponent } from './checkout.component';
import { SharedModule } from 'src/shared/shared.module';
import { CheckoutRoutingModule } from './checkout.routing';

@NgModule({
  declarations: [CheckoutComponent],
  imports: [CommonModule, SharedModule, CheckoutRoutingModule],
})
export class CheckoutModule {}
