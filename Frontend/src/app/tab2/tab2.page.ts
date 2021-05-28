/* eslint-disable radix */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, IonInfiniteScroll, IonSlides } from '@ionic/angular';
import { AuthService } from '../service/auth.service';
import { GlobalService } from '../service/global.service';
import { ProductService } from '../service/product-details.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  public lastKey = '0'; // Keep track of last product key
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonSlides) ionSliderRef: IonSlides;
  wishListFlag = false;
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: true,
    loop: true,
  };
  totalLimit = 0;
  public productDetails: any[] = [];
  constructor(
    public nav: NavController,
    private _auth: AuthService,
    public _global: GlobalService,
    public _product: ProductService,
    private _router: Router,
    private route: ActivatedRoute
  ) {
    // this.route.queryParams.subscribe((params) => {
    console.log('Tab2');
    // _global.goBackToForoward();
    // });
  }
  ionViewWillEnter() {
    console.log('**********ionViewWillEnter_TAB2**********');
    // this.infiniteScroll.disabled = false;
    this.wishListFlag = false;
    this.productDetails = [];
    this.lastKey = '0';
    this.totalLimit = 0;
    this.getProductDetails();
  }
  ionViewWillLeave() {
    console.log('ionViewWillLeave');
  }
  ionViewDidLeave() {
    console.log('ionViewDidLeave');
  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log('ngOnInit');
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    console.log('Destroy Tab2');
  }
  //Get Products
  getProductDetails() {
    const param = {
      startIndex: this.lastKey,
      limit: '6',
    };
    this._global.post('product/products', param).subscribe(
      (resData: any) => {
        if (resData.status) {
          if (resData.data) {
            this.lastKey = resData.data.startIndex;
            this.totalLimit = resData.data.totalLimit;
            this.productDetails = this.productDetails.concat(
              resData.data.productDetails
            );
            this._product.checkLocalWishlist(this.productDetails);
            console.log(
              this.lastKey,
              this.totalLimit,
              this.productDetails.length
            );
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
        console.log('calling');
        this.getProductDetails();
      }
    }, 500);
  }
  // Navigate to Product Details page
  onClickProductDetails(index: number) {
    console.log(this.productDetails[index]._id);
    // this.nav.navigateForward(['/product-details'], {
    //   queryParams: { _id: this.productDetails[index]._id },
    // });
    this.nav.navigateRoot(['/product-details'], {
      queryParams: { _id: this.productDetails[index]._id },
    });
  }
}
