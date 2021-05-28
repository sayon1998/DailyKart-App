import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalSearchComponent } from './universal-search.component';
import { UniversalSearchRoutingModule } from './universal-search.routing';
import { SharedModule } from 'src/shared/shared.module';

@NgModule({
  declarations: [UniversalSearchComponent],
  imports: [CommonModule, SharedModule, UniversalSearchRoutingModule],
})
export class UniversalSearchModule {}
