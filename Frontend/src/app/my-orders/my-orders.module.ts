import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyOrdersComponent } from './my-orders.component';
import { SharedModule } from 'src/shared/shared.module';
import { MyOrdersRoutingModule } from './my-orders.routing';
import { OrderDetailsComponent } from './order-details/order-details.component';

@NgModule({
  declarations: [MyOrdersComponent, OrderDetailsComponent],
  imports: [CommonModule, SharedModule, MyOrdersRoutingModule],
})
export class MyOrdersModule {}
