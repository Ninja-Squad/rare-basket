import { TestBed } from '@angular/core/testing';

import { OrdersContainerComponent } from './orders-container.component';
import { ComponentTester } from 'ngx-speculoos';
import { provideRouter, RouterOutlet } from '@angular/router';
import { AuthenticationService } from '../../shared/authentication.service';
import { User } from '../../shared/user.model';
import { BehaviorSubject } from 'rxjs';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

class OrdersContainerComponentTester extends ComponentTester<OrdersContainerComponent> {
  constructor() {
    super(OrdersContainerComponent);
  }

  get routerOutlet() {
    return this.element(RouterOutlet);
  }

  get tabs() {
    return this.elements('li');
  }
}

describe('OrdersContainerComponent', () => {
  let tester: OrdersContainerComponentTester;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let currentUserSubject: BehaviorSubject<User>;

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User>({
      permissions: ['ORDER_MANAGEMENT', 'ORDER_VISUALIZATION']
    } as User);
    authenticationService = jasmine.createSpyObj('AuthenticationService', ['getCurrentUser']);
    authenticationService.getCurrentUser.and.returnValue(currentUserSubject);

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting(), { provide: AuthenticationService, useValue: authenticationService }]
    });

    tester = new OrdersContainerComponentTester();
    await tester.stable();
  });

  it('should have a router outlet', () => {
    expect(tester.routerOutlet).toBeTruthy();
  });

  it('should display tabs depending on user permissions', async () => {
    expect(tester.tabs.length).toBe(4);

    currentUserSubject.next({
      permissions: ['ORDER_MANAGEMENT']
    } as User);
    await tester.stable();
    expect(tester.tabs.length).toBe(2);
    expect(tester.tabs[0]).toContainText('En cours');
    expect(tester.tabs[1]).toContainText('Terminées');

    currentUserSubject.next({
      permissions: ['ORDER_VISUALIZATION']
    } as User);
    await tester.stable();
    expect(tester.tabs.length).toBe(2);
    expect(tester.tabs[0]).toContainText('Statistiques');
    expect(tester.tabs[1]).toContainText('Export');
  });
});
