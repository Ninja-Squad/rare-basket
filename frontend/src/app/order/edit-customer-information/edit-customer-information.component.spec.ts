import { TestBed } from '@angular/core/testing';

import { EditCustomerInformationComponent } from './edit-customer-information.component';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { Component } from '@angular/core';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES } from '../../basket/basket.model';
import { CustomerInformationCommand } from '../order.model';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { ValdemortModule } from 'ngx-valdemort';
import { ReactiveFormsModule } from '@angular/forms';
import { LanguageEnumPipe } from '../language-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';

@Component({
  template: `
    <rb-edit-customer-information
      [customerInformation]="customerInformation"
      [smallButtons]="smallButtons"
      (saved)="command = $event"
      (cancelled)="cancelled = true"
    >
    </rb-edit-customer-information>
  `
})
class TestComponent {
  customerInformation: CustomerInformationCommand = {
    customer: {
      name: 'John',
      organization: 'Wheat SA',
      email: 'john@mail.com',
      deliveryAddress: '1, Main Street',
      type: 'FARMER',
      language: 'en'
    },
    rationale: 'The rationale'
  };
  command: CustomerInformationCommand = null;
  cancelled = false;
  smallButtons = true;
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

  get deliveryAddress() {
    return this.textarea('#delivery-address');
  }

  get type() {
    return this.select('#type');
  }

  get language() {
    return this.select('#language');
  }

  get rationale() {
    return this.textarea('#rationale');
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
      declarations: [EditCustomerInformationComponent, TestComponent, ValidationDefaultsComponent, LanguageEnumPipe, CustomerTypeEnumPipe]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    tester = new TestComponentTester();
    jasmine.addMatchers(speculoosMatchers);
  });

  it('should display a filled form', () => {
    tester.detectChanges();

    expect(tester.name).toHaveValue('John');
    expect(tester.organization).toHaveValue('Wheat SA');
    expect(tester.email).toHaveValue('john@mail.com');
    expect(tester.deliveryAddress).toHaveValue('1, Main Street');
    expect(tester.type.optionLabels.length).toBe(ALL_CUSTOMER_TYPES.length + 1);
    expect(tester.type).toHaveSelectedLabel('Agriculteur');
    expect(tester.language.optionLabels.length).toBe(ALL_LANGUAGES.length + 1);
    expect(tester.language).toHaveSelectedLabel('Anglais');
    expect(tester.rationale).toHaveValue('The rationale');

    expect(tester.saveButton).toHaveClass('btn-sm');
    expect(tester.cancelButton).toHaveClass('btn-sm');
  });

  it('should not save if invalid', () => {
    tester.detectChanges();

    tester.name.fillWith('');
    tester.organization.fillWith('');
    tester.email.fillWith('');
    tester.deliveryAddress.fillWith('');
    tester.type.selectLabel('');
    tester.language.selectLabel('');
    tester.rationale.fillWith('');

    tester.saveButton.click();

    expect(tester.componentInstance.command).toBeNull();
    // name, email, delivery address, type, language are mandatory, but not organization nor rationale
    expect(tester.errors.length).toBe(5);

    tester.email.fillWith('notAnEmail');
    expect(tester.errors.length).toBe(5);
  });

  it('should save', () => {
    tester.detectChanges();

    tester.name.fillWith('Jane');
    tester.organization.fillWith('Wheat SAS');
    tester.email.fillWith('jane@mail.com');
    tester.deliveryAddress.fillWith('2, Main Street');
    tester.type.selectLabel('Autre');
    tester.language.selectLabel('Français');
    tester.rationale.fillWith('foo');

    tester.saveButton.click();

    const expectedCommand: CustomerInformationCommand = {
      customer: {
        name: 'Jane',
        organization: 'Wheat SAS',
        email: 'jane@mail.com',
        deliveryAddress: '2, Main Street',
        type: 'OTHER',
        language: 'fr'
      },
      rationale: 'foo'
    };
    expect(tester.componentInstance.command).toEqual(expectedCommand);
  });

  it('should cancel', () => {
    tester.detectChanges();

    tester.cancelButton.click();
    expect(tester.componentInstance.cancelled).toBe(true);
  });

  it('should support creation and display an empty form', () => {
    tester.componentInstance.customerInformation = null;
    tester.componentInstance.smallButtons = false;
    tester.detectChanges();

    expect(tester.name).toHaveValue('');
    expect(tester.organization).toHaveValue('');
    expect(tester.email).toHaveValue('');
    expect(tester.deliveryAddress).toHaveValue('');
    expect(tester.type).toHaveSelectedLabel('');
    expect(tester.language).toHaveSelectedLabel('');
    expect(tester.rationale).toHaveValue('');
    expect(tester.saveButton).not.toHaveClass('btn-sm');
    expect(tester.cancelButton).not.toHaveClass('btn-sm');
  });
});
