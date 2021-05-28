/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
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
import { FirebaseAuthentication } from '@ionic-native/firebase-authentication/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
declare var SMSReceive: any;
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
  public config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '0',
    inputStyles: {
      width: '40px',
      height: '40px',
    },
  };
  public verificationId = '';
  @ViewChild('ngOtpInput', { static: false }) ngOtpInputRef: any;
  setInterval: any;
  otpSec = 60;
  constructor(
    public nav: NavController,
    public popOverController: PopoverController,
    public _global: GlobalService,
    private _router: Router,
    public platform: Platform,
    private firebaseAuthentication: FirebaseAuthentication,
    private keyboard: Keyboard
  ) {}

  ngOnInit(): void {
    if (this.platform.is('cordova')) {
      this.start();
    }
    this._global.onClickLocation();
  }
  start() {
    SMSReceive.startWatch(
      () => {
        console.log('watch started');
        document.addEventListener('onSMSArrive', (e: any) => {
          console.log('onSMSArrive()');
          var IncomingSMS = e.data.body.toString().substring(0, 6);
          this.ngOtpInputRef.setValue(IncomingSMS);
          console.log(JSON.stringify(IncomingSMS));
        });
      },
      () => {
        console.log('watch start failed');
      }
    );
  }
  onLogin() {
    console.log(this.emailOrPhn.value, this.password.value);
    const param = {
      reqType: 'signin',
      email: '',
      ph: '',
      password: this.password.value,
      lat: this._global.latitude,
      lon: this._global.longitude,
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
    this.spin = true;
    this._global.post('auth/sign-upin', param).subscribe(
      (resData: any) => {
        console.log(resData);
        if (resData.status) {
          if (resData.data) {
            localStorage.setItem('isLogin', 'true');
            localStorage.setItem('user-details', JSON.stringify(resData.data));
            if (this.platform.is('cordova')) {
              SMSReceive.stopWatch(
                () => {
                  console.log('watch stopped');
                },
                () => {
                  console.log('watch stop failed');
                }
              );
            }
            this.spin = false;
            // this.nav.navigateRoot(['/tabs/tab2']);
            this.nav.navigateRoot(['/tabs/tab2']);
          }
        } else {
          this.spin = false;
          this._global.toasterValue(resData.message, 'Error');
        }
      },
      (err) => {
        this.spin = false;
        console.log(err);
        this._global.toasterValue(err.message, 'Error');
      }
    );
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
      const param = {
        ph: String(this.phoneNumber),
      };
      this.spin = true;
      this._global.post('auth/check-phnumber-availability', param).subscribe(
        (resData: any) => {
          console.log(resData);
          if (resData.status) {
            if (this.platform.is('cordova')) {
              this.firebaseAuthentication
                .verifyPhoneNumber(String('+91' + this.phoneNumber), 60)
                .then((res) => {
                  this.spin = false;
                  this.otpSent = true;
                  this.verificationId = res;
                  console.log(res);
                  this.setInterval = setInterval(() => {
                    if (this.otpSec > 0) {
                      this.otpSec -= 1;
                    } else {
                      clearInterval(this.setInterval);
                    }
                  }, 1000);
                })
                .catch((err) => {
                  this.spin = false;
                  console.log(err);
                  alert(err);
                });
            } else {
              this.spin = false;
            }
          } else {
            this.spin = false;
            this._global.toasterValue(resData.message, 'Warning');
          }
        },
        (err) => {
          this.spin = false;
          this._global.toasterValue(err.message, 'Error');
        }
      );
    }
  }
  retryOTP() {
    this.spin = true;
    this.firebaseAuthentication
      .verifyPhoneNumber(String('+91' + this.phoneNumber), 60)
      .then((res) => {
        this.spin = false;
        this.verificationId = res;
        console.log(res);
        this.otpSec = 60;
        this.setInterval = setInterval(() => {
          if (this.otpSec > 0) {
            this.otpSec -= 1;
          } else {
            clearInterval(this.setInterval);
          }
        }, 1000);
      })
      .catch((err) => {
        this.spin = false;
        console.log(err);
        alert('Error: ' + err);
      });
  }
  verifyOTP(event: any) {
    console.log(event);
    if (event && event.length === 6) {
      this.firebaseAuthentication
        .signInWithVerificationId(this.verificationId, event)
        .then((res) => {
          console.log(res);
          localStorage.setItem('ph', this.phoneNumber);
          SMSReceive.stopWatch(
            () => {
              console.log('watch stopped');
            },
            () => {
              console.log('watch stop failed');
            }
          );
          this.keyboard.hide();
          // this.nav.navigateRoot(['/login/register-details']);
          this.nav.navigateRoot(['/login/register-details']);
        })
        .catch((err) => {
          console.log(err);
          if (
            err.includes(
              'The sms verification code used to create the phone auth credential is invalid.'
            )
          ) {
            this._global.toasterValue('OTP is not valid', 'Error');
          } else {
            this._global.toasterValue(err, 'Error');
          }

          this.ngOtpInputRef.setValue('');
        });
    }
  }
}
