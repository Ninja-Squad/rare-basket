import { TestBed } from '@angular/core/testing';

import { InProgressOrdersComponent } from './in-progress-orders.component';
import { createMock, MockObject } from '../../../test/mock';
import { OrdersComponent } from '../orders/orders.component';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { OrderService } from '../order.service';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { AuthenticationService } from '../../shared/authentication.service';
import { User } from '../../shared/user.model';
import { RouterTestingHarness } from '@angular/router/testing';
import { page } from 'vitest/browser';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, test } from 'vitest';

class InProgressOrdersComponentTester {
  readonly root;
  readonly accessionHolder;
  readonly loadingSpinner;
  readonly errorAlert;
  readonly noOrderMessage;

  constructor(readonly harness: RouterTestingHarness) {
    this.root = page.elementLocator(harness.fixture.nativeElement);
    this.accessionHolder = this.root.getByCss('#accession-holder');
    this.loadingSpinner = this.root.getByCss('#orders-loading-spinner');
    this.errorAlert = this.root.getByCss('#orders-error-alert');
    this.noOrderMessage = this.root.getByCss('#no-order-message');
  }

  get ordersComponent(): OrdersComponent | null {
    return this.harness.fixture.debugElement.query(By.directive(OrdersComponent))?.componentInstance ?? null;
  }

  optionLabels() {
    const select = this.accessionHolder.element() as HTMLSelectElement;
    return Array.from(select.options).map(option => option.textContent ?? '');
  }
}

describe('InProgressOrdersComponent', () => {
  let tester: InProgressOrdersComponentTester;
  let orderService: MockObject<OrderService>;
  let authenticationService: MockObject<AuthenticationService>;
  let router: Router;

  beforeEach(() => {
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
        provideRouter([{ path: 'orders/in-progress', component: InProgressOrdersComponent }], withComponentInputBinding())
      ]
    });

    router = TestBed.inject(Router);
  });

  test('should display a loading spinner until orders are present', async () => {
    const ordersSubject = new Subject<Page<Order>>();
    orderService.listInProgress.mockReturnValue(ordersSubject);
    tester = new InProgressOrdersComponentTester(await RouterTestingHarness.create('/orders/in-progress'));

    await expect.element(tester.loadingSpinner).toBeInTheDocument();
    expect(tester.ordersComponent).toBeNull();
    await expect.element(tester.noOrderMessage).not.toBeInTheDocument();
    expect(orderService.listInProgress).toHaveBeenCalledWith(0, null);
  });

  test('should display an error message if loading orders fails', async () => {
    orderService.listInProgress.mockReturnValue(throwError(() => undefined));

    tester = new InProgressOrdersComponentTester(await RouterTestingHarness.create('/orders/in-progress'));
    await tester.harness.fixture.whenStable();

    await expect.element(tester.errorAlert).toBeInTheDocument();
    expect(tester.ordersComponent).toBeNull();
    await expect.element(tester.loadingSpinner).not.toBeInTheDocument();
  });

  test('should not display accession holder if only one accessible', async () => {
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
    orderService.listInProgress.mockReturnValue(of(page0));
    tester = new InProgressOrdersComponentTester(await RouterTestingHarness.create('/orders/in-progress'));

    await tester.harness.fixture.whenStable();

    await expect.element(tester.accessionHolder).not.toBeInTheDocument();
    expect(orderService.listInProgress).toHaveBeenCalledWith(0, null);
  });

  test('should display requested page and accession holder', async () => {
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

    orderService.listInProgress.mockImplementation((page, accessionHolderId) => {
      if (page === 0 && accessionHolderId === null) {
        return of(page0);
      }
      if (page === 1 && accessionHolderId === null) {
        return of(page1);
      }
      if (page === 0 && accessionHolderId === 42) {
        return of(page0ForAccessionHolder42);
      }
      return of(page0);
    });

    tester = new InProgressOrdersComponentTester(await RouterTestingHarness.create('/orders/in-progress?page=1'));
    await tester.harness.fixture.whenStable();

    await expect.element(tester.noOrderMessage).not.toBeInTheDocument();
    expect(tester.ordersComponent).not.toBeNull();
    expect(tester.ordersComponent!.orders()).toBe(page1);
    expect(tester.optionLabels()).toEqual([`tous les gestionnaires d'accessions`, 'AH1', 'AH2']);
    await expect.element(tester.accessionHolder).toHaveDisplayValue(`tous les gestionnaires d'accessions`);

    await tester.accessionHolder.selectOptions('AH1');

    expect(router.url).toBe('/orders/in-progress?page=0&h=42');
    expect(tester.ordersComponent!.orders()).toBe(page0ForAccessionHolder42);

    await tester.accessionHolder.selectOptions(`tous les gestionnaires d'accessions`);

    expect(router.url).toBe('/orders/in-progress?page=0');
    expect(tester.ordersComponent!.orders()).toBe(page0);
  });

  test('should display a no order message if there is no order', async () => {
    const page0 = {
      number: 0,
      content: [],
      totalElements: 0,
      size: 20,
      totalPages: 1
    } as Page<Order>;

    orderService.listInProgress.mockReturnValue(of(page0));

    tester = new InProgressOrdersComponentTester(await RouterTestingHarness.create('/orders/in-progress'));
    await tester.harness.fixture.whenStable();

    await expect.element(tester.noOrderMessage).toBeInTheDocument();
    expect(tester.ordersComponent).toBeNull();
  });
});
