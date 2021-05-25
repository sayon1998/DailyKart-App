/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable space-before-function-paren */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable no-underscore-dangle */
/* eslint-disable radix */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController, PopoverController, Platform } from '@ionic/angular';
import { GlobalService } from '../service/global.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
declare var SMS: any;
declare var document: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public otpSent = false; //OTP send Status
  public code = '+91'; // Default Country Code
  public spin = false; // Spinner
  public phoneNumber = ''; // Set ph number after OTP is send
  public loginOrRegisterFlag = false; // Default false means login
  public emailOrPhn = new FormControl('', [Validators.required]);
  public password = new FormControl('', [Validators.required]);
  public vOTP = '';
  public getOTP: any;
  public config = {
    allowNumbersOnly: true,
    length: 5,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '0',
    inputStyles: {
      width: '40px',
      height: '40px',
    },
  };
  @ViewChild('ngOtpInput', { static: false }) ngOtpInputRef: any;
  constructor(
    public nav: NavController,
    public popOverController: PopoverController,
    public _global: GlobalService,
    private _router: Router,
    public platform: Platform,
    public androidPermissions: AndroidPermissions
  ) {
    document.addEventListener('onSMSArrive', function (e: any) {
      var sms = e.data;
      console.log('received sms ' + JSON.stringify(sms));
      if (sms.address === 'HP-611773') {
        //look for your message address
        this.ngOtpInputRef.setValue(sms.body.substr(0, 4));
        if (SMS) {
          SMS.stopWatch(
            function () {
              console.log('watching stopped');
            },
            function () {
              console.log('failed to stop watching');
            }
          );
        }
        this.verifyOTP();
      }
    });
  }

  ngOnInit(): void {
    // if (this.platform.is('cordova')) {
    // }
  }
  checkPermission() {
    // if (this.platform.is('cordova')) {
    this.androidPermissions
      .checkPermission(this.androidPermissions.PERMISSION.READ_SMS)
      .then(
        (result) => {
          console.log('Has permission?', result.hasPermission);
          if (SMS) {
            SMS.startWatch(
              function () {
                console.log('watching started');
              },
              function () {
                console.log('failed to start watching');
              }
            );
          }
        },
        (err) =>
          this.androidPermissions
            .requestPermission(this.androidPermissions.PERMISSION.READ_SMS)
            .then((result) => {
              if (SMS) {
                SMS.startWatch(
                  function () {
                    console.log('watching started');
                  },
                  function () {
                    console.log('failed to start watching');
                  }
                );
              }
            })
      );
    // }
  }
  onLogin() {
    console.log(this.emailOrPhn.value, this.password.value);
    const param = {
      email: '',
      ph: '',
      password: this.password.value,
    };
    if (!this.emailOrPhn.value) {
      this._global.toasterValue('Please enter email or phone number');
      return false;
    }
    if (
      this.emailOrPhn.value
        .split('')
        .findIndex((x: any) => isNaN(x) === true) === -1
    ) {
      console.log('ph');
      if (this.emailOrPhn.value.length !== 10) {
        this._global.toasterValue('Phone number must be 10 digit');
        return false;
      }
      param.ph = this.emailOrPhn.value;
    } else {
      console.log('email');
      if (!this.emailOrPhn.value.includes('@')) {
        this._global.toasterValue(
          'Please Provide currect Email or Phone Number'
        );
        return false;
      }
      param.email = this.emailOrPhn.value;
    }
    console.log(param);
    if (param.ph === '7980674685' && param.password === '12345') {
      localStorage.setItem('isLogin', 'true');
      // this._router.navigate(['/tabs/tab2']);
      this.nav.navigateRoot(['/tabs/tab2']);
    } else {
      this._global.toasterValue('Invalid Password or Email or Phone number');
    }
  }
  sendOTP() {
    if (this.phoneNumber && String(this.phoneNumber).length !== 10) {
      this._global.toasterValue('Phone number must be 10 digit');
      return false;
    }
    if (
      this.phoneNumber &&
      this.phoneNumber !== '' &&
      String(this.phoneNumber).length === 10
    ) {
      // this.spin = true;
      this.otpSent = true;
      this.getOTP = '12345';
      localStorage.setItem('ph', this.phoneNumber);
      this.checkPermission();
    }
  }

  verifyOTP(event: any) {
    console.log(event);
    if (event && event.length === 5 && event === this.getOTP) {
      // this._router.navigate(['/login/register-details']);
      this.nav.navigateRoot(['/login/register-details']);
    } else if (event && event.length === 5 && event !== this.getOTP) {
      this._global.toasterValue('Incorrect OTP');
      this.ngOtpInputRef.setValue('');
    }
  }
}
