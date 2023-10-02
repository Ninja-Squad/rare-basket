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
    return this.select('#accession-holder');
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

describe('CreateOrderComponent', () => {
  let tester: CreateOrderComponentTester;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let orderService: jasmine.SpyObj<OrderService>;
  let router: Router;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
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

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  describe('when current user has only one accession holder', () => {
    beforeEach(() => {
      const user: User = {
        accessionHolders: [{ id: 1, name: 'AH1', grc: { name: 'GRC1' } }]
      } as User;
      authenticationService.getCurrentUser.and.returnValue(of(user));
      tester = new CreateOrderComponentTester();
      tester.detectChanges();
    });

    it('should not display accession holder and have the only one selected', () => {
      expect(tester.accessionHolder).toBeNull();
      expect(tester.componentInstance.form.value.accessionHolder.id).toBe(1);
    });
  });

  describe('when current user has several accession holders', () => {
    beforeEach(() => {
      const user: User = {
        accessionHolders: [
          { id: 1, name: 'AH1', grc: { name: 'GRC1' } },
          { id: 2, name: 'AH2', grc: { name: 'GRC2' } }
        ]
      } as User;
      authenticationService.getCurrentUser.and.returnValue(of(user));
      tester = new CreateOrderComponentTester();
      tester.detectChanges();
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

    it('should not save if invalid', () => {
      tester.saveButton.click();

      // accession holder, name, email, delivery address, billing address, type, language are mandatory, but not organization nor rationale
      expect(tester.errors.length).toBe(7);

      tester.email.fillWith('notAnEmail');
      expect(tester.errors.length).toBe(7);
    });

    it('should save', () => {
      tester.detectChanges();

      tester.accessionHolder.selectLabel('GRC2 – AH2');
      tester.name.fillWith('Jane');
      tester.organization.fillWith('Wheat SAS');
      tester.email.fillWith('jane@mail.com');
      tester.deliveryAddress.fillWith('2, Main Street');
      tester.billingAddress.fillWith('2, Main Street - billing service');
      tester.type.selectLabel('Autre');
      tester.language.selectLabel('Français');
      tester.rationale.fillWith('foo');

      orderService.createOrder.and.returnValue(of({ id: 42 } as DetailedOrder));

      tester.saveButton.click();

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

    it('should use the delivery address as the billing address', () => {
      tester.detectChanges();

      tester.accessionHolder.selectLabel('GRC2 – AH2');
      tester.name.fillWith('Jane');
      tester.organization.fillWith('Wheat SAS');
      tester.email.fillWith('jane@mail.com');
      tester.deliveryAddress.fillWith('2, Main Street');
      tester.useDeliveryAddress.check();
      expect(tester.billingAddress.disabled).toBe(true);

      tester.type.selectLabel('Autre');
      tester.language.selectLabel('Français');
      tester.rationale.fillWith('foo');

      orderService.createOrder.and.returnValue(of({ id: 42 } as DetailedOrder));
      tester.saveButton.click();

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

    it('should cancel', () => {
      tester.detectChanges();

      tester.cancelButton.click();
      expect(router.navigate).toHaveBeenCalledWith(['/orders', 'in-progress']);
    });
  });
});
