/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { GlobalService } from 'src/app/service/global.service';

@Component({
  selector: 'app-register-details',
  templateUrl: './register-details.component.html',
  styleUrls: ['./register-details.component.css'],
})
export class RegisterDetailsComponent implements OnInit {
  detailsForm: any;
  public isSpin = false;
  public isRoute = false;
  constructor(
    public _global: GlobalService,
    private _router: Router,
    private nav: NavController
  ) {}

  ngOnInit(): void {
    this.detailsForm = new FormGroup({
      fName: new FormControl('', [Validators.required]),
      mName: new FormControl(''),
      lName: new FormControl('', [Validators.required]),
      gender: new FormControl('M', [Validators.required]),
      email: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])
      ),
      // address: new FormControl('', [Validators.required]),
      // landmark: new FormControl(''),
      // pin: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      cpassword: new FormControl('', [Validators.required]),
    });
  }

  saveDetails() {
    console.log(this.detailsForm.value);
    if (!this.detailsForm.valid) {
      this.detailsForm.controls.email.touched = true;
      // this.detailsForm.controls.address.touched = true;
      this.detailsForm.controls.lName.touched = true;
      this.detailsForm.controls.gender.touched = true;
      this.detailsForm.controls.fName.touched = true;
      // this.detailsForm.controls.pin.touched = true;
      this.detailsForm.controls.password.touched = true;
      this.detailsForm.controls.cpassword.touched = true;
      if (
        this.detailsForm.controls.email.value !== '' &&
        // this.detailsForm.controls.address.value !== '' &&
        this.detailsForm.controls.lName.value !== '' &&
        this.detailsForm.controls.fName.value !== '' &&
        // this.detailsForm.controls.pin.value !== '' &&
        this.detailsForm.controls.password.value === ''
      ) {
        this._global.toasterValue('Enter your password');
        return false;
      }
      if (
        this.detailsForm.controls.email.value !== '' &&
        // this.detailsForm.controls.address.value !== '' &&
        this.detailsForm.controls.lName.value !== '' &&
        this.detailsForm.controls.fName.value !== '' &&
        // this.detailsForm.controls.pin.value !== '' &&
        this.detailsForm.controls.password.value !== '' &&
        this.detailsForm.controls.cpassword.value === ''
      ) {
        this._global.toasterValue('Enter your current password');
        return false;
      }
      return false;
    }
    if (
      this.detailsForm.controls.password.value &&
      String(this.detailsForm.controls.password.value).length < 4
    ) {
      this._global.toasterValue('Password length must be four letter long');
      return false;
    }
    if (
      this.detailsForm.controls.password.value !==
      this.detailsForm.controls.cpassword.value
    ) {
      this._global.toasterValue('Password & Confirm Password need to be same');
      return false;
    }
    const params = {
      reqType: 'signup',
      fName: this.detailsForm.controls.fName.value,
      mName: this.detailsForm.controls.mName.value,
      lName: this.detailsForm.controls.lName.value,
      gender: this.detailsForm.controls.gender.value,
      email: this.detailsForm.controls.email.value,
      ph: localStorage.getItem('ph'),
      password: this.detailsForm.controls.password.value,
    };
    this.isSpin = true;
    this._global.post('auth/sign-upin', params).subscribe(
      (resData: any) => {
        if (resData.status) {
          if (resData.data) {
            this.isRoute = true;
            this.isSpin = false;
            localStorage.setItem('isLogin', 'true');
            localStorage.setItem('user-details', JSON.stringify(resData.data));
            this._global.toasterValue(resData.message, 'Success');
            // this.nav.navigateRoot(['/tabs/tab2']);
            this.nav.navigateRoot(['/tabs/tab2']);
          }
        } else {
          this.isSpin = false;
          this._global.toasterValue(resData.message, 'Error');
        }
      },
      (err) => {
        console.log(err);
        this.isSpin = false;
        this._global.toasterValue(err.message, 'Error');
      }
    );
    console.log(params);
  }
}
