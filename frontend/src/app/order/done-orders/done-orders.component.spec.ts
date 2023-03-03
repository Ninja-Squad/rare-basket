import { TestBed } from '@angular/core/testing';

import { ActivatedRouteStub, ComponentTester, createMock, stubRoute } from 'ngx-speculoos';
import { OrdersComponent } from '../orders/orders.component';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { OrderService } from '../order.service';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { DoneOrdersComponent } from './done-orders.component';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

class DoneOrdersComponentTester extends ComponentTester<DoneOrdersComponent> {
  constructor() {
    super(DoneOrdersComponent);
  }

  get ordersComponent(): OrdersComponent | null {
    return this.component(OrdersComponent);
  }
}

describe('DoneOrdersComponent', () => {
  let tester: DoneOrdersComponentTester;
  let orderService: jasmine.SpyObj<OrderService>;
  let route: ActivatedRouteStub;

  beforeEach(() => {
    route = stubRoute();
    orderService = createMock(OrderService);

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: ActivatedRoute, useValue: route }, { provide: OrderService, useValue: orderService }]
    });

    tester = new DoneOrdersComponentTester();
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

    route.setQueryParam('page', '1');
    tester.detectChanges();

    expect(tester.ordersComponent).not.toBeNull();
    expect(tester.ordersComponent.orders).toBe(page1);

    route.setQueryParam('page', '0');
    tester.detectChanges();
    expect(tester.ordersComponent.orders).toBe(page0);
  });
});
