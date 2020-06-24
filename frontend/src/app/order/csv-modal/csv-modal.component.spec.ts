import { TestBed } from '@angular/core/testing';

import { CsvModalComponent } from './csv-modal.component';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { OrderCsvParserService } from '../order-csv-parser.service';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { OrderItemCommand } from '../order.model';

class CsvModalComponentTester extends ComponentTester<CsvModalComponent> {
  constructor() {
    super(CsvModalComponent);
  }

  get csv() {
    return this.textarea('textarea');
  }

  get csvErrorsAlert() {
    return this.element('.alert');
  }

  get csvErrors() {
    return this.elements('.csv-error');
  }

  get items() {
    return this.elements('.order-item');
  }

  get addItemsButton() {
    return this.button('#add-items-button');
  }

  get dismissButton() {
    return this.button('#dismiss-button');
  }
}

describe('CsvModalComponent', () => {
  let tester: CsvModalComponentTester;
  let parser: jasmine.SpyObj<OrderCsvParserService>;
  let activeModal: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(() => {
    parser = jasmine.createSpyObj<OrderCsvParserService>('OrderCsvParserService', ['parse']);
    activeModal = jasmine.createSpyObj<NgbActiveModal>('NgbActiveModal', ['close', 'dismiss']);

    TestBed.configureTestingModule({
      declarations: [CsvModalComponent],
      imports: [ReactiveFormsModule, I18nTestingModule, SharedModule],
      providers: [
        { provide: OrderCsvParserService, useValue: parser },
        { provide: NgbActiveModal, useValue: activeModal }
      ]
    });

    tester = new CsvModalComponentTester();

    jasmine.addMatchers(speculoosMatchers);

    tester.detectChanges();
  });

  it('should display no error and no item initially', () => {
    expect(tester.csv).toHaveValue('');
    expect(tester.csvErrorsAlert).toBeNull();
    expect(tester.items.length).toBe(0);
    expect(tester.addItemsButton.disabled).toBe(true);
  });

  it('should parse and display errors', () => {
    parser.parse.and.returnValue({
      errors: [
        {
          row: 0,
          key: 'order.order-csv-parser.MissingQuotes'
        }
      ],
      items: []
    });

    tester.csv.fillWith('foo;"');
    expect(tester.csvErrorsAlert).not.toBeNull();
    expect(tester.csvErrors.length).toBe(1);
    expect(tester.csvErrors[0].element('th')).toHaveText('1');
    expect(tester.csvErrors[0].element('td')).toHaveText('Apostrophes manquantes');
    expect(tester.items.length).toBe(0);
    expect(tester.addItemsButton.disabled).toBe(true);
  });

  it('should parse and display items', () => {
    parser.parse.and.returnValue({
      errors: [],
      items: [
        {
          accession: {
            name: 'rosa',
            identifier: 'rosa1'
          },
          quantity: null,
          unit: null
        },
        {
          accession: {
            name: 'violetta',
            identifier: 'violetta1'
          },
          quantity: 1000,
          unit: 'graines'
        }
      ]
    });

    tester.csv.fillWith('correct"');
    expect(tester.csvErrorsAlert).toBeNull();
    expect(tester.items.length).toBe(2);
    expect(tester.items[0]).toContainText('rosa rosa1');
    expect(tester.items[1]).toContainText('violetta violetta1');
    expect(tester.items[1]).toContainText('1 000 graines');

    expect(tester.addItemsButton.disabled).toBe(false);
  });

  it('should add items', () => {
    const items: Array<OrderItemCommand> = [
      {
        accession: {
          name: 'rosa',
          identifier: 'rosa1'
        },
        quantity: null,
        unit: null
      }
    ];
    parser.parse.and.returnValue({
      errors: [],
      items
    });

    tester.csv.fillWith('correct"');
    tester.addItemsButton.click();
    expect(activeModal.close).toHaveBeenCalledWith(items);
  });

  it('should dismiss', () => {
    tester.dismissButton.click();
    expect(activeModal.dismiss).toHaveBeenCalled();
  });
});
