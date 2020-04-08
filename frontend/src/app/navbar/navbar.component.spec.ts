import { TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { ComponentTester, speculoosMatchers, TestHtmlElement } from 'ngx-speculoos';
import { I18nTestingModule } from '../i18n/i18n-testing.module.spec';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthenticatedUserData, AuthenticationService } from '../shared/authentication.service';
import { Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

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

  get login() {
    return this.element('#navbar-login') as TestHtmlElement<HTMLAnchorElement>;
  }

  get logout() {
    return this.element('#navbar-logout') as TestHtmlElement<HTMLAnchorElement>;
  }
}

describe('NavbarComponent', () => {
  let tester: NavbarComponentTester;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let userSubject: Subject<AuthenticatedUserData>;

  beforeEach(() => {
    userSubject = new Subject<AuthenticatedUserData>();
    authenticationService = jasmine.createSpyObj<AuthenticationService>('AuthenticationService', ['login', 'logout', 'getUserData']);
    authenticationService.getUserData.and.returnValue(userSubject);

    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [I18nTestingModule, FontAwesomeModule, RouterTestingModule],
      providers: [{ provide: AuthenticationService, useValue: authenticationService }]
    });

    jasmine.addMatchers(speculoosMatchers);
    tester = new NavbarComponentTester();
    tester.detectChanges();
  });

  it('should display elements depending on user presence', () => {
    expect(tester.user).toBeNull();
    expect(tester.orders).toBeNull();
    expect(tester.logout).toBeNull();
    expect(tester.login).not.toBeNull();

    userSubject.next({ preferred_username: 'JB' });
    tester.detectChanges();

    expect(tester.user).toContainText('JB');
    expect(tester.orders).not.toBeNull();
    expect(tester.logout).not.toBeNull();
    expect(tester.login).toBeNull();

    userSubject.next(null);
    tester.detectChanges();

    expect(tester.user).toBeNull();
    expect(tester.orders).toBeNull();
    expect(tester.logout).toBeNull();
    expect(tester.login).not.toBeNull();
  });

  it('should login', () => {
    tester.login.click();
    expect(authenticationService.login).toHaveBeenCalled();
  });

  it('should logout', () => {
    userSubject.next({ preferred_username: 'JB' });
    tester.detectChanges();

    tester.logout.click();
    expect(authenticationService.logout).toHaveBeenCalled();
  });
});
