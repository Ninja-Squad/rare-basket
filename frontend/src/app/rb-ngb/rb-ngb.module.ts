import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule, NgbPaginationModule, NgbProgressbarModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginationComponent } from './pagination/pagination.component';

const NGB_MODULES = [NgbModalModule, NgbTooltipModule, NgbPaginationModule, NgbProgressbarModule];

@NgModule({
  imports: [...NGB_MODULES, CommonModule],
  exports: [...NGB_MODULES, PaginationComponent],
  declarations: [PaginationComponent]
})
export class RbNgbModule {}
