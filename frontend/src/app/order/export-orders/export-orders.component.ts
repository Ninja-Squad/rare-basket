import { Component, inject, LOCALE_ID } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { OrderService } from '../order.service';
import { DownloadService } from '../../shared/download.service';
import { finalize } from 'rxjs/operators';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { validDateRange } from '../../shared/validators';
import { ValidationErrorsComponent } from 'ngx-valdemort';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { DatepickerContainerComponent } from '../../rb-ngb/datepicker-container.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-export-orders',
  templateUrl: './export-orders.component.html',
  styleUrl: './export-orders.component.scss',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    DatepickerContainerComponent,
    NgbInputDatepicker,
    FormControlValidationDirective,
    FaIconComponent,
    ValidationErrorsComponent
  ]
})
export class ExportOrdersComponent {
  private orderService = inject(OrderService);
  private downloadService = inject(DownloadService);

  form = inject(NonNullableFormBuilder).group(
    {
      from: [null as string | null, Validators.required],
      to: [null as string | null, Validators.required]
    },
    { validators: validDateRange }
  );
  exporting = false;
  exportingIcon = faSpinner;

  constructor() {
    const now = new Date();
    const startOfYear = new Date();
    startOfYear.setDate(1);
    startOfYear.setMonth(0);

    const locale = inject(LOCALE_ID);
    this.form.setValue({
      from: formatDate(startOfYear, 'yyyy-MM-dd', locale),
      to: formatDate(now, 'yyyy-MM-dd', locale)
    });
  }

  export() {
    if (!this.form.valid) {
      return;
    }

    this.exporting = true;
    this.orderService
      .exportReport(this.form.value.from!, this.form.value.to!)
      .pipe(finalize(() => (this.exporting = false)))
      .subscribe(response => this.downloadService.download(response, 'orders.csv'));
  }
}
