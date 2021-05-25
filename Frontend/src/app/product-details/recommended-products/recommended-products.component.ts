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
  public lastKey = ''; // Keep track of last product key
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  constructor(
    public nav: NavController,
    private _auth: AuthService,
    private _global: GlobalService,
    public _product: ProductService,
    private _router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {}
  // Navigate to Product Details page
  onClickProductDetails(index: number) {
    this._router.navigate(['/product-details'], {
      queryParams: { _id: this._product.products[index]._id, index },
    });
    // this.nav.navigateRoot('/product-details', {
    //   queryParams: { _id: this._product.products[index]._id, index },
    // });
  }
  // Infinite Scroll
  loadData(event: any) {
    event.target.complete(); // For Hide Infinite Scroll Spinner
    this.infiniteScroll.disabled = true; // For Disable Infinte Scroll when last data load
  }
}
