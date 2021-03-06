import { TestBed } from '@angular/core/testing';

import { EditCustomerInformationComponent } from './edit-customer-information.component';
import { ComponentTester } from 'ngx-speculoos';
import { Component } from '@angular/core';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES } from '../../basket/basket.model';
import { CustomerInformationCommand } from '../order.model';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { ValdemortModule } from 'ngx-valdemort';
import { ReactiveFormsModule } from '@angular/forms';
import { LanguageEnumPipe } from '../../shared/language-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { RbNgbTestingModule } from '../../rb-ngb/rb-ngb-testing.module';

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
      billingAddress: '1, Main Street - billing service',
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

  get billingAddress() {
    return this.textarea('#billing-address');
  }

  get useDeliveryAddress() {
    return this.input('#use-delivery-address');
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
      imports: [I18nTestingModule, RbNgbTestingModule, ReactiveFormsModule, ValdemortModule],
      declarations: [EditCustomerInformationComponent, TestComponent, ValidationDefaultsComponent, LanguageEnumPipe, CustomerTypeEnumPipe]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    tester = new TestComponentTester();
  });

  it('should display a filled form', () => {
    tester.detectChanges();

    expect(tester.name).toHaveValue('John');
    expect(tester.organization).toHaveValue('Wheat SA');
    expect(tester.email).toHaveValue('john@mail.com');
    expect(tester.deliveryAddress).toHaveValue('1, Main Street');
    expect(tester.billingAddress).toHaveValue('1, Main Street - billing service');
    expect(tester.useDeliveryAddress).not.toBeChecked();
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
    tester.billingAddress.fillWith('');
    tester.type.selectLabel('');
    tester.language.selectLabel('');
    tester.rationale.fillWith('');

    tester.saveButton.click();

    expect(tester.componentInstance.command).toBeNull();
    // name, email, delivery address, billing address, type, language are mandatory, but not organization nor rationale
    expect(tester.errors.length).toBe(6);

    tester.email.fillWith('notAnEmail');
    expect(tester.errors.length).toBe(6);
  });

  it('should save', () => {
    tester.detectChanges();

    tester.name.fillWith('Jane');
    tester.organization.fillWith('Wheat SAS');
    tester.email.fillWith('jane@mail.com');
    tester.deliveryAddress.fillWith('2, Main Street');
    tester.billingAddress.fillWith('2, Main Street - billing service');
    tester.type.selectLabel('Autre');
    tester.language.selectLabel('Fran??ais');
    tester.rationale.fillWith('foo');

    tester.saveButton.click();

    const expectedCommand: CustomerInformationCommand = {
      customer: {
        name: 'Jane',
        organization: 'Wheat SAS',
        email: 'jane@mail.com',
        deliveryAddress: '2, Main Street',
        billingAddress: '2, Main Street - billing service',
        type: 'OTHER',
        language: 'fr'
      },
      rationale: 'foo'
    };
    expect(tester.componentInstance.command).toEqual(expectedCommand);
  });

  it('should use the delivery address as the billing address', () => {
    tester.detectChanges();

    tester.name.fillWith('Jane');
    tester.organization.fillWith('Wheat SAS');
    tester.email.fillWith('jane@mail.com');
    tester.deliveryAddress.fillWith('2, Main Street');
    tester.useDeliveryAddress.check();
    expect(tester.billingAddress.disabled).toBe(true);
    tester.type.selectLabel('Autre');
    tester.language.selectLabel('Fran??ais');
    tester.rationale.fillWith('foo');

    tester.saveButton.click();
    expect(tester.componentInstance.command.customer.billingAddress).toEqual(tester.componentInstance.command.customer.deliveryAddress);
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
    expect(tester.billingAddress).toHaveValue('');
    expect(tester.useDeliveryAddress).not.toBeChecked();
    expect(tester.type).toHaveSelectedLabel('');
    expect(tester.language).toHaveSelectedLabel('');
    expect(tester.rationale).toHaveValue('');
    expect(tester.saveButton).not.toHaveClass('btn-sm');
    expect(tester.cancelButton).not.toHaveClass('btn-sm');
  });
});
