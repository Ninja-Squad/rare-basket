import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CsvResult, OrderCsvParserService } from '../order-csv-parser.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccessionComponent } from '../../shared/accession/accession.component';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-csv-modal',
  templateUrl: './csv-modal.component.html',
  styleUrl: './csv-modal.component.scss',
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, FormControlValidationDirective, NgIf, NgFor, AccessionComponent, DecimalPipe]
})
export class CsvModalComponent {
  form = this.fb.group({
    csv: ''
  });
  result: CsvResult = {
    errors: [],
    items: []
  };

  constructor(
    private fb: NonNullableFormBuilder,
    private modal: NgbActiveModal,
    private csvParser: OrderCsvParserService
  ) {
    this.form.get('csv').valueChanges.subscribe(csv => (this.result = this.csvParser.parse(csv)));
  }

  close() {
    this.modal.close(this.result.items);
  }

  dismiss() {
    this.modal.dismiss();
  }
}
