import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { CsvResult, OrderCsvParserService } from '../order-csv-parser.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccessionComponent } from '../../shared/accession/accession.component';
import { DecimalPipe } from '@angular/common';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'rb-csv-modal',
  templateUrl: './csv-modal.component.html',
  styleUrl: './csv-modal.component.scss',
  imports: [TranslateDirective, TranslatePipe, FormRoot, FormField, AccessionComponent, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsvModalComponent {
  private readonly modal = inject(NgbActiveModal);
  private readonly csvParser = inject(OrderCsvParserService);

  private readonly formValue = signal({ csv: '' });
  readonly form = form(this.formValue);
  readonly result = computed<CsvResult>(() => {
    const csv = this.form.csv().value();
    return csv ? this.csvParser.parse(csv) : { errors: [], items: [] };
  });

  close() {
    this.modal.close(this.result().items);
  }

  dismiss() {
    this.modal.dismiss();
  }
}
