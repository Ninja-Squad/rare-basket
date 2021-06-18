import { Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgbCollapseModule,
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDatepickerConfig,
  NgbDatepickerModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbPaginationModule,
  NgbProgressbarModule,
  NgbToastModule,
  NgbTooltipModule
} from '@ng-bootstrap/ng-bootstrap';
import { PaginationComponent } from './pagination/pagination.component';
import { CustomDateParserFormatterService } from './custom-date-parser-formatter.service';
import { DateStringAdapterService } from './date-string-adapter.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DatepickerContainerComponent } from './datepicker-container.component';
import { ToastsComponent } from './toasts/toasts.component';
import { ModalService } from './modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterNavDirective, RouterNavLinkDirective, RouterNavPanelDirective } from './router-nav.directive';

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

const NGB_MODULES = [
  NgbModalModule,
  NgbTooltipModule,
  NgbPaginationModule,
  NgbProgressbarModule,
  NgbDatepickerModule,
  NgbToastModule,
  NgbDropdownModule,
  NgbCollapseModule
];

const EXPORTED_DECLARABLES = [
  PaginationComponent,
  DatepickerContainerComponent,
  ToastsComponent,
  RouterNavDirective,
  RouterNavLinkDirective,
  RouterNavPanelDirective
];

@NgModule({
  imports: [...NGB_MODULES, CommonModule, FontAwesomeModule, TranslateModule],
  declarations: [...EXPORTED_DECLARABLES],
  exports: [...NGB_MODULES, ...EXPORTED_DECLARABLES],
  providers: [
    ModalService,
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatterService },
    { provide: NgbDateAdapter, useClass: DateStringAdapterService },
    { provide: NgbDatepickerConfig, useClass: RbNgbDatepickerConfig }
  ]
})
export class RbNgbModule {}
