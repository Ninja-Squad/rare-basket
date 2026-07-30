import { TestBed } from '@angular/core/testing';

import { EditCustomerInformationComponent } from './edit-customer-information.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES } from '../../basket/basket.model';
import { CustomerInformationCommand } from '../order.model';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

@Component({
  template: `
    <rb-edit-customer-information
      [customerInformation]="customerInformation"
      (saved)="command.set($event)"
      (cancelled)="cancelled.set(true)"
    />
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
  readonly command = signal<CustomerInformationCommand | null>(null);
  readonly cancelled = signal(false);
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly name = this.root.getByCss('#name');
  readonly organization = this.root.getByCss('#organization');
  readonly email = this.root.getByCss('#email');
  readonly deliveryAddress = this.root.getByCss('#delivery-address');
  readonly billingAddress = this.root.getByCss('#billing-address');
  readonly useDeliveryAddress = this.root.getByCss('#use-delivery-address');
  readonly type = this.root.getByCss('#type');
  readonly language = this.root.getByCss('#language');
  readonly rationale = this.root.getByCss('#rationale');
  readonly saveButton = this.root.getByCss('#save-button');
  readonly cancelButton = this.root.getByCss('#cancel-button');
  readonly errors = this.root.getByCss('.invalid-feedback div');

  get componentInstance() {
    return this.fixture.componentInstance;
  }

  optionLabels(selectLocator: typeof this.type) {
    const select = selectLocator.element() as HTMLSelectElement;
    return Array.from(select.options).map(option => option.textContent ?? '');
  }
}

describe('EditCustomerComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    tester = new TestComponentTester();
  });

  test('should display a filled form', async () => {
    await expect.element(tester.name).toHaveValue('John');
    await expect.element(tester.organization).toHaveValue('Wheat SA');
    await expect.element(tester.email).toHaveValue('john@mail.com');
    await expect.element(tester.deliveryAddress).toHaveValue('1, Main Street');
    await expect.element(tester.billingAddress).toHaveValue('1, Main Street - billing service');
    await expect.element(tester.useDeliveryAddress).not.toBeChecked();
    expect(tester.optionLabels(tester.type).length).toBe(ALL_CUSTOMER_TYPES.length + 1);
    await expect.element(tester.type).toHaveDisplayValue('Agriculteur');
    expect(tester.optionLabels(tester.language).length).toBe(ALL_LANGUAGES.length + 1);
    await expect.element(tester.language).toHaveDisplayValue('Anglais');
    await expect.element(tester.rationale).toHaveValue('The rationale');

    await expect.element(tester.saveButton).toHaveClass('btn-sm');
    await expect.element(tester.cancelButton).toHaveClass('btn-sm');
  });

  test('should not save if invalid', async () => {
    await tester.name.fill('');
    await tester.organization.fill('');
    await tester.email.fill('');
    await tester.deliveryAddress.fill('');
    await tester.billingAddress.fill('');
    await tester.type.selectOptions('');
    await tester.language.selectOptions('');
    await tester.rationale.fill('');

    await tester.saveButton.click();

    expect(tester.componentInstance.command()).toBeNull();
    // name, email, delivery address, billing address, type, language are mandatory, but not organization nor rationale
    await expect.element(tester.errors).toHaveLength(6);

    await tester.email.fill('notAnEmail');
  });

  test('should save', async () => {
    await tester.name.fill('Jane');
    await tester.organization.fill('Wheat SAS');
    await tester.email.fill('jane@mail.com');
    await tester.deliveryAddress.fill('2, Main Street');
    await tester.billingAddress.fill('2, Main Street - billing service');
    await tester.type.selectOptions('Autre');
    await tester.language.selectOptions('Français');
    await tester.rationale.fill('foo');

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
    expect(tester.componentInstance.command()).toEqual(expectedCommand);
  });

  test('should use the delivery address as the billing address', async () => {
    await tester.name.fill('Jane');
    await tester.organization.fill('Wheat SAS');
    await tester.email.fill('jane@mail.com');
    await tester.deliveryAddress.fill('2, Main Street');
    await tester.useDeliveryAddress.click();
    await expect.element(tester.billingAddress).toBeDisabled();
    await tester.type.selectOptions('Autre');
    await tester.language.selectOptions('Français');
    await tester.rationale.fill('foo');

    await tester.saveButton.click();
    expect(tester.componentInstance.command()!.customer.billingAddress).toEqual(
      tester.componentInstance.command()!.customer.deliveryAddress
    );
  });

  test('should cancel', async () => {
    await tester.cancelButton.click();
    expect(tester.componentInstance.cancelled()).toBe(true);
  });
});
