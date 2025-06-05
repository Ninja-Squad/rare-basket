import { TestBed } from '@angular/core/testing';

import { CreateOrderComponent } from './create-order.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { OrderService } from '../order.service';
import { Router } from '@angular/router';
import { DetailedOrder, OrderCreationCommand } from '../order.model';
import { of } from 'rxjs';
import { ToastService } from '../../shared/toast.service';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';
import { AuthenticationService } from '../../shared/authentication.service';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { User } from '../../shared/user.model';

class CreateOrderComponentTester extends ComponentTester<CreateOrderComponent> {
  constructor() {
    super(CreateOrderComponent);
  }

  get accessionHolder() {
    return this.select('#accession-holder')!;
  }

  get name() {
    return this.input('#name')!;
  }

  get organization() {
    return this.input('#organization')!;
  }

  get email() {
    return this.input('#email')!;
  }

  get deliveryAddress() {
    return this.textarea('#delivery-address')!;
  }

  get billingAddress() {
    return this.textarea('#billing-address')!;
  }

  get useDeliveryAddress() {
    return this.input('#use-delivery-address')!;
  }

  get type() {
    return this.select('#type')!;
  }

  get language() {
    return this.select('#language')!;
  }

  get rationale() {
    return this.textarea('#rationale')!;
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

describe('CreateOrderComponent', () => {
  let tester: CreateOrderComponentTester;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let orderService: jasmine.SpyObj<OrderService>;
  let router: Router;
  let toastService: jasmine.SpyObj<ToastService>;

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
    spyOn(router, 'navigate');
  });

  describe('when current user has only one accession holder', () => {
    beforeEach(async () => {
      const user: User = {
        accessionHolders: [{ id: 1, name: 'AH1', grc: { name: 'GRC1' } }]
      } as User;
      authenticationService.getCurrentUser.and.returnValue(of(user));
      tester = new CreateOrderComponentTester();
      await tester.stable();
    });

    it('should not display accession holder and have the only one selected', () => {
      expect(tester.accessionHolder).toBeNull();
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
      authenticationService.getCurrentUser.and.returnValue(of(user));
      tester = new CreateOrderComponentTester();
      await tester.stable();
    });

    it('should display an empty form', () => {
      expect(tester.accessionHolder).toHaveSelectedLabel('');
      expect(tester.accessionHolder.optionLabels).toEqual(['', 'GRC1 – AH1', 'GRC2 – AH2']);
      expect(tester.name).toHaveValue('');
      expect(tester.organization).toHaveValue('');
      expect(tester.email).toHaveValue('');
      expect(tester.deliveryAddress).toHaveValue('');
      expect(tester.billingAddress).toHaveValue('');
      expect(tester.useDeliveryAddress).not.toBeChecked();
      expect(tester.type).toHaveSelectedLabel('');
      expect(tester.language).toHaveSelectedLabel('');
      expect(tester.rationale).toHaveValue('');
    });

    it('should not save if invalid', async () => {
      await tester.saveButton.click();

      // accession holder, name, email, delivery address, billing address, type, language are mandatory, but not organization nor rationale
      expect(tester.errors.length).toBe(7);

      await tester.email.fillWith('notAnEmail');
      expect(tester.errors.length).toBe(7);
    });

    it('should save', async () => {
      await tester.accessionHolder.selectLabel('GRC2 – AH2');
      await tester.name.fillWith('Jane');
      await tester.organization.fillWith('Wheat SAS');
      await tester.email.fillWith('jane@mail.com');
      await tester.deliveryAddress.fillWith('2, Main Street');
      await tester.billingAddress!.fillWith('2, Main Street - billing service');
      await tester.type.selectLabel('Autre');
      await tester.language.selectLabel('Français');
      await tester.rationale.fillWith('foo');

      orderService.createOrder.and.returnValue(of({ id: 42 } as DetailedOrder));

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

    it('should use the delivery address as the billing address', async () => {
      await tester.accessionHolder.selectLabel('GRC2 – AH2');
      await tester.name.fillWith('Jane');
      await tester.organization.fillWith('Wheat SAS');
      await tester.email.fillWith('jane@mail.com');
      await tester.deliveryAddress.fillWith('2, Main Street');
      await tester.useDeliveryAddress.check();
      expect(tester.billingAddress.disabled).toBe(true);

      await tester.type.selectLabel('Autre');
      await tester.language.selectLabel('Français');
      await tester.rationale.fillWith('foo');

      orderService.createOrder.and.returnValue(of({ id: 42 } as DetailedOrder));
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

    it('should cancel', async () => {
      await tester.cancelButton.click();
      expect(router.navigate).toHaveBeenCalledWith(['/orders', 'in-progress']);
    });
  });
});
