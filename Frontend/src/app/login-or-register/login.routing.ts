import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateTeam } from '../guard/deactive.guard';
import { LoginComponent } from './login.component';
import { RegisterDetailsComponent } from './register-details/register-details.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'register-details',
    canDeactivate: [CanDeactivateTeam],
    component: RegisterDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRoutingModule {}
