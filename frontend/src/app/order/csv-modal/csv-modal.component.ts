import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CsvResult, OrderCsvParserService } from '../order-csv-parser.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccessionComponent } from '../../shared/accession/accession.component';
import { DecimalPipe } from '@angular/common';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'rb-csv-modal',
  templateUrl: './csv-modal.component.html',
  styleUrl: './csv-modal.component.scss',
  imports: [TranslateModule, ReactiveFormsModule, FormControlValidationDirective, AccessionComponent, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsvModalComponent {
  private readonly modal = inject(NgbActiveModal);

  readonly form = inject(NonNullableFormBuilder).group({
    csv: ''
  });
  readonly result: Signal<CsvResult>;

  constructor() {
    const csvParser = inject(OrderCsvParserService);
    this.result = toSignal(this.form.controls.csv.valueChanges.pipe(map(csv => csvParser.parse(csv))), {
      initialValue: {
        errors: [],
        items: []
      }
    });
  }

  close() {
    this.modal.close(this.result().items);
  }

  dismiss() {
    this.modal.dismiss();
  }
}
