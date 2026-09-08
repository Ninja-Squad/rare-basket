import { TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthenticationService } from '../shared/authentication.service';
import { Subject } from 'rxjs';
import { Permission, User } from '../shared/user.model';
import { provideI18nTesting } from '../i18n/mock-18n';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { createMock, MockObject } from '../../test/mock';

class NavbarComponentTester {
  readonly fixture = TestBed.createComponent(NavbarComponent);
  readonly orders = page.getByCss('#navbar-orders');
  readonly user = page.getByCss('#navbar-user');
  readonly administrationDropdown = page.getByCss('#navbar-administration-dropdown');
  readonly users = page.getByCss('#navbar-users');
  readonly accessionHolders = page.getByCss('#navbar-accession-holders');
  readonly login = page.getByCss('#navbar-login');
  readonly logout = page.getByCss('#navbar-logout');
}

describe('NavbarComponent', () => {
  let tester: NavbarComponentTester;
  let authenticationService: MockObject<AuthenticationService>;
  let userSubject: Subject<User | null>;

  beforeEach(async () => {
    userSubject = new Subject<User | null>();
    authenticationService = createMock(AuthenticationService);
    authenticationService.getCurrentUser.mockReturnValue(userSubject);

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting(), { provide: AuthenticationService, useValue: authenticationService }]
    });

    tester = new NavbarComponentTester();
    await tester.fixture.whenStable();
  });

  test('should display elements depending on user presence and permissions', async () => {
    await expect.element(tester.user).not.toBeInTheDocument();
    await expect.element(tester.orders).not.toBeInTheDocument();
    await expect.element(tester.users).not.toBeInTheDocument();
    await expect.element(tester.accessionHolders).not.toBeInTheDocument();
    await expect.element(tester.logout).not.toBeInTheDocument();
    await expect.element(tester.login).not.toBeInTheDocument();

    userSubject.next({ name: 'JB', permissions: ['ORDER_MANAGEMENT'] } as User);
    await tester.fixture.whenStable();

    await expect.element(tester.user).toMatchTextContent('JB');
    await expect.element(tester.orders).toBeInTheDocument();
    await expect.element(tester.administrationDropdown).not.toBeInTheDocument();
    await expect.element(tester.users).not.toBeInTheDocument();
    await expect.element(tester.accessionHolders).not.toBeInTheDocument();
    await expect.element(tester.logout).toBeInTheDocument();
    await expect.element(tester.login).not.toBeInTheDocument();

    userSubject.next(null);
    await tester.fixture.whenStable();

    await expect.element(tester.user).not.toBeInTheDocument();
    await expect.element(tester.orders).not.toBeInTheDocument();
    await expect.element(tester.administrationDropdown).not.toBeInTheDocument();
    await expect.element(tester.users).not.toBeInTheDocument();
    await expect.element(tester.accessionHolders).not.toBeInTheDocument();
    await expect.element(tester.logout).not.toBeInTheDocument();
    await expect.element(tester.login).toBeInTheDocument();

    userSubject.next({ name: 'JB', permissions: [] as Array<Permission> } as User);
    await tester.fixture.whenStable();

    await expect.element(tester.user).toMatchTextContent('JB');
    await expect.element(tester.orders).not.toBeInTheDocument();
    await expect.element(tester.administrationDropdown).not.toBeInTheDocument();
    await expect.element(tester.users).not.toBeInTheDocument();
    await expect.element(tester.accessionHolders).not.toBeInTheDocument();
    await expect.element(tester.logout).toBeInTheDocument();
    await expect.element(tester.login).not.toBeInTheDocument();

    userSubject.next({ name: 'JB', permissions: ['ADMINISTRATION'] } as User);
    await tester.fixture.whenStable();

    await expect.element(tester.user).toMatchTextContent('JB');
    await expect.element(tester.orders).not.toBeInTheDocument();
    await expect.element(tester.administrationDropdown).toBeInTheDocument();
    await expect.element(tester.users).toBeInTheDocument();
    await expect.element(tester.accessionHolders).toBeInTheDocument();
    await expect.element(tester.logout).toBeInTheDocument();
    await expect.element(tester.login).not.toBeInTheDocument();

    userSubject.next({ name: 'JB', permissions: ['ORDER_VISUALIZATION'] } as User);
    await tester.fixture.whenStable();

    await expect.element(tester.user).toMatchTextContent('JB');
    await expect.element(tester.orders).toBeInTheDocument();
    await expect.element(tester.administrationDropdown).not.toBeInTheDocument();
    await expect.element(tester.users).not.toBeInTheDocument();
    await expect.element(tester.accessionHolders).not.toBeInTheDocument();
    await expect.element(tester.logout).toBeInTheDocument();
    await expect.element(tester.login).not.toBeInTheDocument();
  });

  test('should login', async () => {
    userSubject.next(null);
    await tester.fixture.whenStable();

    (tester.login.element() as HTMLAnchorElement).click();
    expect(authenticationService.login).toHaveBeenCalled();
  });

  test('should logout', async () => {
    userSubject.next({ name: 'JB', permissions: [] as Array<Permission> } as User);
    await tester.fixture.whenStable();

    (tester.logout.element() as HTMLAnchorElement).click();
    expect(authenticationService.logout).toHaveBeenCalled();
  });
});
