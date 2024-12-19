import { TestBed } from '@angular/core/testing';

import { EditCustomerInformationComponent } from './edit-customer-information.component';
import { ComponentTester } from 'ngx-speculoos';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES } from '../../basket/basket.model';
import { CustomerInformationCommand } from '../order.model';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

@Component({
  template: `
    <rb-edit-customer-information [customerInformation]="customerInformation" (saved)="command = $event" (cancelled)="cancelled = true" />
  `,
  imports: [EditCustomerInformationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  command: CustomerInformationCommand | null = null;
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

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });

    await TestBed.createComponent(ValidationDefaultsComponent).whenStable();

    tester = new TestComponentTester();
  });

  it('should display a filled form', async () => {
    await tester.stable();

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

  it('should not save if invalid', async () => {
    await tester.stable();

    await tester.name.fillWith('');
    await tester.organization.fillWith('');
    await tester.email.fillWith('');
    await tester.deliveryAddress.fillWith('');
    await tester.billingAddress.fillWith('');
    await tester.type.selectLabel('');
    await tester.language.selectLabel('');
    await tester.rationale.fillWith('');

    await tester.saveButton.click();

    expect(tester.componentInstance.command).toBeNull();
    // name, email, delivery address, billing address, type, language are mandatory, but not organization nor rationale
    expect(tester.errors.length).toBe(6);

    await tester.email.fillWith('notAnEmail');
    expect(tester.errors.length).toBe(6);
  });

  it('should save', async () => {
    await tester.stable();

    await tester.name.fillWith('Jane');
    await tester.organization.fillWith('Wheat SAS');
    await tester.email.fillWith('jane@mail.com');
    await tester.deliveryAddress.fillWith('2, Main Street');
    await tester.billingAddress.fillWith('2, Main Street - billing service');
    await tester.type.selectLabel('Autre');
    await tester.language.selectLabel('Français');
    await tester.rationale.fillWith('foo');

    await tester.saveButton.click();

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

  it('should use the delivery address as the billing address', async () => {
    await tester.stable();

    await tester.name.fillWith('Jane');
    await tester.organization.fillWith('Wheat SAS');
    await tester.email.fillWith('jane@mail.com');
    await tester.deliveryAddress.fillWith('2, Main Street');
    await tester.useDeliveryAddress.check();
    expect(tester.billingAddress.disabled).toBe(true);
    await tester.type.selectLabel('Autre');
    await tester.language.selectLabel('Français');
    await tester.rationale.fillWith('foo');

    await tester.saveButton.click();
    expect(tester.componentInstance.command.customer.billingAddress).toEqual(tester.componentInstance.command.customer.deliveryAddress);
  });

  it('should cancel', async () => {
    await tester.stable();

    await tester.cancelButton.click();
    expect(tester.componentInstance.cancelled).toBe(true);
  });
});
