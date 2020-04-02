import { TestBed } from '@angular/core/testing';

import { InProgressOrdersComponent } from './in-progress-orders.component';
import { ComponentTester, fakeRoute, speculoosMatchers } from 'ngx-speculoos';
import { OrdersComponent } from '../orders/orders.component';
import { By } from '@angular/platform-browser';
import { RbNgbModule } from '../../rb-ngb/rb-ngb.module';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { OrderService } from '../order.service';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { RouterTestingModule } from '@angular/router/testing';

class InProgressOrdersComponentTester extends ComponentTester<InProgressOrdersComponent> {
  constructor() {
    super(InProgressOrdersComponent);
  }

  get ordersComponent(): OrdersComponent | null {
    return this.debugElement.query(By.directive(OrdersComponent))?.componentInstance ?? null;
  }
}

describe('InProgressOrdersComponent', () => {
  let tester: InProgressOrdersComponentTester;
  let queryParamsSubject: BehaviorSubject<{ [key: string]: string }>;
  let orderService: jasmine.SpyObj<OrderService>;

  beforeEach(() => {
    queryParamsSubject = new BehaviorSubject<{ [key: string]: string }>({});
    const route = fakeRoute({
      queryParams: queryParamsSubject
    });
    orderService = jasmine.createSpyObj<OrderService>('OrderService', ['listInProgress']);

    TestBed.configureTestingModule({
      declarations: [InProgressOrdersComponent, OrdersComponent],
      imports: [RouterTestingModule, RbNgbModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: OrderService, useValue: orderService }
      ]
    });

    tester = new InProgressOrdersComponentTester();
    jasmine.addMatchers(speculoosMatchers);
  });

  it('should not display anything until orders are present', () => {
    orderService.listInProgress.and.returnValue(EMPTY);

    tester.detectChanges();

    expect(tester.ordersComponent).toBeNull();
    expect(orderService.listInProgress).toHaveBeenCalledWith(0);
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

    orderService.listInProgress.and.returnValues(of(page1), of(page0));

    queryParamsSubject.next({ page: '1' });
    tester.detectChanges();

    expect(tester.ordersComponent).not.toBeNull();
    expect(tester.ordersComponent.orders).toBe(page1);

    queryParamsSubject.next({ page: '0' });
    tester.detectChanges();
    expect(tester.ordersComponent.orders).toBe(page0);
  });
});
