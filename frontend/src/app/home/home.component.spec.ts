import { TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { AuthenticationService } from '../shared/authentication.service';
import { Subject } from 'rxjs';
import { Permission, User } from '../shared/user.model';
import { provideI18nTesting } from '../i18n/mock-18n';
import { provideRouter } from '@angular/router';
import { page } from 'vitest/browser';
import { createMock, MockObject } from '../../test/mock';
import { beforeEach, describe, expect, test } from 'vitest';

class HomeComponentTester {
  readonly fixture = TestBed.createComponent(HomeComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly card = this.root.getByCss('.card');
  readonly loginButton = this.root.getByCss('#login-button');
  readonly ordersLink = this.root.getByCss('#orders-link');
}

describe('HomeComponent', () => {
  let tester: HomeComponentTester;
  let authenticationService: MockObject<AuthenticationService>;
  let userSubject: Subject<User | null>;

  beforeEach(async () => {
    userSubject = new Subject<User | null>();
    authenticationService = createMock(AuthenticationService);
    authenticationService.getCurrentUser.mockReturnValue(userSubject);

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting(), { provide: AuthenticationService, useValue: authenticationService }]
    });

    tester = new HomeComponentTester();
    await tester.fixture.whenStable();
  });

  test('should display card and content depending on user and permissions', async () => {
    await expect.element(tester.card).not.toBeInTheDocument();

    // we now know that the user is not authenticated
    userSubject.next(null);
    await tester.fixture.whenStable();
    await expect.element(tester.card).toBeInTheDocument();
    await expect.element(tester.card).not.toHaveTextContent('Bienvenue');
    await expect.element(tester.loginButton).toBeInTheDocument();
    await expect.element(tester.ordersLink).not.toBeInTheDocument();

    // we now know that the user is authenticated
    userSubject.next({ name: 'John', permissions: [] as Array<Permission> } as User);
    await tester.fixture.whenStable();
    await expect.element(tester.card).toHaveTextContent('Bienvenue John');
    await expect.element(tester.loginButton).not.toBeInTheDocument();
    await expect.element(tester.ordersLink).not.toBeInTheDocument();

    // we now know that the user is authenticated and can access orders
    userSubject.next({ name: 'John', permissions: ['ORDER_MANAGEMENT'] } as User);
    await tester.fixture.whenStable();
    await expect.element(tester.ordersLink).toBeInTheDocument();

    userSubject.next({ name: 'John', permissions: ['ORDER_VISUALIZATION'] } as User);
    await tester.fixture.whenStable();
    await expect.element(tester.ordersLink).toBeInTheDocument();
  });

  test('should log in', async () => {
    // we now know that the user is not authenticated
    userSubject.next(null);
    await tester.fixture.whenStable();
    await tester.loginButton.click();
    expect(authenticationService.login).toHaveBeenCalled();
  });
});
