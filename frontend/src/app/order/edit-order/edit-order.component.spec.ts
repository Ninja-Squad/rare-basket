import { TestBed } from '@angular/core/testing';

import { EditOrderComponent } from './edit-order.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Order, OrderCommand, OrderItemCommand } from '../order.model';
import { createMock } from '../../../test/mock';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { MockModalService, provideModalTesting } from '../../rb-ngb/mock-modal.service';
import { CsvModalComponent } from '../csv-modal/csv-modal.component';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

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

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly items = this.root.getByCss('.edit-order-item');
  readonly addItemButton = this.root.getByCss('#add-item-button');
  readonly csvButton = this.root.getByCss('#csv-button');
  readonly saveButton = this.root.getByCss('#save-button');
  readonly cancelButton = this.root.getByCss('#cancel-button');
  readonly errors = this.root.getByCss('.invalid-feedback div');

  get componentInstance() {
    return this.fixture.componentInstance;
  }

  name(index: number) {
    return this.root.getByCss(`#name-${index}`);
  }

  accessionNumber(index: number) {
    return this.root.getByCss(`#accession-number-${index}`);
  }

  taxon(index: number) {
    return this.root.getByCss(`#taxon-${index}`);
  }

  quantity(index: number) {
    return this.root.getByCss(`#quantity-${index}`);
  }

  unit(index: number) {
    return this.root.getByCss(`#unit-${index}`);
  }

  deleteButton(index: number) {
    return this.root.getByCss('.delete-order-item').nth(index);
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

  test('should display a filled form', async () => {
    await expect.element(tester.items).toHaveLength(2);

    await expect.element(tester.name(0)).toHaveValue('rosa');
    await expect.element(tester.accessionNumber(0)).toHaveValue('rosaNumber');
    await expect.element(tester.taxon(0)).toHaveValue('rosaTaxon');
    await expect.element(tester.quantity(0)).toHaveDisplayValue('');
    await expect.element(tester.unit(0)).toHaveValue('');
    await expect.element(tester.deleteButton(1)).not.toBeDisabled();

    await expect.element(tester.name(1)).toHaveValue('violetta');
    await expect.element(tester.accessionNumber(1)).toHaveValue('');
    await expect.element(tester.taxon(1)).toHaveValue('violettaTaxon');
    await expect.element(tester.quantity(1)).toHaveValue(12);
    await expect.element(tester.unit(1)).toHaveValue('bags');
    await expect.element(tester.deleteButton(1)).not.toBeDisabled();
  });

  test('should add an item', async () => {
    await tester.addItemButton.click();

    await expect.element(tester.items).toHaveLength(3);
    await expect.element(tester.name(2)).toHaveValue('');
    await expect.element(tester.accessionNumber(2)).toHaveValue('');
    await expect.element(tester.taxon(2)).toHaveValue('');
    await expect.element(tester.quantity(2)).toHaveDisplayValue('');
    await expect.element(tester.unit(2)).toHaveValue('');
  });

  test('should delete an item', async () => {
    await tester.deleteButton(0).click();

    await expect.element(tester.items).toHaveLength(1);
    await expect.element(tester.name(0)).toHaveValue('violetta');
    await expect.element(tester.accessionNumber(0)).toHaveValue('');
    await expect.element(tester.taxon(0)).toHaveValue('violettaTaxon');
    await expect.element(tester.quantity(0)).toHaveValue(12);
    await expect.element(tester.unit(0)).toHaveValue('bags');
    await expect.element(tester.deleteButton(0)).toBeDisabled(); // last item: not deletable
  });

  test('should validate', async () => {
    await tester.name(0).fill('');
    await tester.accessionNumber(0).fill('');
    await tester.taxon(0).fill('');
    await tester.quantity(0).fill('0');
    await tester.saveButton.click();

    expect(tester.componentInstance.saved()).toBeNull();
    await expect.element(tester.errors).toHaveLength(3);
  });

  test('should cancel', async () => {
    await tester.cancelButton.click();
    expect(tester.componentInstance.cancelled()).toBe(true);
  });

  test('should save', async () => {
    await tester.deleteButton(1).click();
    await tester.name(0).fill('ROSA');
    await tester.quantity(0).fill('10');
    await tester.unit(0).fill('pieces');
    await tester.addItemButton.click();
    await tester.name(1).fill('bacteria');
    await tester.taxon(1).fill('bacteriaTaxon');

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

  test('should add a first item if order does not have any', async () => {
    tester.componentInstance.order.items = [];

    await expect.element(tester.items).toHaveLength(1);

    await expect.element(tester.name(0)).toHaveValue('');
    await expect.element(tester.accessionNumber(0)).toHaveValue('');
    await expect.element(tester.taxon(0)).toHaveValue('');
    await expect.element(tester.quantity(0)).toHaveDisplayValue('');
    await expect.element(tester.unit(0)).toHaveValue('');
  });

  test('should open a CSV modal and add the entered items', async () => {
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

    await tester.csvButton.click();

    await expect.element(tester.items).toHaveLength(4);
    await expect.element(tester.name(2)).toHaveValue('rosa');
    await expect.element(tester.accessionNumber(2)).toHaveValue('rosa2');
    await expect.element(tester.taxon(2)).toHaveValue('rosa2Taxon');
    await expect.element(tester.quantity(2)).toHaveDisplayValue('');
    await expect.element(tester.unit(2)).toHaveValue('');

    await expect.element(tester.name(3)).toHaveValue('bolet');
    await expect.element(tester.accessionNumber(3)).toHaveValue('bolet1');
    await expect.element(tester.taxon(3)).toHaveValue('boletTaxon');
    await expect.element(tester.quantity(3)).toHaveValue(5);
    await expect.element(tester.unit(3)).toHaveValue('pièces');
  });

  test('should open a CSV modal and remove the last blank item before adding the entered items', async () => {
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

    await tester.addItemButton.click(); // add a new blank item
    await tester.csvButton.click();

    await expect.element(tester.items).toHaveLength(3);
    await expect.element(tester.name(2)).toHaveValue('rosa');
  });
});
