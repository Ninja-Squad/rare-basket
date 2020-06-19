import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { WINDOW } from './window.service';
import { OidcConfigService, OidcSecurityService } from 'angular-auth-oidc-client';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LocationStrategy } from '@angular/common';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let fakeWindow: Window;
  let oidcConfigService: jasmine.SpyObj<OidcConfigService>;
  let oidcSecurityService: jasmine.SpyObj<OidcSecurityService>;
  let router: jasmine.SpyObj<Router>;
  let http: HttpTestingController;
  let locationStrategy: jasmine.SpyObj<LocationStrategy>;

  beforeEach(() => {
    fakeWindow = ({
      origin: 'http://localhost:4201',
      location: 'http://localhost:4201/orders',
      sessionStorage: jasmine.createSpyObj<Storage>('SessionStorage', ['getItem', 'setItem', 'removeItem'])
    } as unknown) as Window;

    oidcConfigService = jasmine.createSpyObj<OidcConfigService>('OidcConfigService', ['withConfig']);

    oidcSecurityService = jasmine.createSpyObj<OidcSecurityService>('OidcSecurityService', [
      'authorize',
      'logoff',
      'logoffLocal',
      'checkAuth'
    ]);

    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    locationStrategy = jasmine.createSpyObj<LocationStrategy>('LocaltionStrategy', ['getBaseHref']);
    locationStrategy.getBaseHref.and.returnValue('rare-basket');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: WINDOW, useValue: fakeWindow },
        { provide: OidcSecurityService, useValue: oidcSecurityService },
        { provide: OidcConfigService, useValue: oidcConfigService },
        { provide: Router, useValue: router },
        { provide: LocationStrategy, useValue: locationStrategy }
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

  it('should tell if the user is authenticated when authentication check succeeds', () => {
    const events: Array<boolean> = [];

    const subject = new Subject<boolean>();

    oidcSecurityService.checkAuth.and.returnValue(subject);

    service.init();
    service.isAuthenticated().subscribe(event => events.push(event));

    expect(events).toEqual([]);

    subject.next(true);

    expect(events).toEqual([]);

    http.expectOne('api/users/me').flush({});

    expect(events).toEqual([true]);
    service.isAuthenticated().subscribe(event => events.push(event));
    expect(events).toEqual([true, true]);

    http.verify();
  });

  it('should tell if the user is authenticated when authentication check fails', () => {
    const events: Array<boolean> = [];

    const subject = new Subject<boolean>();

    oidcSecurityService.checkAuth.and.returnValue(subject);

    service.init();
    service.isAuthenticated().subscribe(event => events.push(event));

    expect(events).toEqual([]);

    subject.next(false);

    expect(events).toEqual([false]);

    service.isAuthenticated().subscribe(event => events.push(event));
    expect(events).toEqual([false, false]);

    http.verify();
  });

  it('should tell if the user is authenticated when authentication check succeeds but getting user fails', () => {
    const events: Array<boolean> = [];

    const subject = new Subject<boolean>();

    oidcSecurityService.checkAuth.and.returnValue(subject);

    service.init();
    service.isAuthenticated().subscribe(event => events.push(event));

    expect(events).toEqual([]);

    subject.next(true);

    expect(events).toEqual([]);

    http.expectOne('api/users/me').flush({}, { status: 404, statusText: 'Not Found' });

    expect(events).toEqual([false]);
    service.isAuthenticated().subscribe(event => events.push(event));
    expect(events).toEqual([false, false]);

    http.verify();
  });

  it('should init and route to requested URL when authentication succeeds', () => {
    (fakeWindow.sessionStorage.getItem as jasmine.Spy).and.returnValue('/foo');

    const subject = new Subject<boolean>();

    oidcSecurityService.checkAuth.and.returnValue(subject);

    service.init();

    subject.next(true);
    http.expectOne('api/users/me').flush({});

    expect(router.navigateByUrl).toHaveBeenCalledWith('/foo', { replaceUrl: true });
  });
});
