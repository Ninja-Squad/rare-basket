import { TestBed } from '@angular/core/testing';

import { OrdersContainerComponent } from './orders-container.component';
import { createMock, MockObject } from '../../../test/mock';
import { provideRouter } from '@angular/router';
import { AuthenticationService } from '../../shared/authentication.service';
import { User } from '../../shared/user.model';
import { BehaviorSubject } from 'rxjs';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

class OrdersContainerComponentTester {
  readonly fixture = TestBed.createComponent(OrdersContainerComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly routerOutlet = this.root.getByCss('router-outlet');
  readonly tabs = this.root.getByCss('li');
}

describe('OrdersContainerComponent', () => {
  let tester: OrdersContainerComponentTester;
  let authenticationService: MockObject<AuthenticationService>;
  let currentUserSubject: BehaviorSubject<User>;

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User>({
      permissions: ['ORDER_MANAGEMENT', 'ORDER_VISUALIZATION']
    } as User);
    authenticationService = createMock(AuthenticationService);
    authenticationService.getCurrentUser.mockReturnValue(currentUserSubject);

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting(), { provide: AuthenticationService, useValue: authenticationService }]
    });

    tester = new OrdersContainerComponentTester();
    await tester.fixture.whenStable();
  });

  test('should have a router outlet', async () => {
    await expect.element(tester.routerOutlet).toBeInTheDocument();
  });

  test('should display tabs depending on user permissions', async () => {
    await expect.element(tester.tabs).toHaveLength(4);

    currentUserSubject.next({
      permissions: ['ORDER_MANAGEMENT']
    } as User);
    await expect.element(tester.tabs).toHaveLength(2);
    await expect.element(tester.tabs.nth(0)).toMatchTextContent('En cours');
    await expect.element(tester.tabs.nth(1)).toMatchTextContent('Terminées');

    currentUserSubject.next({
      permissions: ['ORDER_VISUALIZATION']
    } as User);
    await expect.element(tester.tabs).toHaveLength(2);
    await expect.element(tester.tabs.nth(0)).toMatchTextContent('Statistiques');
    await expect.element(tester.tabs.nth(1)).toMatchTextContent('Export');
  });
});
