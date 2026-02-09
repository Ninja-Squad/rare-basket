import { TestBed } from '@angular/core/testing';

import { CsvModalComponent } from './csv-modal.component';
import { createMock, MockObject } from '../../../test/mock';
import { OrderCsvParserService } from '../order-csv-parser.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderItemCommand } from '../order.model';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

class CsvModalComponentTester {
  readonly fixture = TestBed.createComponent(CsvModalComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly csv = this.root.getByCss('textarea');
  readonly csvErrorsAlert = this.root.getByCss('.alert');
  readonly csvErrors = this.root.getByCss('.csv-error');
  readonly items = this.root.getByCss('.order-item');
  readonly addItemsButton = this.root.getByCss('#add-items-button');
  readonly dismissButton = this.root.getByCss('#dismiss-button');
}

describe('CsvModalComponent', () => {
  let tester: CsvModalComponentTester;
  let parser: MockObject<OrderCsvParserService>;
  let activeModal: MockObject<NgbActiveModal>;

  beforeEach(async () => {
    parser = createMock(OrderCsvParserService);
    activeModal = createMock(NgbActiveModal);

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        { provide: OrderCsvParserService, useValue: parser },
        { provide: NgbActiveModal, useValue: activeModal }
      ]
    });

    tester = new CsvModalComponentTester();

    await tester.fixture.whenStable();
  });

  test('should display no error and no item initially', async () => {
    await expect.element(tester.csv).toHaveDisplayValue('');
    await expect.element(tester.csvErrorsAlert).toHaveLength(0);
    await expect.element(tester.items).toHaveLength(0);
    await expect.element(tester.addItemsButton).toBeDisabled();
  });

  test('should parse and display errors', async () => {
    parser.parse.mockReturnValue({
      errors: [
        {
          row: 0,
          key: 'order.order-csv-parser.MissingQuotes'
        }
      ],
      items: []
    });

    await tester.csv.fill('foo;"');
    await expect.element(tester.csvErrorsAlert).toBeInTheDocument();
    await expect.element(tester.csvErrors).toHaveLength(1);
    await expect.element(tester.csvErrors.nth(0).getByCss('th')).toHaveTextContent('1');
    await expect.element(tester.csvErrors.nth(0).getByCss('td')).toHaveTextContent('Apostrophes manquantes');
    await expect.element(tester.items).toHaveLength(0);
    await expect.element(tester.addItemsButton).toBeDisabled();
  });

  test('should parse and display items', async () => {
    parser.parse.mockReturnValue({
      errors: [],
      items: [
        {
          accession: {
            name: 'rosaName',
            identifier: null,
            accessionNumber: 'rosa1',
            taxon: 'rosaTaxon',
            url: null
          },
          quantity: null,
          unit: null
        },
        {
          accession: {
            name: 'violettaName',
            identifier: null,
            accessionNumber: 'violetta1',
            taxon: 'violettaTaxon',
            url: null
          },
          quantity: 1000,
          unit: 'graines'
        }
      ]
    });

    await tester.csv.fill('correct"');
    await expect.element(tester.csvErrorsAlert).not.toBeInTheDocument();
    await expect.element(tester.items).toHaveLength(2);
    await expect.element(tester.items.nth(0)).toHaveTextContent('rosaName');
    await expect.element(tester.items.nth(0)).toHaveTextContent('rosa1');
    await expect.element(tester.items.nth(0)).toHaveTextContent('rosaTaxon');
    await expect.element(tester.items.nth(1)).toHaveTextContent('violettaName');
    await expect.element(tester.items.nth(1)).toHaveTextContent('violetta1');
    await expect.element(tester.items.nth(1)).toHaveTextContent('violettaTaxon');
    await expect.element(tester.items.nth(1)).toHaveTextContent(/1\s*000 graines/);

    await expect.element(tester.addItemsButton).not.toBeDisabled();
  });

  test('should add items', async () => {
    const items: Array<OrderItemCommand> = [
      {
        accession: {
          name: 'rosa',
          identifier: null,
          accessionNumber: 'rosa1',
          taxon: 'rosaTaxon',
          url: null
        },
        quantity: null,
        unit: null
      }
    ];
    parser.parse.mockReturnValue({
      errors: [],
      items
    });

    await tester.csv.fill('correct"');
    await tester.addItemsButton.click();
    expect(activeModal.close).toHaveBeenCalledWith(items);
  });

  test('should dismiss', async () => {
    await tester.dismissButton.click();
    expect(activeModal.dismiss).toHaveBeenCalled();
  });
});
