import { Component } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { CsvResult, OrderCsvParserService } from '../order-csv-parser.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rb-csv-modal',
  templateUrl: './csv-modal.component.html',
  styleUrls: ['./csv-modal.component.scss']
})
export class CsvModalComponent {
  form = this.fb.group({
    csv: ''
  });
  result: CsvResult = {
    errors: [],
    items: []
  };

  constructor(private fb: NonNullableFormBuilder, private modal: NgbActiveModal, private csvParser: OrderCsvParserService) {
    this.form.get('csv').valueChanges.subscribe(csv => (this.result = this.csvParser.parse(csv)));
  }

  close() {
    this.modal.close(this.result.items);
  }

  dismiss() {
    this.modal.dismiss();
  }
}
