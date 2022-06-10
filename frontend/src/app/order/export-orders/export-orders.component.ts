import { Component, Inject, LOCALE_ID } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { OrderService } from '../order.service';
import { DownloadService } from '../../shared/download.service';
import { finalize } from 'rxjs/operators';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { validDateRange } from '../../shared/validators';

@Component({
  selector: 'rb-export-orders',
  templateUrl: './export-orders.component.html',
  styleUrls: ['./export-orders.component.scss']
})
export class ExportOrdersComponent {
  form: UntypedFormGroup;
  exporting = false;
  exportingIcon = faSpinner;

  constructor(
    fb: UntypedFormBuilder,
    @Inject(LOCALE_ID) locale: string,
    private orderService: OrderService,
    private downloadService: DownloadService
  ) {
    const now = new Date();
    const startOfYear = new Date();
    startOfYear.setDate(1);
    startOfYear.setMonth(0);

    this.form = fb.group(
      {
        from: [formatDate(startOfYear, 'yyyy-MM-dd', locale), Validators.required],
        to: [formatDate(now, 'yyyy-MM-dd', locale), Validators.required]
      },
      { validators: validDateRange }
    );
  }

  export() {
    if (!this.form.valid) {
      return;
    }

    this.exporting = true;
    this.orderService
      .exportReport(this.form.value.from, this.form.value.to)
      .pipe(finalize(() => (this.exporting = false)))
      .subscribe(response => this.downloadService.download(response, 'orders.csv'));
  }
}
