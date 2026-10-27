import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, LOCALE_ID, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { ValidationSignalErrorsComponent } from 'ngx-valdemort';
import { finalize, firstValueFrom } from 'rxjs';
import { DatepickerContainerComponent } from '../../rb-ngb/datepicker-container.component';
import { DownloadService } from '../../shared/download.service';
import { validSignalDateRange } from '../../shared/validators';
import { OrderService } from '../order.service';

@Component({
  selector: 'rb-export-orders',
  templateUrl: './export-orders.component.html',
  styleUrl: './export-orders.component.scss',
  imports: [
    TranslateDirective,
    TranslatePipe,
    FormRoot,
    FormField,
    DatepickerContainerComponent,
    NgbInputDatepicker,
    FaIconComponent,
    ValidationSignalErrorsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportOrdersComponent {
  private readonly orderService = inject(OrderService);
  private readonly downloadService = inject(DownloadService);

  private readonly formValue = signal({
    from: '',
    to: ''
  });
  readonly form = form(
    this.formValue,
    f => {
      required(f.from);
      required(f.to);
      validSignalDateRange(f);
    },
    {
      submission: {
        action: async () => {
          await this.export();
          return undefined;
        }
      }
    }
  );
  readonly exporting = signal(false);
  readonly exportingIcon = faSpinner;

  constructor() {
    const now = new Date();
    const startOfYear = new Date();
    startOfYear.setDate(1);
    startOfYear.setMonth(0);

    const locale = inject(LOCALE_ID);
    this.formValue.set({
      from: formatDate(startOfYear, 'yyyy-MM-dd', locale),
      to: formatDate(now, 'yyyy-MM-dd', locale)
    });
  }

  async export(): Promise<void> {
    const formValue = this.formValue();
    this.exporting.set(true);
    const response = await firstValueFrom(
      this.orderService.exportReport(formValue.from, formValue.to).pipe(finalize(() => this.exporting.set(false)))
    );
    this.downloadService.download(response, 'orders.csv');
  }
}
