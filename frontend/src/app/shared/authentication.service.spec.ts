import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { WINDOW } from './window.service';
import { AuthorizationResult, AuthorizationState, OidcSecurityService } from 'angular-auth-oidc-client';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, of, Subject } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { User } from './user.model';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let fakeWindow: Window;
  let oidcSecurityService: jasmine.SpyObj<OidcSecurityService>;
  let router: jasmine.SpyObj<Router>;
  let http: HttpTestingController;

  beforeEach(() => {
    fakeWindow = ({
      origin: 'http://localhost:4201',
      location: 'http://localhost:4201/orders',
      sessionStorage: jasmine.createSpyObj<Storage>('SessionStorage', ['getItem', 'setItem'])
    } as unknown) as Window;

    oidcSecurityService = jasmine.createSpyObj<OidcSecurityService>('OidcSecurityService', [
      'authorize',
      'logoff',
      'getIsAuthorized',
      'setupModule',
      'authorizedCallbackWithCode'
    ]);

    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: WINDOW, useValue: fakeWindow },
        { provide: OidcSecurityService, useValue: oidcSecurityService },
        { provide: Router, useValue: router }
      ]
    });
    service = TestBed.inject(AuthenticationService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should login without requested URL', () => {
    service.login();
    expect(fakeWindow.sessionStorage.setItem).toHaveBeenCalledWith('rare-basket-requested-url', '/');
    expect(oidcSecurityService.authorize).toHaveBeenCalled();
  });

  it('should login with requested URL', () => {
    service.login('/foo');
    expect(fakeWindow.sessionStorage.setItem).toHaveBeenCalledWith('rare-basket-requested-url', '/foo');
    expect(oidcSecurityService.authorize).toHaveBeenCalled();
  });

  it('should logout', () => {
    service.logout();
    expect(oidcSecurityService.logoff).toHaveBeenCalled();
  });

  it('should tell if the user is authenticated', () => {
    const events: Array<boolean> = [];
    const subject = new BehaviorSubject<boolean>(false);

    oidcSecurityService.getIsAuthorized.and.returnValue(subject);

    (oidcSecurityService as any).onAuthorizationResult = EMPTY;

    service.init();
    service.isAuthenticated().subscribe(event => events.push(event));

    subject.next(false);
    subject.next(false);
    subject.next(true);
    http.expectOne('/api/users/me').flush({});
    subject.next(true);
    subject.next(false);

    expect(events).toEqual([false, true, false]);
    http.verify();
  });

  it('should get the current user, or null if the user is not authenticated', () => {
    const events: Array<User> = [];
    const authenticatedSubject = new BehaviorSubject<boolean>(false);

    oidcSecurityService.getIsAuthorized.and.returnValue(authenticatedSubject);

    (oidcSecurityService as any).onAuthorizationResult = EMPTY;

    service.init();
    service.getCurrentUser().subscribe(event => events.push(event));

    authenticatedSubject.next(false);
    authenticatedSubject.next(false);
    authenticatedSubject.next(true);
    http.expectOne('/api/users/me').flush({ id: 1 });

    authenticatedSubject.next(true);
    authenticatedSubject.next(false);

    expect(events).toEqual([null, { id: 1 } as User, null]);
    http.verify();
  });

  it('should init and route to requested URL when authentication succeeds', () => {
    const subject = new Subject<AuthorizationResult>();
    (oidcSecurityService as any).onAuthorizationResult = subject;

    oidcSecurityService.getIsAuthorized.and.returnValue(of(true));

    service.init();

    subject.next({ isRenewProcess: true, authorizationState: AuthorizationState.authorized, validationResult: null });
    expect(router.navigateByUrl).not.toHaveBeenCalled();

    subject.next({ isRenewProcess: false, authorizationState: AuthorizationState.unauthorized, validationResult: null });
    expect(router.navigateByUrl).not.toHaveBeenCalled();

    subject.next({ isRenewProcess: false, authorizationState: AuthorizationState.authorized, validationResult: null });
    http.expectOne('/api/users/me').flush({});
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');

    (fakeWindow.sessionStorage.getItem as jasmine.Spy).and.returnValue('/foo');
    subject.next({ isRenewProcess: false, authorizationState: AuthorizationState.authorized, validationResult: null });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/foo');
  });
});
