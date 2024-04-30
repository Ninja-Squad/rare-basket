import { TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { AuthenticationService } from '../shared/authentication.service';
import { Subject } from 'rxjs';
import { User } from '../shared/user.model';
import { provideI18nTesting } from '../i18n/mock-18n.spec';
import { provideRouter } from '@angular/router';

class NavbarComponentTester extends ComponentTester<NavbarComponent> {
  constructor() {
    super(NavbarComponent);
  }

  get orders() {
    return this.element('#navbar-orders');
  }

  get user() {
    return this.element('#navbar-user');
  }

  get administrationDropdown() {
    return this.element('#navbar-administration-dropdown');
  }

  get users() {
    return this.element('#navbar-users');
  }

  get accessionHolders() {
    return this.element('#navbar-accession-holders');
  }

  get login() {
    return this.element<HTMLAnchorElement>('#navbar-login');
  }

  get logout() {
    return this.element<HTMLAnchorElement>('#navbar-logout');
  }
}

describe('NavbarComponent', () => {
  let tester: NavbarComponentTester;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let userSubject: Subject<User>;

  beforeEach(() => {
    userSubject = new Subject<User | null>();
    authenticationService = createMock(AuthenticationService);
    authenticationService.getCurrentUser.and.returnValue(userSubject);

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting(), { provide: AuthenticationService, useValue: authenticationService }]
    });

    tester = new NavbarComponentTester();
    tester.detectChanges();
  });

  it('should display elements depending on user presence and permissions', () => {
    expect(tester.user).toBeNull();
    expect(tester.orders).toBeNull();
    expect(tester.users).toBeNull();
    expect(tester.accessionHolders).toBeNull();
    expect(tester.logout).toBeNull();
    expect(tester.login).toBeNull();

    userSubject.next({ name: 'JB', permissions: ['ORDER_MANAGEMENT'] } as User);
    tester.detectChanges();

    expect(tester.user).toContainText('JB');
    expect(tester.orders).not.toBeNull();
    expect(tester.administrationDropdown).toBeNull();
    expect(tester.users).toBeNull();
    expect(tester.accessionHolders).toBeNull();
    expect(tester.logout).not.toBeNull();
    expect(tester.login).toBeNull();

    userSubject.next(null);
    tester.detectChanges();

    expect(tester.user).toBeNull();
    expect(tester.orders).toBeNull();
    expect(tester.administrationDropdown).toBeNull();
    expect(tester.users).toBeNull();
    expect(tester.accessionHolders).toBeNull();
    expect(tester.logout).toBeNull();
    expect(tester.login).not.toBeNull();

    userSubject.next({ name: 'JB', permissions: [] } as User);
    tester.detectChanges();

    expect(tester.user).toContainText('JB');
    expect(tester.orders).toBeNull();
    expect(tester.administrationDropdown).toBeNull();
    expect(tester.users).toBeNull();
    expect(tester.accessionHolders).toBeNull();
    expect(tester.logout).not.toBeNull();
    expect(tester.login).toBeNull();

    userSubject.next({ name: 'JB', permissions: ['ADMINISTRATION'] } as User);
    tester.detectChanges();

    expect(tester.user).toContainText('JB');
    expect(tester.orders).toBeNull();
    expect(tester.administrationDropdown).not.toBeNull();
    expect(tester.users).not.toBeNull();
    expect(tester.accessionHolders).not.toBeNull();
    expect(tester.logout).not.toBeNull();
    expect(tester.login).toBeNull();

    userSubject.next({ name: 'JB', permissions: ['ORDER_VISUALIZATION'] } as User);
    tester.detectChanges();

    expect(tester.user).toContainText('JB');
    expect(tester.orders).not.toBeNull();
    expect(tester.administrationDropdown).toBeNull();
    expect(tester.users).toBeNull();
    expect(tester.accessionHolders).toBeNull();
    expect(tester.logout).not.toBeNull();
    expect(tester.login).toBeNull();
  });

  it('should login', () => {
    userSubject.next(null);
    tester.detectChanges();

    tester.login.click();
    expect(authenticationService.login).toHaveBeenCalled();
  });

  it('should logout', () => {
    userSubject.next({ name: 'JB', permissions: [] } as User);
    tester.detectChanges();

    tester.logout.click();
    expect(authenticationService.logout).toHaveBeenCalled();
  });
});
