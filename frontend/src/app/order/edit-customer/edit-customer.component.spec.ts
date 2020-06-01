import { TestBed } from '@angular/core/testing';

import { EditCustomerComponent } from './edit-customer.component';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { Component } from '@angular/core';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES, Customer } from '../../basket/basket.model';
import { OrderCustomerCommand } from '../order.model';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { ValdemortModule } from 'ngx-valdemort';
import { ReactiveFormsModule } from '@angular/forms';
import { LanguageEnumPipe } from '../language-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';

@Component({
  template: '<rb-edit-customer [customer]="customer" (saved)="command = $event" (cancelled)="cancelled = true"></rb-edit-customer>'
})
class TestComponent {
  customer: Customer = {
    name: 'John',
    organization: 'Wheat SA',
    email: 'john@mail.com',
    address: '1, Main Street',
    type: 'FARMER',
    language: 'en'
  };
  command: OrderCustomerCommand = null;
  cancelled = false;
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get name() {
    return this.input('#name');
  }

  get organization() {
    return this.input('#organization');
  }

  get email() {
    return this.input('#email');
  }

  get address() {
    return this.textarea('#address');
  }

  get type() {
    return this.select('#type');
  }

  get language() {
    return this.select('#language');
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

describe('EditCustomerComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule, ReactiveFormsModule, ValdemortModule],
      declarations: [EditCustomerComponent, TestComponent, ValidationDefaultsComponent, LanguageEnumPipe, CustomerTypeEnumPipe]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    tester = new TestComponentTester();
    tester.detectChanges();
    jasmine.addMatchers(speculoosMatchers);
  });

  it('should display a filled form', () => {
    expect(tester.name).toHaveValue('John');
    expect(tester.organization).toHaveValue('Wheat SA');
    expect(tester.email).toHaveValue('john@mail.com');
    expect(tester.address).toHaveValue('1, Main Street');
    expect(tester.type.optionLabels.length).toBe(ALL_CUSTOMER_TYPES.length);
    expect(tester.type).toHaveSelectedLabel('Agriculteur');
    expect(tester.language.optionLabels.length).toBe(ALL_LANGUAGES.length);
    expect(tester.language).toHaveSelectedLabel('Anglais');
  });

  it('should not save if invalid', () => {
    tester.name.fillWith('');
    tester.organization.fillWith('');
    tester.email.fillWith('');
    tester.address.fillWith('');

    tester.saveButton.click();

    expect(tester.componentInstance.command).toBeNull();
    // name, email, address are mandatory, but not organization
    expect(tester.errors.length).toBe(3);

    tester.email.fillWith('notAnEmail');
    expect(tester.errors.length).toBe(3);
  });

  it('should save', () => {
    tester.name.fillWith('Jane');
    tester.organization.fillWith('Wheat SAS');
    tester.email.fillWith('jane@mail.com');
    tester.address.fillWith('2, Main Street');
    tester.type.selectLabel('Autre');
    tester.language.selectLabel('Français');

    tester.saveButton.click();

    const expectedCommand: OrderCustomerCommand = {
      name: 'Jane',
      organization: 'Wheat SAS',
      email: 'jane@mail.com',
      address: '2, Main Street',
      type: 'OTHER',
      language: 'fr'
    };
    expect(tester.componentInstance.command).toEqual(expectedCommand);
  });

  it('should cancel', () => {
    tester.cancelButton.click();
    expect(tester.componentInstance.cancelled).toBe(true);
  });
});
