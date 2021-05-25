import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetailsRoutingModule } from './product-details.routing';
import { SharedModule } from 'src/shared/shared.module';
import { ProductDetailsComponent } from './product-details.component';
import { IonBottomSheetModule } from 'ion-bottom-sheet';
// import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { RecommendedProductsComponent } from './recommended-products/recommended-products.component';

@NgModule({
  declarations: [ProductDetailsComponent, RecommendedProductsComponent],
  imports: [
    CommonModule,
    ProductDetailsRoutingModule,
    SharedModule,
    IonBottomSheetModule,
  ],
  providers: [
    // Geolocation,
    NativeGeocoder,
  ],
})
export class ProductDetailsModule {}
