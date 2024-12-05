import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CsvResult, OrderCsvParserService } from '../order-csv-parser.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccessionComponent } from '../../shared/accession/accession.component';
import { DecimalPipe } from '@angular/common';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-csv-modal',
  templateUrl: './csv-modal.component.html',
  styleUrl: './csv-modal.component.scss',
  imports: [TranslateModule, ReactiveFormsModule, FormControlValidationDirective, AccessionComponent, DecimalPipe]
})
export class CsvModalComponent {
  private modal = inject(NgbActiveModal);

  form = inject(NonNullableFormBuilder).group({
    csv: ''
  });
  result: CsvResult = {
    errors: [],
    items: []
  };

  constructor() {
    const csvParser = inject(OrderCsvParserService);
    this.form.controls.csv.valueChanges.subscribe(csv => (this.result = csvParser.parse(csv)));
  }

  close() {
    this.modal.close(this.result.items);
  }

  dismiss() {
    this.modal.dismiss();
  }
}
