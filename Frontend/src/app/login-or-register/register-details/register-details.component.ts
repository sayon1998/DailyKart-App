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
      address: new FormControl('', [Validators.required]),
      landmark: new FormControl(''),
      pin: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      cpassword: new FormControl('', [Validators.required]),
    });
  }

  saveDetails() {
    console.log(this.detailsForm.value);
    if (!this.detailsForm.valid) {
      this.detailsForm.controls.email.touched = true;
      this.detailsForm.controls.address.touched = true;
      this.detailsForm.controls.lName.touched = true;
      this.detailsForm.controls.gender.touched = true;
      this.detailsForm.controls.fName.touched = true;
      this.detailsForm.controls.pin.touched = true;
      this.detailsForm.controls.password.touched = true;
      this.detailsForm.controls.cpassword.touched = true;
      if (
        this.detailsForm.controls.email.value !== '' &&
        this.detailsForm.controls.address.value !== '' &&
        this.detailsForm.controls.lName.value !== '' &&
        this.detailsForm.controls.fName.value !== '' &&
        this.detailsForm.controls.pin.value !== '' &&
        this.detailsForm.controls.password.value === ''
      ) {
        this._global.toasterValue('Enter your password');
        return false;
      }
      if (
        this.detailsForm.controls.email.value !== '' &&
        this.detailsForm.controls.address.value !== '' &&
        this.detailsForm.controls.lName.value !== '' &&
        this.detailsForm.controls.fName.value !== '' &&
        this.detailsForm.controls.pin.value !== '' &&
        this.detailsForm.controls.password.value !== '' &&
        this.detailsForm.controls.cpassword.value === ''
      ) {
        this._global.toasterValue('Enter your current password');
        return false;
      }
      return false;
    }
    if (
      this.detailsForm.controls.pin.value &&
      String(this.detailsForm.controls.pin.value).length !== 6
    ) {
      this._global.toasterValue('Pin code must be six digit');
      return false;
    }
    if (
      this.detailsForm.controls.password.value !==
      this.detailsForm.controls.cpassword.value
    ) {
      this._global.toasterValue('Password & Confirm Password need to be same');
      return false;
    }
    this.isRoute = true;
    localStorage.setItem(
      'user-details',
      JSON.stringify(this.detailsForm.value)
    );
    localStorage.setItem('isLogin', 'true');
    // this._router.navigate(['/tabs/tab2']);
    this.nav.navigateRoot(['/tabs/tab2']);
  }
}
