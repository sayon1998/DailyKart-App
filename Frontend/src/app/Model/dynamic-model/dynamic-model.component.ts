/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Plugins } from '@capacitor/core';
import { ModalController, NavController } from '@ionic/angular';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { AddressService } from 'src/app/service/address.service';
import { GlobalService } from 'src/app/service/global.service';
const { Geolocation } = Plugins;

@Component({
  selector: 'app-dynamic-model',
  templateUrl: './dynamic-model.component.html',
  styleUrls: ['./dynamic-model.component.scss'],
})
export class DynamicModelComponent implements OnInit {
  @Input() data: any;
  @Input() type: string;
  public city = '';
  public tempCIty = '';
  public pin = new FormControl('');
  public addressModal: any = {
    name: '',
    city: [],
    state: '',
    dist: '',
    area: '',
    landmark: '',
    addressType: [
      { name: 'Home', isCheck: true },
      { name: 'Office', isCheck: false },
    ],
  };
  startLoading = false;
  constructor(
    public nav: NavController,
    public _global: GlobalService,
    public _address: AddressService,
    public modalController: ModalController
  ) {}

  ngOnInit(): void {
    console.log(this.data, this.type);
    this.pin.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
      console.log(res);
      if (String(res) !== '' && String(res).length === 6) {
        this.getStateCity(String(res));
      }
    });
    if (this.type === 'Edit your address') {
      this.patchData();
    }
  }
  patchData() {
    if (this.data) {
      this.tempCIty = this.data.city ? this.data.city : '';
      this.pin.setValue(this.data.pin ? this.data.pin : '');
      this.onClickChangeType(
        this.data.addressType ? this.data.addressType : 'Home'
      );
      this.addressModal.name = this.data.name ? this.data.name : '';
      this.addressModal.ph = this.data.ph ? this.data.ph : '';
      this.addressModal.dist = this.data.dist ? this.data.dist : '';
      this.addressModal.state = this.data.state ? this.data.state : '';
      this.addressModal.area = this.data.area ? this.data.area : '';
      this.addressModal.landmark = this.data.landmark ? this.data.landmark : '';
    }
  }
  // Get State, Dist, City using Pin
  getStateCity(pin: string) {
    this._global.startLoading();
    this._global.get('address/get-state-city-place/', pin).subscribe(
      (resData: any) => {
        if (resData.status) {
          if (resData.data) {
            this.city = '';
            this.addressModal.city = [];
            this.addressModal.dist = resData.data.dist;
            this.addressModal.state = resData.data.state;
            this.addressModal.city = resData.data.city;
            this.city = this.tempCIty;
            this._global.loadingController.dismiss();
          } else {
            this._global.loadingController.dismiss();
            this._global.toasterValue(
              'No city is available to this pincode',
              'Warning'
            );
          }
        }
      },
      (err) => {
        this._global.loadingController.dismiss();
        this._global.toasterValue(err.message, 'Error');
      }
    );
  }
  // Convert Int to String
  getStringFromInt(intType: any) {
    return String(intType);
  }
  // Use Current Location
  async onClickLocation(type: string = '', pin: any = '') {
    // http://api.geonames.org/findNearbyPostalCodesJSON?lat=23.0057344&lng=88.4865504&username=sayon
    if (type === '') {
      await Geolocation.getCurrentPosition({
        timeout: 1000,
        enableHighAccuracy: true,
      })
        .then((res) => {
          this.startLoading = true;
          console.log(
            'lat: ' + res.coords.latitude + ' long:' + res.coords.longitude
          );
          this._global
            .get(
              'address/get-current-location/',
              `${res.coords.latitude}/${res.coords.longitude}`
            )
            .subscribe(
              (resData: any) => {
                if (resData.status) {
                  if (resData.data) {
                    this.pin.setValue(resData.data.pin);
                    this.tempCIty = resData.data.city;
                    this.startLoading = false;
                    console.log(resData.data);
                  }
                } else {
                  this.startLoading = false;
                  this._global.toasterValue(
                    'Unable to get Current Location',
                    'Error'
                  );
                }
              },
              (err) => {
                this.startLoading = false;
                this._global.toasterValue(err.message, 'Error');
              }
            );
        })
        .catch((err) => {
          console.log(err.message);
          this._global.toasterValue(err.message, 'Error');
        });
    }
  }
  // Change Address Type
  onClickChangeType(type) {
    if (type === 'Home') {
      if (!this.addressModal.addressType[0].isCheck) {
        this.addressModal.addressType[0].isCheck = true;
        this.addressModal.addressType[1].isCheck = false;
      }
    } else {
      if (!this.addressModal.addressType[1].isCheck) {
        this.addressModal.addressType[1].isCheck = true;
        this.addressModal.addressType[0].isCheck = false;
      }
    }
  }
  // Save Details
  onClickSave() {
    this.addressModal.name = this.addressModal.name.trim();
    this.addressModal.state = this.addressModal.state.trim();
    this.addressModal.dist = this.addressModal.dist.trim();
    this.addressModal.area = this.addressModal.area.trim();
    console.log(this.addressModal, this.city, this.pin.value);
    if (
      String(this.addressModal.ph) &&
      String(this.addressModal.ph).length !== 10
    ) {
      return false;
    }
    if (String(this.pin.value) && String(this.pin.value).length !== 6) {
      return false;
    }
    if (this.addressModal && !this.addressModal.name) {
      this._global.toasterValue('Full Name is required', 'Warning');
      return false;
    }
    if (
      this.addressModal &&
      this.addressModal.name &&
      !this.addressModal.name.includes(' ')
    ) {
      this._global.toasterValue('May be you missed out Surname', 'Warning');
      return false;
    }
    if (this.addressModal && !this.addressModal.ph) {
      this._global.toasterValue('Phone number is required', 'Warning');
      return false;
    }
    if (!this.pin.value) {
      this._global.toasterValue('Pin is required', 'Warning');
      return false;
    }
    if (!this.city) {
      this._global.toasterValue('City is required', 'Warning');
      return false;
    }
    if (this.addressModal && !this.addressModal.dist) {
      this._global.toasterValue('District is required', 'Warning');
      return false;
    }
    if (this.addressModal && !this.addressModal.state) {
      this._global.toasterValue('State is required', 'Warning');
      return false;
    }
    if (this.addressModal && !this.addressModal.area) {
      this._global.toasterValue(
        'Area, Colony, Street, Village is required',
        'Warning'
      );
      return false;
    }
    // After Check All Conditions
    if (this.data && this.data.addressId !== 0) {
      // Edit
      const param = {
        userId: localStorage.getItem('userId'),
        address: [
          {
            addressId: this.data.addressId,
            name: this.addressModal.name,
            ph: this.addressModal.ph,
            pin: this.pin.value,
            city: this.city,
            state: this.addressModal.state,
            dist: this.addressModal.dist,
            area: this.addressModal.area,
            landmark: this.addressModal.landmark,
            addressType: this.addressModal.addressType[0].isCheck
              ? 'Home'
              : 'Office',
          },
        ],
      };
      console.log(param);
      this.startLoading = true;
      this._global.post('address/save-address', param).subscribe(
        (resData: any) => {
          if (resData.status) {
            if (resData.data && resData.data.address) {
              this._address.addressArray = [];
              this._address.addressArray = resData.data.address;
              localStorage.setItem(
                'address',
                JSON.stringify(this._address.addressArray)
              );
              this._global.toasterValue(resData.message, 'Success');
              this.startLoading = false;
              this.modalController.dismiss().then((res) => {
                window.location.reload();
              });
            }
          } else {
            this.startLoading = false;
            this._global.toasterValue(resData.message, 'Error');
          }
        },
        (err) => {
          this.startLoading = false;
          this._global.toasterValue(err.message, 'Error');
        }
      );
    } else {
      // Add
      const param = {
        userId: localStorage.getItem('userId'),
        address: [
          {
            addressId: 0,
            name: this.addressModal.name,
            ph: this.addressModal.ph,
            pin: this.pin.value,
            city: this.city,
            state: this.addressModal.state,
            dist: this.addressModal.dist,
            area: this.addressModal.area,
            landmark: this.addressModal.landmark,
            addressType: this.addressModal.addressType[0].isCheck
              ? 'Home'
              : 'Office',
          },
        ],
      };
      console.log(param);
      this.startLoading = true;
      this._global.post('address/save-address', param).subscribe(
        (resData: any) => {
          if (resData.status) {
            if (resData.data && resData.data.address) {
              this._address.addressArray.push(resData.data.address);
              localStorage.setItem(
                'address',
                JSON.stringify(this._address.addressArray)
              );
              this._global.toasterValue(resData.message, 'Success');
              this.startLoading = false;
              this.modalController.dismiss().then((res) => {
                window.location.reload();
              });
            }
          } else {
            this.startLoading = false;
            this._global.toasterValue(resData.message, 'Error');
          }
        },
        (err) => {
          this.startLoading = false;
          this._global.toasterValue(err.message, 'Error');
        }
      );
    }
  }
}
