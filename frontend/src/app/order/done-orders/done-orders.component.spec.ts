import { beforeEach, describe, expect, it, type MockedObject } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { RoutingTester } from 'ngx-speculoos';
import { OrdersComponent } from '../orders/orders.component';
import { provideRouter, Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { OrderService } from '../order.service';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { DoneOrdersComponent } from './done-orders.component';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { AuthenticationService } from '../../shared/authentication.service';
import { User } from '../../shared/user.model';
import { RouterTestingHarness } from '@angular/router/testing';
import { createMock } from '../../../mock';

class DoneOrdersComponentTester extends RoutingTester {
  constructor(harness: RouterTestingHarness) {
    super(harness);
  }

  get accessionHolder() {
    return this.select('#accession-holder');
  }

  get ordersComponent() {
    return this.component(OrdersComponent)!;
  }
}

describe('DoneOrdersComponent', () => {
  let tester: DoneOrdersComponentTester;
  let orderService: MockedObject<OrderService>;
  let authenticationService: MockedObject<AuthenticationService>;
  let router: Router;

  beforeEach(async () => {
    orderService = createMock(OrderService);
    authenticationService = createMock(AuthenticationService);
    authenticationService.getCurrentUser.mockReturnValue(
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
        provideRouter([{ path: 'orders/done', component: DoneOrdersComponent }])
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should not display anything until orders are present', async () => {
    orderService.listDone.mockReturnValue(EMPTY);
    tester = new DoneOrdersComponentTester(await RouterTestingHarness.create('/orders/done'));

    expect(tester.ordersComponent).toBeNull();
    expect(orderService.listDone).toHaveBeenCalledWith(0, null);
  });

  it('should not display accession holder if only one accessible', async () => {
    authenticationService.getCurrentUser.mockReturnValue(
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
    orderService.listDone.mockReturnValue(of(page0));
    tester = new DoneOrdersComponentTester(await RouterTestingHarness.create('/orders/done'));

    expect(tester.accessionHolder).toBeNull();
    expect(orderService.listDone).toHaveBeenCalledWith(0, null);
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

    orderService.listDone.mockImplementation((page, accessionHolderId) => {
      if (page === 0 && accessionHolderId === null) {
        return of(page0);
      }
      if (page === 1 && accessionHolderId === null) {
        return of(page1);
      }
      if (page === 0 && accessionHolderId === 42) {
        return of(page0ForAccessionHolder42);
      }
      throw new Error('Unexpected arguments');
    });

    tester = new DoneOrdersComponentTester(await RouterTestingHarness.create('/orders/done?page=1'));

    expect(tester.ordersComponent).not.toBeNull();
    expect(tester.ordersComponent.orders()).toBe(page1);
    expect(tester.accessionHolder!.optionLabels).toEqual([`tous les gestionnaires d'accessions`, 'AH1', 'AH2']);
    expect(tester.accessionHolder).toHaveSelectedLabel(`tous les gestionnaires d'accessions`);

    await tester.accessionHolder!.selectLabel('AH1');

    expect(router.url).toBe('/orders/done?page=0&h=42');
    expect(tester.ordersComponent.orders()).toBe(page0ForAccessionHolder42);

    await tester.accessionHolder!.selectLabel(`tous les gestionnaires d'accessions`);

    expect(router.url).toBe('/orders/done?page=0');
    expect(tester.ordersComponent.orders()).toBe(page0);
  });
});
