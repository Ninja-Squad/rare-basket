import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

const NGB_MODULES = [NgbModalModule, NgbTooltipModule];

@NgModule({
  imports: [...NGB_MODULES, CommonModule],
  exports: [...NGB_MODULES]
})
export class RbNgbModule {}
