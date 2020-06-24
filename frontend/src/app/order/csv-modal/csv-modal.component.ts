import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CsvResult, OrderCsvParserService } from '../order-csv-parser.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rb-csv-modal',
  templateUrl: './csv-modal.component.html',
  styleUrls: ['./csv-modal.component.scss']
})
export class CsvModalComponent {
  form: FormGroup;
  result: CsvResult = {
    errors: [],
    items: []
  };

  constructor(fb: FormBuilder, private modal: NgbActiveModal, private csvParser: OrderCsvParserService) {
    const csvControl = fb.control('');
    this.form = fb.group({
      csv: csvControl
    });

    csvControl.valueChanges.subscribe(csv => (this.result = this.csvParser.parse(csv)));
  }

  close() {
    this.modal.close(this.result.items);
  }

  dismiss() {
    this.modal.dismiss();
  }
}
