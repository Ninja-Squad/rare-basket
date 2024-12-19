import { TestBed } from '@angular/core/testing';

import { InProgressOrdersComponent } from './in-progress-orders.component';
import { createMock, RoutingTester } from 'ngx-speculoos';
import { OrdersComponent } from '../orders/orders.component';
import { provideRouter, Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { OrderService } from '../order.service';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';
import { AuthenticationService } from '../../shared/authentication.service';
import { User } from '../../shared/user.model';
import { RouterTestingHarness } from '@angular/router/testing';

class InProgressOrdersComponentTester extends RoutingTester {
  constructor(harness: RouterTestingHarness) {
    super(harness);
  }

  get accessionHolder() {
    return this.select('#accession-holder');
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
  let orderService: jasmine.SpyObj<OrderService>;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let router: Router;

  beforeEach(() => {
    orderService = createMock(OrderService);
    authenticationService = createMock(AuthenticationService);
    authenticationService.getCurrentUser.and.returnValue(
      of({
        accessionHolders: [
          {
            id: 42,
            name: 'AH1'
          },
          {
            id: 43,
            name: 'AH2'
          }
        ]
      } as User)
    );

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        { provide: OrderService, useValue: orderService },
        { provide: AuthenticationService, useValue: authenticationService },
        provideRouter([{ path: 'orders/in-progress', component: InProgressOrdersComponent }])
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should not display anything until orders are present', async () => {
    orderService.listInProgress.and.returnValue(EMPTY);
    tester = new InProgressOrdersComponentTester(await RouterTestingHarness.create('/orders/in-progress'));

    await tester.stable();

    expect(tester.ordersComponent).toBeNull();
    expect(tester.noOrderMessage).toBeNull();
    expect(orderService.listInProgress).toHaveBeenCalledWith(0, null);
  });

  it('should not display accession holder if only one accessible', async () => {
    authenticationService.getCurrentUser.and.returnValue(
      of({
        accessionHolders: [
          {
            id: 42,
            name: 'AH1'
          }
        ]
      } as User)
    );
    const page0 = {
      number: 0,
      content: [],
      totalElements: 1,
      size: 20,
      totalPages: 1
    } as Page<Order>;
    orderService.listInProgress.and.returnValue(of(page0));
    tester = new InProgressOrdersComponentTester(await RouterTestingHarness.create('/orders/in-progress'));

    await tester.stable();

    expect(tester.accessionHolder).toBeNull();
    expect(orderService.listInProgress).toHaveBeenCalledWith(0, null);
  });

  it('should display requested page and accession holder', async () => {
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
    const page0ForAccessionHolder42 = {
      number: 0,
      content: [],
      totalElements: 1,
      size: 20,
      totalPages: 1
    } as Page<Order>;

    orderService.listInProgress.withArgs(0, null).and.returnValue(of(page0));
    orderService.listInProgress.withArgs(1, null).and.returnValue(of(page1));
    orderService.listInProgress.withArgs(0, 42).and.returnValue(of(page0ForAccessionHolder42));

    tester = new InProgressOrdersComponentTester(await RouterTestingHarness.create('/orders/in-progress?page=1'));
    await tester.stable();

    expect(tester.noOrderMessage).toBeNull();
    expect(tester.ordersComponent).not.toBeNull();
    expect(tester.ordersComponent.orders()).toBe(page1);
    expect(tester.accessionHolder.optionLabels).toEqual([`tous les gestionnaires d'accessions`, 'AH1', 'AH2']);
    expect(tester.accessionHolder).toHaveSelectedLabel(`tous les gestionnaires d'accessions`);

    await tester.accessionHolder.selectLabel('AH1');

    expect(router.url).toBe('/orders/in-progress?page=0&h=42');
    expect(tester.ordersComponent.orders()).toBe(page0ForAccessionHolder42);

    await tester.accessionHolder.selectLabel(`tous les gestionnaires d'accessions`);

    expect(router.url).toBe('/orders/in-progress?page=0');
    expect(tester.ordersComponent.orders()).toBe(page0);
  });

  it('should display a no order message if there is no order', async () => {
    const page0 = {
      number: 0,
      content: [],
      totalElements: 0,
      size: 20,
      totalPages: 1
    } as Page<Order>;

    orderService.listInProgress.and.returnValue(of(page0));

    tester = new InProgressOrdersComponentTester(await RouterTestingHarness.create('/orders/in-progress'));
    await tester.stable();

    expect(tester.noOrderMessage).not.toBeNull();
    expect(tester.ordersComponent).toBeNull();
  });
});
