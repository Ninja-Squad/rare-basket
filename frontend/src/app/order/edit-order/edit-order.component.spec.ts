import { TestBed } from '@angular/core/testing';

import { EditOrderComponent } from './edit-order.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Order, OrderCommand, OrderItemCommand } from '../order.model';
import { ComponentTester, createMock, TestButton } from 'ngx-speculoos';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { MockModalService, provideModalTesting } from '../../rb-ngb/mock-modal.service.spec';
import { CsvModalComponent } from '../csv-modal/csv-modal.component';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

@Component({
  template: '<rb-edit-order [order]="order" (cancelled)="cancelled.set(true)" (saved)="saved.set($event)" />',
  imports: [EditOrderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  readonly cancelled = signal(false);
  readonly saved = signal<OrderCommand | null>(null);

  order = {
    items: [
      {
        id: 34,
        accession: {
          name: 'rosa',
          identifier: 'rosa1',
          accessionNumber: 'rosaNumber',
          taxon: 'rosaTaxon',
          url: 'https://rosa.com'
        },
        quantity: null
      },
      {
        id: 35,
        accession: {
          name: 'violetta',
          identifier: null,
          accessionNumber: null,
          taxon: 'violettaTaxon',
          url: null
        },
        quantity: 12,
        unit: 'bags'
      }
    ]
  } as Order;
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get items() {
    return this.elements('.edit-order-item');
  }

  name(index: number) {
    return this.input(`#name-${index}`);
  }

  accessionNumber(index: number) {
    return this.input(`#accession-number-${index}`);
  }

  taxon(index: number) {
    return this.input(`#taxon-${index}`);
  }

  quantity(index: number) {
    return this.input(`#quantity-${index}`);
  }

  unit(index: number) {
    return this.input(`#unit-${index}`);
  }

  deleteButton(index: number) {
    return this.elements('.delete-order-item')[index] as TestButton;
  }

  get addItemButton() {
    return this.button('#add-item-button')!;
  }

  get csvButton() {
    return this.button('#csv-button')!;
  }

  get saveButton() {
    return this.button('#save-button')!;
  }

  get cancelButton() {
    return this.button('#cancel-button')!;
  }

  get errors() {
    return this.elements('.invalid-feedback div');
  }
}

describe('EditOrderComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), provideModalTesting()]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    tester = new TestComponentTester();
  });

  it('should display a filled form', async () => {
    await tester.stable();
    expect(tester.items.length).toBe(2);

    expect(tester.name(0)).toHaveValue('rosa');
    expect(tester.accessionNumber(0)).toHaveValue('rosaNumber');
    expect(tester.taxon(0)).toHaveValue('rosaTaxon');
    expect(tester.quantity(0)).toHaveValue('');
    expect(tester.unit(0)).toHaveValue('');
    expect(tester.deleteButton(1).disabled).toBe(false);

    expect(tester.name(1)).toHaveValue('violetta');
    expect(tester.accessionNumber(1)).toHaveValue('');
    expect(tester.taxon(1)).toHaveValue('violettaTaxon');
    expect(tester.quantity(1)).toHaveValue('12');
    expect(tester.unit(1)).toHaveValue('bags');
    expect(tester.deleteButton(1).disabled).toBe(false);
  });

  it('should add an item', async () => {
    await tester.stable();
    await tester.addItemButton.click();

    expect(tester.items.length).toBe(3);
    expect(tester.name(2)).toHaveValue('');
    expect(tester.accessionNumber(2)).toHaveValue('');
    expect(tester.taxon(2)).toHaveValue('');
    expect(tester.quantity(2)).toHaveValue('');
    expect(tester.unit(2)).toHaveValue('');
  });

  it('should delete an item', async () => {
    await tester.stable();
    await tester.deleteButton(0).click();

    expect(tester.items.length).toBe(1);
    expect(tester.name(0)).toHaveValue('violetta');
    expect(tester.accessionNumber(0)).toHaveValue('');
    expect(tester.taxon(0)).toHaveValue('violettaTaxon');
    expect(tester.quantity(0)).toHaveValue('12');
    expect(tester.unit(0)).toHaveValue('bags');
    expect(tester.deleteButton(0).disabled).toBe(true); // last item: not deletable
  });

  it('should validate', async () => {
    await tester.stable();
    await tester.name(0)!.fillWith('');
    await tester.accessionNumber(0)!.fillWith('');
    await tester.taxon(0)!.fillWith('');
    await tester.quantity(0)!.fillWith('0');
    await tester.saveButton.click();

    expect(tester.componentInstance.saved()).toBeNull();
    expect(tester.errors.length).toBe(3);
  });

  it('should cancel', async () => {
    await tester.stable();
    await tester.cancelButton.click();
    expect(tester.componentInstance.cancelled()).toBe(true);
  });

  it('should save', async () => {
    await tester.stable();
    await tester.deleteButton(1).click();
    await tester.name(0)!.fillWith('ROSA');
    await tester.quantity(0)!.fillWith('10');
    await tester.unit(0)!.fillWith('pieces');
    await tester.addItemButton.click();
    await tester.name(1)!.fillWith('bacteria');
    await tester.taxon(1)!.fillWith('bacteriaTaxon');

    await tester.saveButton.click();

    expect(tester.componentInstance.saved()).toEqual({
      items: [
        {
          accession: {
            name: 'ROSA',
            identifier: 'rosa1',
            accessionNumber: 'rosaNumber',
            taxon: 'rosaTaxon',
            url: 'https://rosa.com'
          },
          quantity: 10,
          unit: 'pieces'
        },
        {
          accession: {
            name: 'bacteria',
            identifier: null,
            accessionNumber: null,
            taxon: 'bacteriaTaxon',
            url: null
          },
          quantity: null,
          unit: null
        }
      ]
    });
  });

  it('should add a first item if order does not have any', async () => {
    tester.componentInstance.order.items = [];
    await tester.stable();

    expect(tester.items.length).toBe(1);

    expect(tester.name(0)).toHaveValue('');
    expect(tester.accessionNumber(0)).toHaveValue('');
    expect(tester.taxon(0)).toHaveValue('');
    expect(tester.quantity(0)).toHaveValue('');
    expect(tester.unit(0)).toHaveValue('');
  });

  it('should open a CSV modal and add the entered items', async () => {
    const enteredItems: Array<OrderItemCommand> = [
      {
        accession: { name: 'rosa', identifier: null, accessionNumber: 'rosa2', taxon: 'rosa2Taxon', url: null },
        quantity: null,
        unit: null
      },
      {
        accession: { name: 'bolet', identifier: null, accessionNumber: 'bolet1', taxon: 'boletTaxon', url: null },
        quantity: 5,
        unit: 'pièces'
      }
    ];

    const modalService: MockModalService<CsvModalComponent> = TestBed.inject(MockModalService);
    modalService.mockClosedModal(createMock(CsvModalComponent), enteredItems);

    await tester.stable();

    await tester.csvButton.click();

    expect(tester.items.length).toBe(4);
    expect(tester.name(2)).toHaveValue('rosa');
    expect(tester.accessionNumber(2)).toHaveValue('rosa2');
    expect(tester.taxon(2)).toHaveValue('rosa2Taxon');
    expect(tester.quantity(2)).toHaveValue('');
    expect(tester.unit(2)).toHaveValue('');

    expect(tester.name(3)).toHaveValue('bolet');
    expect(tester.accessionNumber(3)).toHaveValue('bolet1');
    expect(tester.taxon(3)).toHaveValue('boletTaxon');
    expect(tester.quantity(3)).toHaveValue('5');
    expect(tester.unit(3)).toHaveValue('pièces');
  });

  it('should open a CSV modal and remove the last blank item before adding the entered items', async () => {
    const enteredItems: Array<OrderItemCommand> = [
      {
        accession: {
          name: 'rosa',
          identifier: 'rosa2',
          accessionNumber: null,
          taxon: 'rosa2Taxon',
          url: 'https://rosa2.com'
        },
        quantity: null,
        unit: null
      }
    ];

    const modalService: MockModalService<CsvModalComponent> = TestBed.inject(MockModalService);
    modalService.mockClosedModal(createMock(CsvModalComponent), enteredItems);

    await tester.stable();

    await tester.addItemButton.click(); // add a new blank item
    await tester.csvButton.click();

    expect(tester.items.length).toBe(3);
    expect(tester.name(2)).toHaveValue('rosa');
  });
});
