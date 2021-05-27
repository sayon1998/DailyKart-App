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
export class Tab2Page implements AfterViewInit {
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
  itemsData = ['23'];
  x = [
    ['siwggy', 123],
    ['siwggy', 227],
    ['zomato', 103],
    ['zomato', 171],
    ['dunzo', 131],
    ['zomato', 122],
    ['siwggy', 181],
  ];
  totalLimit = 0;
  public productDetails: any[] = [];
  constructor(
    public nav: NavController,
    private _auth: AuthService,
    private _global: GlobalService,
    public _product: ProductService,
    private _router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      console.log('Tab2');
      this.ionViewWillEnter();
    });
  }
  // onClick(value: string) {
  //   const x = value.split(',');
  //   console.log(x);
  //   let totalValue = [];
  //   x.forEach((e, i) => {
  //     console.log(parseInt(e));
  //     if (
  //       isNaN(parseInt(e)) &&
  //       totalValue.findIndex((f) => f.name === e) === -1
  //     ) {
  //       console.log(e);
  //       console.log(this.countOccurences(value, e));
  //       let avg = 0;
  //       let count = this.countOccurences(value, e);
  //       x.forEach((y, i) => {
  //         if (y === e) {
  //           avg = avg + parseInt(x[i + 1]);
  //         }
  //       });
  //       totalValue.push({ name: e, average: avg / count });
  //     }
  //   });
  //   let biggerValueIndex = 0;
  //   let biggerValue = 0;
  //   totalValue.forEach((x, i) => {
  //     if (x.average > biggerValue) {
  //       console.log(x.average);
  //       biggerValue = x.average;
  //       biggerValueIndex = i;
  //     }
  //   });
  //   console.log(totalValue, totalValue[biggerValueIndex].name);
  // }
  // countOccurences(string, word) {
  //   return string.split(word).length - 1;
  // }
  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    this._product.checkLocalWishlist();
    this.nav.pop();
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
    this.getProductDetails();
  }
  ngAfterViewInit() {
    // this._product.checkLocalWishlist();
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
      limit: '5',
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
  // Navigate to Product Details page
  onClickProductDetails(index: number) {
    console.log(this.productDetails[index]._id);
    this._router.navigate(['/product-details'], {
      queryParams: { _id: this.productDetails[index]._id },
    });
    // this.nav.navigateRoot('/product-details', {
    //   queryParams: { _id: this.productDetails[index]._id, index },
    // });
  }
}
