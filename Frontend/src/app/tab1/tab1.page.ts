import { Component } from '@angular/core';
import { GlobalService } from '../service/global.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  public products: any[] = [
    {
      _id: '1',
      img: 'assets/logo/dailykart.jpg',
      name: 'Vegetables',
    },
    {
      _id: '2',
      img: 'assets/logo/dailykart.jpg',
      name: 'Groceries',
    },
    {
      _id: '3',
      img: 'assets/logo/dailykart.jpg',
      name: 'Medicines',
    },
    {
      _id: '4',
      img: 'assets/logo/dailykart.jpg',
      name: 'Bear',
    },
  ];
  constructor(public _global: GlobalService) {
    console.log('tab1');
  }
}
