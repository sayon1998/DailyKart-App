import { Injectable } from '@angular/core';
import {
  CanDeactivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { RegisterDetailsComponent } from '../login-or-register/register-details/register-details.component';
import { Tab2Page } from '../tab2/tab2.page';

@Injectable()
export class CanDeactivateTeam
  implements CanDeactivate<RegisterDetailsComponent>
{
  constructor(private _router: Router) {}

  canDeactivate(
    component: RegisterDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    console.log(
      currentRoute,
      currentState,
      nextState,
      component.detailsForm.valid
    );
    if (component.isRoute) {
      // eslint-disable-next-line no-underscore-dangle
      return true;
    }
    return false;
  }
}

@Injectable()
export class CanDeactivateTab implements CanDeactivate<Tab2Page> {
  constructor(private _router: Router) {}

  canDeactivate(
    component: Tab2Page,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    console.log(currentRoute, currentState, nextState);
    if (
      currentState.url !== '/tabs/tab3' &&
      (nextState.url === '/login' ||
        nextState.url === '/login/register-details')
    ) {
      console.log('as6e');
      return false;
    }
    console.log('as6e na');
    return true;
  }
}
