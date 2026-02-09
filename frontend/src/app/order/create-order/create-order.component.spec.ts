import { TestBed } from '@angular/core/testing';

import { CreateOrderComponent } from './create-order.component';
import { createMock, MockObject } from '../../../test/mock';
import { OrderService } from '../order.service';
import { Router } from '@angular/router';
import { DetailedOrder, OrderCreationCommand } from '../order.model';
import { of } from 'rxjs';
import { ToastService } from '../../shared/toast.service';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { AuthenticationService } from '../../shared/authentication.service';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { User } from '../../shared/user.model';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

class CreateOrderComponentTester {
  readonly fixture = TestBed.createComponent(CreateOrderComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly accessionHolder = this.root.getByCss('#accession-holder');
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

  optionLabels(selectLocator: typeof this.accessionHolder) {
    const select = selectLocator.element() as HTMLSelectElement;
    return Array.from(select.options).map(option => option.textContent ?? '');
  }
}

describe('CreateOrderComponent', () => {
  let tester: CreateOrderComponentTester;
  let authenticationService: MockObject<AuthenticationService>;
  let orderService: MockObject<OrderService>;
  let router: Router;
  let toastService: MockObject<ToastService>;

  beforeEach(async () => {
    authenticationService = createMock(AuthenticationService);
    orderService = createMock(OrderService);
    toastService = createMock(ToastService);

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        { provide: AuthenticationService, useValue: authenticationService },
        { provide: OrderService, useValue: orderService },
        { provide: ToastService, useValue: toastService }
      ]
    });

    await TestBed.createComponent(ValidationDefaultsComponent).whenStable();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  describe('when current user has only one accession holder', () => {
    beforeEach(async () => {
      const user: User = {
        accessionHolders: [{ id: 1, name: 'AH1', grc: { name: 'GRC1' } }]
      } as User;
      authenticationService.getCurrentUser.mockReturnValue(of(user));
      tester = new CreateOrderComponentTester();
      await tester.fixture.whenStable();
    });

    test('should not display accession holder and have the only one selected', async () => {
      await expect.element(tester.accessionHolder).toHaveLength(0);
      expect(tester.componentInstance.form.value.accessionHolder!.id).toBe(1);
    });
  });

  describe('when current user has several accession holders', async () => {
    beforeEach(async () => {
      const user: User = {
        accessionHolders: [
          { id: 1, name: 'AH1', grc: { name: 'GRC1' } },
          { id: 2, name: 'AH2', grc: { name: 'GRC2' } }
        ]
      } as User;
      authenticationService.getCurrentUser.mockReturnValue(of(user));
      tester = new CreateOrderComponentTester();
      await tester.fixture.whenStable();
    });

    test('should display an empty form', async () => {
      await expect.element(tester.accessionHolder).toHaveDisplayValue('');
      expect(tester.optionLabels(tester.accessionHolder)).toEqual(['', 'GRC1 – AH1', 'GRC2 – AH2']);
      await expect.element(tester.name).toHaveValue('');
      await expect.element(tester.organization).toHaveValue('');
      await expect.element(tester.email).toHaveValue('');
      await expect.element(tester.deliveryAddress).toHaveValue('');
      await expect.element(tester.billingAddress).toHaveValue('');
      await expect.element(tester.useDeliveryAddress).not.toBeChecked();
      await expect.element(tester.type).toHaveDisplayValue('');
      await expect.element(tester.language).toHaveDisplayValue('');
      await expect.element(tester.rationale).toHaveValue('');
    });

    test('should not save if invalid', async () => {
      await tester.saveButton.click();

      // accession holder, name, email, delivery address, billing address, type, language are mandatory, but not organization nor rationale
      await expect.element(tester.errors).toHaveLength(7);

      await tester.email.fill('notAnEmail');
      await expect.element(tester.errors).toHaveLength(7);
    });

    test('should save', async () => {
      await tester.accessionHolder.selectOptions('GRC2 – AH2');
      await tester.name.fill('Jane');
      await tester.organization.fill('Wheat SAS');
      await tester.email.fill('jane@mail.com');
      await tester.deliveryAddress.fill('2, Main Street');
      await tester.billingAddress.fill('2, Main Street - billing service');
      await tester.type.selectOptions('Autre');
      await tester.language.selectOptions('Français');
      await tester.rationale.fill('foo');

      orderService.createOrder.mockReturnValue(of({ id: 42 } as DetailedOrder));

      await tester.saveButton.click();

      const expectedCommand: OrderCreationCommand = {
        accessionHolderId: 2,
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

      expect(orderService.createOrder).toHaveBeenCalledWith(expectedCommand);
      expect(router.navigate).toHaveBeenCalledWith(['/orders', 42], { replaceUrl: true });
      expect(toastService.success).toHaveBeenCalled();
    });

    test('should use the delivery address as the billing address', async () => {
      await tester.accessionHolder.selectOptions('GRC2 – AH2');
      await tester.name.fill('Jane');
      await tester.organization.fill('Wheat SAS');
      await tester.email.fill('jane@mail.com');
      await tester.deliveryAddress.fill('2, Main Street');
      await tester.useDeliveryAddress.click();
      await expect.element(tester.billingAddress).toBeDisabled();

      await tester.type.selectOptions('Autre');
      await tester.language.selectOptions('Français');
      await tester.rationale.fill('foo');

      orderService.createOrder.mockReturnValue(of({ id: 42 } as DetailedOrder));
      await tester.saveButton.click();

      const expectedCommand: OrderCreationCommand = {
        accessionHolderId: 2,
        customer: {
          name: 'Jane',
          organization: 'Wheat SAS',
          email: 'jane@mail.com',
          deliveryAddress: '2, Main Street',
          billingAddress: '2, Main Street',
          type: 'OTHER',
          language: 'fr'
        },
        rationale: 'foo'
      };

      expect(orderService.createOrder).toHaveBeenCalledWith(expectedCommand);
      expect(router.navigate).toHaveBeenCalledWith(['/orders', 42], { replaceUrl: true });
      expect(toastService.success).toHaveBeenCalled();
    });

    test('should cancel', async () => {
      await tester.cancelButton.click();
      expect(router.navigate).toHaveBeenCalledWith(['/orders', 'in-progress']);
    });
  });
});
