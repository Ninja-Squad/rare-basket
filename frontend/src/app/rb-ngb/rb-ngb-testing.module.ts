import { RbNgbModule } from './rb-ngb.module';
import { NgbConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';

/**
 * A module for unit tests, which imports the RbNgbModule and disables animations
 */
@NgModule({
  imports: [RbNgbModule],
  exports: [RbNgbModule]
})
export class RbNgbTestingModule {
  constructor(ngbConfig: NgbConfig) {
    ngbConfig.animation = false;
  }
}
