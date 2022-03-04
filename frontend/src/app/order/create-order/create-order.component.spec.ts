import { TestBed } from '@angular/core/testing';

import { CreateOrderComponent } from './create-order.component';
import { ComponentTester, createMock, speculoosMatchers } from 'ngx-speculoos';
import { ReactiveFormsModule } from '@angular/forms';
import { ValdemortModule } from 'ngx-valdemort';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { LanguageEnumPipe } from '../../shared/language-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { OrderService } from '../order.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { EditCustomerInformationComponent } from '../edit-customer-information/edit-customer-information.component';
import { CustomerInformationCommand, DetailedOrder } from '../order.model';
import { of } from 'rxjs';
import { ToastService } from '../../shared/toast.service';
import { RbNgbTestingModule } from '../../rb-ngb/rb-ngb-testing.module';

class CreateOrderComponentTester extends ComponentTester<CreateOrderComponent> {
  constructor() {
    super(CreateOrderComponent);
  }

  get editCustomerComponent(): EditCustomerInformationComponent {
    return this.component(EditCustomerInformationComponent);
  }
}

describe('CreateOrderComponent', () => {
  let tester: CreateOrderComponentTester;
  let orderService: jasmine.SpyObj<OrderService>;
  let router: Router;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    orderService = createMock(OrderService);
    toastService = createMock(ToastService);

    TestBed.configureTestingModule({
      imports: [I18nTestingModule, RbNgbTestingModule, ReactiveFormsModule, ValdemortModule, RouterTestingModule],
      declarations: [CreateOrderComponent, EditCustomerInformationComponent, LanguageEnumPipe, CustomerTypeEnumPipe],
      providers: [
        { provide: OrderService, useValue: orderService },
        { provide: ToastService, useValue: toastService }
      ]
    });

    tester = new CreateOrderComponentTester();

    jasmine.addMatchers(speculoosMatchers);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    tester.detectChanges();
  });

  it('should display an empty customer information form', () => {
    expect(tester.editCustomerComponent.customerInformation).toBeFalsy();
    expect(tester.editCustomerComponent.smallButtons).toBe(false);
  });

  it('should save', () => {
    const command = {} as CustomerInformationCommand;
    orderService.createOrder.and.returnValue(of({ id: 42 } as DetailedOrder));

    tester.editCustomerComponent.saved.emit(command);

    expect(router.navigate).toHaveBeenCalledWith(['/orders', 42], { replaceUrl: true });
    expect(orderService.createOrder).toHaveBeenCalledWith(command);
    expect(toastService.success).toHaveBeenCalled();
  });

  it('should cancel', () => {
    tester.editCustomerComponent.cancelled.emit(undefined);

    expect(router.navigate).toHaveBeenCalledWith(['/orders', 'in-progress']);
  });
});
