import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login.routing';
import { SharedModule } from 'src/shared/shared.module';
import { RegisterDetailsComponent } from './register-details/register-details.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { CanDeactivateTeam } from '../guard/deactive.guard';

@NgModule({
  declarations: [LoginComponent, RegisterDetailsComponent],
  imports: [CommonModule, LoginRoutingModule, SharedModule, NgOtpInputModule],
  providers: [CanDeactivateTeam],
})
export class LoginModule {}
