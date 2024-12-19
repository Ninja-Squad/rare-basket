import { TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { AuthenticationService } from '../shared/authentication.service';
import { Subject } from 'rxjs';
import { User } from '../shared/user.model';
import { provideI18nTesting } from '../i18n/mock-18n.spec';
import { provideRouter } from '@angular/router';

class HomeComponentTester extends ComponentTester<HomeComponent> {
  constructor() {
    super(HomeComponent);
  }

  get card() {
    return this.element('.card');
  }

  get loginButton() {
    return this.button('#login-button');
  }

  get ordersLink() {
    return this.element('#orders-link');
  }
}

describe('HomeComponent', () => {
  let tester: HomeComponentTester;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let userSubject: Subject<User>;

  beforeEach(async () => {
    userSubject = new Subject<User>();
    authenticationService = createMock(AuthenticationService);
    authenticationService.getCurrentUser.and.returnValue(userSubject);

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting(), { provide: AuthenticationService, useValue: authenticationService }]
    });

    tester = new HomeComponentTester();
    await tester.stable();
  });

  it('should display card and content depending on user and permissions', async () => {
    expect(tester.card).toBeNull();

    // we now know that the user is not authenticated
    userSubject.next(null);
    await tester.stable();
    expect(tester.card).not.toBeNull();
    expect(tester.card).not.toContainText('Bienvenue');
    expect(tester.loginButton).not.toBeNull();
    expect(tester.ordersLink).toBeNull();

    // we now know that the user is authenticated
    userSubject.next({ name: 'John', permissions: [] } as User);
    await tester.stable();
    expect(tester.card).toContainText('Bienvenue John');
    expect(tester.loginButton).toBeNull();
    expect(tester.ordersLink).toBeNull();

    // we now know that the user is authenticated and can access orders
    userSubject.next({ name: 'John', permissions: ['ORDER_MANAGEMENT'] } as User);
    await tester.stable();
    expect(tester.ordersLink).not.toBeNull();

    userSubject.next({ name: 'John', permissions: ['ORDER_VISUALIZATION'] } as User);
    await tester.stable();
    expect(tester.ordersLink).not.toBeNull();
  });

  it('should log in', async () => {
    // we now know that the user is not authenticated
    userSubject.next(null);
    await tester.stable();
    await tester.loginButton.click();
    expect(authenticationService.login).toHaveBeenCalled();
  });
});
