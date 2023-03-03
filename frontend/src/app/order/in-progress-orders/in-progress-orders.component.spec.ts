import { TestBed } from '@angular/core/testing';

import { InProgressOrdersComponent } from './in-progress-orders.component';
import { ActivatedRouteStub, ComponentTester, createMock, stubRoute } from 'ngx-speculoos';
import { OrdersComponent } from '../orders/orders.component';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { OrderService } from '../order.service';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

class InProgressOrdersComponentTester extends ComponentTester<InProgressOrdersComponent> {
  constructor() {
    super(InProgressOrdersComponent);
  }

  get ordersComponent(): OrdersComponent | null {
    return this.component(OrdersComponent);
  }

  get noOrderMessage() {
    return this.element('#no-order-message');
  }
}

describe('InProgressOrdersComponent', () => {
  let tester: InProgressOrdersComponentTester;
  let route: ActivatedRouteStub;
  let orderService: jasmine.SpyObj<OrderService>;

  beforeEach(() => {
    route = stubRoute();
    orderService = createMock(OrderService);

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: ActivatedRoute, useValue: route }, { provide: OrderService, useValue: orderService }]
    });

    tester = new InProgressOrdersComponentTester();
  });

  it('should not display anything until orders are present', () => {
    orderService.listInProgress.and.returnValue(EMPTY);

    tester.detectChanges();

    expect(tester.ordersComponent).toBeNull();
    expect(tester.noOrderMessage).toBeNull();
    expect(orderService.listInProgress).toHaveBeenCalledWith(0);
  });

  it('should display requested page', () => {
    const page1 = {
      number: 1,
      content: [],
      totalElements: 2,
      size: 20,
      totalPages: 1
    } as Page<Order>;
    const page0 = {
      number: 0,
      content: [],
      totalElements: 1,
      size: 20,
      totalPages: 1
    } as Page<Order>;

    orderService.listInProgress.and.returnValues(of(page1), of(page0));

    route.setQueryParam('page', '1');
    tester.detectChanges();

    expect(tester.noOrderMessage).toBeNull();
    expect(tester.ordersComponent).not.toBeNull();
    expect(tester.ordersComponent.orders).toBe(page1);

    route.setQueryParam('page', '0');
    tester.detectChanges();
    expect(tester.ordersComponent.orders).toBe(page0);
  });

  it('should display a no order message if there is no order', () => {
    const page0 = {
      number: 0,
      content: [],
      totalElements: 0,
      size: 20,
      totalPages: 1
    } as Page<Order>;

    orderService.listInProgress.and.returnValue(of(page0));

    route.setQueryParam('page', '0');
    tester.detectChanges();

    expect(tester.noOrderMessage).not.toBeNull();
    expect(tester.ordersComponent).toBeNull();
  });
});
