import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyWishlistComponent } from './my-wishlist.component';
import { MyWishlistRoutingModule } from './my-wishlist.routing';
import { SharedModule } from 'src/shared/shared.module';

@NgModule({
  declarations: [MyWishlistComponent],
  imports: [CommonModule, MyWishlistRoutingModule, SharedModule],
})
export class MyWishlistModule {}
