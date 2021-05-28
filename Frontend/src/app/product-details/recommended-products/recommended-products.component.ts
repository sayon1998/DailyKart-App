/* eslint-disable radix */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/service/auth.service';
import { GlobalService } from 'src/app/service/global.service';
import { ProductService } from 'src/app/service/product-details.service';

@Component({
  selector: 'app-recommended-products',
  templateUrl: './recommended-products.component.html',
  styleUrls: ['./recommended-products.component.scss'],
})
export class RecommendedProductsComponent implements OnInit {
  public lastKey = '0'; // Keep track of last product key
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  public productDetails: any[] = [];
  totalLimit = 0;
  constructor(
    public nav: NavController,
    private _auth: AuthService,
    public _global: GlobalService,
    public _product: ProductService,
    private _router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {}
  // Navigate to Product Details page
  onClickProductDetails(index: number) {
    this.nav.navigateRoot(['/product-details'], {
      queryParams: { _id: this.productDetails[index]._id, index },
    });
    // this.nav.navigateRoot('/product-details', {
    //   queryParams: { _id: this.productDetails[index]._id, index },
    // });
  }
  ionViewWillEnter() {
    this.lastKey = '0';
    this.totalLimit = 0;
    this.productDetails = [];
    this.getProductDetails();
  }
  //Get Products
  getProductDetails() {
    const param = {
      startIndex: this.lastKey,
      limit: '6',
    };
    console.log(param);
    this._global.post('product/products', param).subscribe(
      (resData: any) => {
        console.log(resData);
        if (resData.status) {
          if (resData.data) {
            this.lastKey = resData.data.startIndex;
            this.totalLimit = resData.data.totalLimit;
            this.productDetails = this.productDetails.concat(
              resData.data.productDetails
            );
            this._product.checkLocalWishlist(this.productDetails);
            console.log(this.productDetails);
          }
        } else {
          this._global.toasterValue(resData.message, 'Error');
        }
      },
      (err) => {
        this._global.toasterValue(err.message, 'Error');
      }
    );
  }
  // Infinite Scroll
  loadData(event: any) {
    console.log('##### Infinite Scroll #####');
    setTimeout(() => {
      event.target.complete();
      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (parseInt(this.lastKey) > this.totalLimit) {
        this.infiniteScroll.disabled = true; // For Disable Infinte Scroll when last data load
      } else {
        this.getProductDetails();
      }
    }, 500);
  }
}
