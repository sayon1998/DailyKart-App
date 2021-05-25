/* eslint-disable no-underscore-dangle */
/* eslint-disable object-shorthand */
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { GlobalService } from './global.service';
import { UserDetailService } from './user-details.service';

@Injectable()
export class ProductService {
  public products: any[] = [
    {
      _id: '1',
      img: 'assets/logo/dailykart.jpg',
      isCart: false,
      imagelist: [
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
      ],
      name: 'Potato',
      description: 'this vegetable is good, fresh and solid and well packed.',
      unit: '1 Kg',
      rating: '2/5',
      price: '₹15',
      originalprice: '₹18',
      type: 'Vegetable',
      returnpolicy: 'No Returns Applicable',
      offerpercentage: '16.67% off',
      company: 'Ayon shop',
      totalrating: '674',
      icon: 'heart-outline',
      deliverycharge: '₹10',
      paymentmode: 'Online',
      perunit: '1 Kg',
      quantity: 1,
      minqty: 1,
      highestquentity: 10,
    },
    {
      _id: '2',
      img: 'assets/logo/dailykart.jpg',
      isCart: false,
      imagelist: [
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
      ],
      name: 'Tomato',
      description: 'this vegetable is good, fresh and solid and well packed.',
      price: '₹12',
      rating: '2.9/5',
      unit: '1 Kg',
      returnpolicy: 'No Returns Applicable',
      type: 'Vegetable',
      originalprice: '₹16',
      offerpercentage: '25% off',
      company: 'Sayon shop',
      icon: 'heart-outline',
      deliverycharge: '',
      totalrating: '107',
      paymentmode: 'Online',
      perunit: '1 Kg',
      minqty: 2,
      quantity: 2,
      highestquentity: 10,
    },
    {
      _id: '3',
      isCart: false,
      img: 'assets/logo/dailykart.jpg',
      imagelist: [
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
      ],
      name: 'Oninon',
      rating: '4.1/5',
      unit: '2 Kg',
      returnpolicy: 'No Returns Applicable',
      description: 'this vegetable is good, fresh and solid and well packed.',
      price: '₹20',
      originalprice: '₹30',
      type: 'Vegetable',
      offerpercentage: '20% off',
      company: 'Ayon shop',
      paymentmode: 'Cash on Delivery & Online',
      icon: 'heart-outline',
      totalrating: '208',
      deliverycharge: '₹15',
      perunit: '1 Kg',
      quantity: 1,
      minqty: 1,
      highestquentity: 10,
    },
    {
      _id: '4',
      isCart: false,
      img: 'assets/logo/dailykart.jpg',
      imagelist: [
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
      ],
      name: 'Saloni OilSaloni OilSaloni OilSaloni OilSaloni Oil',
      unit: '2 Litre',
      rating: '3.8/5',
      returnpolicy: 'Returns Applicable',
      description: 'this vegetable is good, fresh and solid and well packed.',
      price: '₹116',
      originalprice: '₹138',
      type: 'Grocerie',
      totalrating: '19',
      paymentmode: 'Cash on Delivery & Online',
      offerpercentage: '8.7% off',
      company: 'Tarinmoy shop',
      icon: 'heart-outline',
      deliverycharge: '',
      perunit: '1 Litre',
      quantity: 3,
      minqty: 3,
      highestquentity: 10,
    },
    {
      _id: '5',
      isCart: false,
      img: 'assets/logo/dailykart.jpg',
      imagelist: [
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
        'assets/logo/dailykart.jpg',
      ],
      name: 'Emami Sunflower Oil',
      rating: '1.5/5',
      unit: '1 Litre',
      totalrating: '198',
      type: 'Grocerie',
      price: '₹130',
      returnpolicy: 'No Returns Applicable',
      paymentmode: 'Cash on Delivery & Online',
      description: 'this vegetable is good, fresh and solid and well packed.',
      originalprice: '₹150',
      offerpercentage: '13.33% off',
      company: 'Tarinmoy shop',
      icon: 'heart-outline',
      deliverycharge: '',
      perunit: '1 Litre',
      minqty: 1,
      quantity: 10,
      highestquentity: 10,
    },
  ];

  constructor(
    public _auth: AuthService,
    public _global: GlobalService,
    public _user: UserDetailService
  ) {
    console.log(this.products);
  }
  //Check Wish-list
  checkLocalWishlist() {
    if (
      !this._auth.isLogin() &&
      localStorage.getItem('wishList') !== undefined
    ) {
      let localArray: any[] = [];
      localArray = JSON.parse(localStorage.getItem('wishList'));
      if (localArray && localArray.length > 0) {
        this.products.forEach((e) => {
          if (localArray.findIndex((x) => x._id === e._id) > -1) {
            e.icon = 'heart';
            // document.getElementById(
            //   `${this.products.findIndex((x) => x._id === e._id)}`
            // ).style.color = 'red';
          } else if (
            localArray.findIndex((x) => x._id === e._id) === -1 &&
            e.icon === 'heart'
          ) {
            e.icon = 'heart-outline';
          }
        });
      } else {
        if (this.products && this.products.length > 0 && !localArray) {
          this.products.forEach((x) => {
            if (x.icon === 'heart') {
              x.icon = 'heart-outline';
            }
          });
        }
      }
    }
  }
  // Wish-list
  onClickWishList(index: number) {
    console.log(JSON.parse(localStorage.getItem('wishList')));
    if (this.products[index].icon && this.products[index].icon === 'heart') {
      // document.getElementById(`${index}`).style.color = '';
      this.products[index].icon = 'heart-outline';
      if (!this._auth.isLogin()) {
        let localArray: any[] = [];
        localArray = JSON.parse(localStorage.getItem('wishList'));
        localArray.splice(
          localArray.findIndex((x) => x._id === this.products[index]._id),
          1
        );
        localStorage.removeItem('wishList');
        console.log(localArray);
        if (localArray && localArray.length > 0) {
          localStorage.setItem('wishList', JSON.stringify(localArray));
        }
        this._global.toasterValue('Remove from Your local Wishlist');
      } else {
        // If User is Login then
      }
    } else {
      // document.getElementById(`${index}`).style.color = 'red';
      this.products[index].icon = 'heart';
      if (!this._auth.isLogin()) {
        if (
          localStorage.getItem('wishList') &&
          typeof localStorage.getItem('wishList') != undefined
        ) {
          let localArray: any[] = [];
          localArray = JSON.parse(localStorage.getItem('wishList'));
          localArray = localArray.concat(this.products[index]);
          localStorage.removeItem('wishList');
          console.log(localArray);
          localStorage.setItem('wishList', JSON.stringify(localArray));
        } else {
          localStorage.setItem(
            'wishList',
            JSON.stringify([this.products[index]])
          );
        }
        this._global.toasterValue('Added to Your local Wishlist');
      } else {
        // If User is Login then
      }
    }
  }
  // Quantity increase decrease
  onClickQuantity(product: any, index: number, type: string) {
    if (type === 'increase') {
      if (product.highestquentity === product.quantity) {
        this._global.toasterValue('Highest Quantity Reached');
      } else {
        product.quantity += 1;
      }
    } else if (type === 'decrease') {
      if (product.quantity === product.minqty) {
        this._global.toasterValue(`Minimum Quantity is ${product.minqty}`);
      } else {
        product.quantity -= 1;
      }
    }
  }
}
