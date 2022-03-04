import { TestBed } from '@angular/core/testing';

import { OrdersContainerComponent } from './orders-container.component';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { AuthenticationService } from '../../shared/authentication.service';
import { User } from '../../shared/user.model';
import { BehaviorSubject } from 'rxjs';
import { RbNgbTestingModule } from '../../rb-ngb/rb-ngb-testing.module';

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

  beforeEach(() => {
    currentUserSubject = new BehaviorSubject<User>({
      permissions: ['ORDER_MANAGEMENT', 'ORDER_VISUALIZATION']
    } as User);
    authenticationService = jasmine.createSpyObj('AuthenticationService', ['getCurrentUser']);
    authenticationService.getCurrentUser.and.returnValue(currentUserSubject);

    TestBed.configureTestingModule({
      declarations: [OrdersContainerComponent],
      imports: [I18nTestingModule, RouterTestingModule, RbNgbTestingModule],
      providers: [{ provide: AuthenticationService, useValue: authenticationService }]
    });

    tester = new OrdersContainerComponentTester();
    tester.detectChanges();

    jasmine.addMatchers(speculoosMatchers);
  });

  it('should have a router outlet', () => {
    expect(tester.routerOutlet).toBeTruthy();
  });

  it('should display tabs depending on user permissions', () => {
    expect(tester.tabs.length).toBe(4);

    currentUserSubject.next({
      permissions: ['ORDER_MANAGEMENT']
    } as User);
    tester.detectChanges();
    expect(tester.tabs.length).toBe(2);
    expect(tester.tabs[0]).toContainText('En cours');
    expect(tester.tabs[1]).toContainText('Terminées');

    currentUserSubject.next({
      permissions: ['ORDER_VISUALIZATION']
    } as User);
    tester.detectChanges();
    expect(tester.tabs.length).toBe(2);
    expect(tester.tabs[0]).toContainText('Statistiques');
    expect(tester.tabs[1]).toContainText('Export');
  });
});
