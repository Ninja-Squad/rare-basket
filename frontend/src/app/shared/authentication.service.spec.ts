import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { WINDOW } from './window.service';
import { LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
import { Router } from '@angular/router';
import { defer, of, Subject } from 'rxjs';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { createMock } from 'ngx-speculoos';
import { provideHttpClient } from '@angular/common/http';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let fakeWindow: Window;
  let oidcSecurityService: jasmine.SpyObj<OidcSecurityService>;
  let router: jasmine.SpyObj<Router>;
  let http: HttpTestingController;

  beforeEach(() => {
    fakeWindow = {
      origin: 'http://localhost:4201',
      location: 'http://localhost:4201/orders',
      sessionStorage: jasmine.createSpyObj<Storage>('SessionStorage', ['getItem', 'setItem', 'removeItem'])
    } as unknown as Window;

    oidcSecurityService = jasmine.createSpyObj<OidcSecurityService>('OidcSecurityService', [
      'authorize',
      'logoff',
      'logoffLocal',
      'checkAuth'
    ]);

    router = createMock(Router);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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
    let subscribed = false;
    oidcSecurityService.logoff.and.returnValue(
      defer(() => {
        subscribed = true;
        return of(undefined);
      })
    );
    service.logout();
    expect(oidcSecurityService.logoff).toHaveBeenCalled();
    expect(subscribed).toBeTrue();
  });

  it('should tell if the user is authenticated when authentication check succeeds', () => {
    const events: Array<boolean> = [];

    const subject = new Subject<LoginResponse>();

    oidcSecurityService.checkAuth.and.returnValue(subject);

    service.init();
    service.isAuthenticated().subscribe(event => events.push(event));

    expect(events).toEqual([]);

    subject.next({ isAuthenticated: true } as LoginResponse);

    expect(events).toEqual([]);

    http.expectOne('api/users/me').flush({});

    expect(events).toEqual([true]);
    service.isAuthenticated().subscribe(event => events.push(event));
    expect(events).toEqual([true, true]);

    http.verify();
  });

  it('should tell if the user is authenticated when authentication check fails', () => {
    const events: Array<boolean> = [];

    const subject = new Subject<LoginResponse>();

    oidcSecurityService.checkAuth.and.returnValue(subject);

    service.init();
    service.isAuthenticated().subscribe(event => events.push(event));

    expect(events).toEqual([]);

    subject.next({ isAuthenticated: false } as LoginResponse);

    expect(events).toEqual([false]);

    service.isAuthenticated().subscribe(event => events.push(event));
    expect(events).toEqual([false, false]);

    http.verify();
  });

  it('should tell if the user is authenticated when authentication check succeeds but getting user fails', () => {
    const events: Array<boolean> = [];

    const subject = new Subject<LoginResponse>();

    oidcSecurityService.checkAuth.and.returnValue(subject);

    service.init();
    service.isAuthenticated().subscribe(event => events.push(event));

    expect(events).toEqual([]);

    subject.next({ isAuthenticated: true } as LoginResponse);

    expect(events).toEqual([]);

    http.expectOne('api/users/me').flush({}, { status: 404, statusText: 'Not Found' });

    expect(events).toEqual([false]);
    service.isAuthenticated().subscribe(event => events.push(event));
    expect(events).toEqual([false, false]);

    http.verify();
  });

  it('should init and route to requested URL when authentication succeeds', () => {
    (fakeWindow.sessionStorage.getItem as jasmine.Spy).and.returnValue('/foo');

    const subject = new Subject<LoginResponse>();

    oidcSecurityService.checkAuth.and.returnValue(subject);

    service.init();

    subject.next({ isAuthenticated: true } as LoginResponse);
    http.expectOne('api/users/me').flush({});

    expect(router.navigateByUrl).toHaveBeenCalledWith('/foo', { replaceUrl: true });
  });
});
