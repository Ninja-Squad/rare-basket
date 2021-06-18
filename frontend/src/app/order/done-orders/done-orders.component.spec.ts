import { TestBed } from '@angular/core/testing';

import { ComponentTester, fakeRoute, speculoosMatchers } from 'ngx-speculoos';
import { OrdersComponent } from '../orders/orders.component';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { OrderService } from '../order.service';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { DoneOrdersComponent } from './done-orders.component';
import { RouterTestingModule } from '@angular/router/testing';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { RbNgbTestingModule } from '../../rb-ngb/rb-ngb-testing.module';

class DoneOrdersComponentTester extends ComponentTester<DoneOrdersComponent> {
  constructor() {
    super(DoneOrdersComponent);
  }

  get ordersComponent(): OrdersComponent | null {
    return this.debugElement.query(By.directive(OrdersComponent))?.componentInstance ?? null;
  }
}

describe('DoneOrdersComponent', () => {
  let tester: DoneOrdersComponentTester;
  let queryParamsSubject: BehaviorSubject<{ [key: string]: string }>;
  let orderService: jasmine.SpyObj<OrderService>;

  beforeEach(() => {
    queryParamsSubject = new BehaviorSubject<{ [key: string]: string }>({});
    const route = fakeRoute({
      queryParams: queryParamsSubject
    });
    orderService = jasmine.createSpyObj<OrderService>('OrderService', ['listDone']);

    TestBed.configureTestingModule({
      declarations: [DoneOrdersComponent, OrdersComponent],
      imports: [I18nTestingModule, RouterTestingModule, RbNgbTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: OrderService, useValue: orderService }
      ]
    });

    tester = new DoneOrdersComponentTester();
    jasmine.addMatchers(speculoosMatchers);
  });

  it('should not display anything until orders are present', () => {
    orderService.listDone.and.returnValue(EMPTY);

    tester.detectChanges();

    expect(tester.ordersComponent).toBeNull();
    expect(orderService.listDone).toHaveBeenCalledWith(0);
  });

  it('should display requested page', () => {
    const page1 = {
      number: 1,
      content: [],
      totalElements: 0,
      size: 20,
      totalPages: 1
    } as Page<Order>;
    const page0 = {
      number: 0,
      content: [],
      totalElements: 0,
      size: 20,
      totalPages: 1
    } as Page<Order>;

    orderService.listDone.and.returnValues(of(page1), of(page0));

    queryParamsSubject.next({ page: '1' });
    tester.detectChanges();

    expect(tester.ordersComponent).not.toBeNull();
    expect(tester.ordersComponent.orders).toBe(page1);

    queryParamsSubject.next({ page: '0' });
    tester.detectChanges();
    expect(tester.ordersComponent.orders).toBe(page0);
  });
});
