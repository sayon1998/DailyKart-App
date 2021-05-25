/* eslint-disable object-shorthand */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLogin() {
    if (
      localStorage.getItem('isLogin') &&
      localStorage.getItem('isLogin') === 'true'
    ) {
      return true;
    }
    return false;
  }
}
