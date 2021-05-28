import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UniversalSearchComponent } from './universal-search.component';

const routes: Routes = [
  {
    path: '',
    component: UniversalSearchComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UniversalSearchRoutingModule {}
