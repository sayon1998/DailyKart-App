/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private _auth: AuthService,
    public router: Router,
    private nav: NavController
  ) {}

  canActivate(): boolean {
    console.log(this._auth.isLogin());
    if (!this._auth.isLogin()) {
      // this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
