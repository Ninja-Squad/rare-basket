import { TestBed } from '@angular/core/testing';

import { EditOrderComponent } from './edit-order.component';
import { Component } from '@angular/core';
import { Order, OrderCommand } from '../order.model';
import { ComponentTester, speculoosMatchers, TestButton } from 'ngx-speculoos';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { ValdemortModule } from 'ngx-valdemort';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';

@Component({
  template: '<rb-edit-order [order]="order" (cancelled)="cancelled = true" (saved)="saved = $event"></rb-edit-order>'
})
class TestComponent {
  cancelled = false;
  saved: OrderCommand = null;

  order = {
    items: [
      {
        id: 34,
        accession: {
          name: 'rosa',
          identifier: 'rosa1'
        },
        quantity: null
      },
      {
        id: 35,
        accession: {
          name: 'violetta',
          identifier: 'violetta1'
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

  identifier(index: number) {
    return this.input(`#identifier-${index}`);
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
    return this.button('#add-item-button');
  }

  get saveButton() {
    return this.button('#save-button');
  }

  get cancelButton() {
    return this.button('#cancel-button');
  }

  get errors() {
    return this.elements('.invalid-feedback div');
  }
}

describe('EditOrderComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule, FontAwesomeModule, ReactiveFormsModule, ValdemortModule],
      declarations: [EditOrderComponent, TestComponent, ValidationDefaultsComponent]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    tester = new TestComponentTester();
    tester.detectChanges();
    jasmine.addMatchers(speculoosMatchers);
  });

  it('should display a filled form', () => {
    expect(tester.items.length).toBe(2);

    expect(tester.name(0)).toHaveValue('rosa');
    expect(tester.identifier(0)).toHaveValue('rosa1');
    expect(tester.quantity(0)).toHaveValue('');
    expect(tester.unit(0)).toHaveValue('');
    expect(tester.deleteButton(1).disabled).toBe(false);

    expect(tester.name(1)).toHaveValue('violetta');
    expect(tester.identifier(1)).toHaveValue('violetta1');
    expect(tester.quantity(1)).toHaveValue('12');
    expect(tester.unit(1)).toHaveValue('bags');
    expect(tester.deleteButton(1).disabled).toBe(false);
  });

  it('should add an item', () => {
    tester.addItemButton.click();

    expect(tester.items.length).toBe(3);
    expect(tester.name(2)).toHaveValue('');
    expect(tester.identifier(2)).toHaveValue('');
    expect(tester.quantity(2)).toHaveValue('');
    expect(tester.unit(2)).toHaveValue('');
  });

  it('should delete an item', () => {
    tester.deleteButton(0).click();

    expect(tester.items.length).toBe(1);
    expect(tester.name(0)).toHaveValue('violetta');
    expect(tester.identifier(0)).toHaveValue('violetta1');
    expect(tester.quantity(0)).toHaveValue('12');
    expect(tester.unit(0)).toHaveValue('bags');
    expect(tester.deleteButton(0).disabled).toBe(true); // last item: not deletable
  });

  it('should validate', () => {
    tester.name(0).fillWith('');
    tester.identifier(0).fillWith('');
    tester.quantity(0).fillWith('0');
    tester.saveButton.click();

    expect(tester.componentInstance.saved).toBeNull();
    expect(tester.errors.length).toBe(3);
  });

  it('should cancel', () => {
    tester.cancelButton.click();
    expect(tester.componentInstance.cancelled).toBe(true);
  });

  it('should save', () => {
    tester.deleteButton(0).click();
    tester.name(0).fillWith('VIOLETTA');
    tester.addItemButton.click();
    tester.name(1).fillWith('bacteria');
    tester.identifier(1).fillWith('bacteria1');

    tester.saveButton.click();

    expect(tester.componentInstance.saved).toEqual({
      items: [
        {
          accession: {
            name: 'VIOLETTA',
            identifier: 'violetta1'
          },
          quantity: 12,
          unit: 'bags'
        },
        {
          accession: {
            name: 'bacteria',
            identifier: 'bacteria1'
          },
          quantity: null,
          unit: null
        }
      ]
    });
  });
});
