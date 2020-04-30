import { Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDatepickerConfig,
  NgbDatepickerModule,
  NgbModalModule,
  NgbPaginationModule,
  NgbProgressbarModule,
  NgbTooltipModule
} from '@ng-bootstrap/ng-bootstrap';
import { PaginationComponent } from './pagination/pagination.component';
import { CustomDateParserFormatterService } from './custom-date-parser-formatter.service';
import { DateStringAdapterService } from './date-string-adapter.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DatepickerContainerComponent } from './datepicker-container.component';

@Injectable({
  providedIn: 'root'
})
export class RbNgbDatepickerConfig extends NgbDatepickerConfig {
  constructor() {
    super();
    this.minDate = { year: 2020, month: 1, day: 1 };
    this.maxDate = { year: 2099, month: 12, day: 31 };
  }
}

const NGB_MODULES = [NgbModalModule, NgbTooltipModule, NgbPaginationModule, NgbProgressbarModule, NgbDatepickerModule];

@NgModule({
  imports: [...NGB_MODULES, CommonModule, FontAwesomeModule],
  exports: [...NGB_MODULES, PaginationComponent, DatepickerContainerComponent],
  declarations: [PaginationComponent, DatepickerContainerComponent],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatterService },
    { provide: NgbDateAdapter, useClass: DateStringAdapterService },
    { provide: NgbDatepickerConfig, useClass: RbNgbDatepickerConfig }
  ]
})
export class RbNgbModule {}
