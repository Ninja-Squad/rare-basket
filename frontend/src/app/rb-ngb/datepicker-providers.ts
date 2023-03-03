import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { CustomDateParserFormatterService } from './custom-date-parser-formatter.service';
import { DateStringAdapterService } from './date-string-adapter.service';

@Injectable()
class RbNgbDatepickerConfig extends NgbDatepickerConfig {
  constructor() {
    super();
    this.minDate = { year: 2020, month: 1, day: 1 };
    this.maxDate = { year: 2099, month: 12, day: 31 };
  }
}

export const provideNgbDatepickerServices = () => [
  { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatterService },
  { provide: NgbDateAdapter, useClass: DateStringAdapterService },
  { provide: NgbDatepickerConfig, useClass: RbNgbDatepickerConfig }
];
