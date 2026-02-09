import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { WINDOW } from './window.service';
import { LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
import { Router } from '@angular/router';
import { defer, of, Subject } from 'rxjs';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { createMock, MockObject } from '../../test/mock';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let fakeWindow: Window;
  let oidcSecurityService: MockObject<OidcSecurityService>;
  let router: MockObject<Router>;
  let http: HttpTestingController;
  let sessionStorageMock: Storage;

  beforeEach(() => {
    fakeWindow = {
      origin: 'http://localhost:4201',
      location: 'http://localhost:4201/orders',
      sessionStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0
      } as unknown as Storage
    } as unknown as Window;
    sessionStorageMock = fakeWindow.sessionStorage;

    oidcSecurityService = createMock(OidcSecurityService);

    router = createMock(Router);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        { provide: WINDOW, useValue: fakeWindow },
        { provide: OidcSecurityService, useValue: oidcSecurityService },
        { provide: Router, useValue: router }
      ]
    });
    service = TestBed.inject(AuthenticationService);
    http = TestBed.inject(HttpTestingController);
  });

  test('should login without requested URL', () => {
    service.login();
    expect(fakeWindow.sessionStorage.setItem).toHaveBeenCalledWith('rare-basket-requested-url', '/');
    expect(oidcSecurityService.authorize).toHaveBeenCalled();
  });

  test('should login with requested URL', () => {
    service.login('/foo');
    expect(fakeWindow.sessionStorage.setItem).toHaveBeenCalledWith('rare-basket-requested-url', '/foo');
    expect(oidcSecurityService.authorize).toHaveBeenCalled();
  });

  test('should logout', () => {
    let subscribed = false;
    oidcSecurityService.logoff.mockReturnValue(
      defer(() => {
        subscribed = true;
        return of(undefined);
      })
    );
    service.logout();
    expect(oidcSecurityService.logoff).toHaveBeenCalled();
    expect(subscribed).toBe(true);
  });

  test('should tell if the user is authenticated when authentication check succeeds', () => {
    const events: Array<boolean> = [];

    const subject = new Subject<LoginResponse>();

    oidcSecurityService.checkAuth.mockReturnValue(subject);

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

  test('should tell if the user is authenticated when authentication check fails', () => {
    const events: Array<boolean> = [];

    const subject = new Subject<LoginResponse>();

    oidcSecurityService.checkAuth.mockReturnValue(subject);

    service.init();
    service.isAuthenticated().subscribe(event => events.push(event));

    expect(events).toEqual([]);

    subject.next({ isAuthenticated: false } as LoginResponse);

    expect(events).toEqual([false]);

    service.isAuthenticated().subscribe(event => events.push(event));
    expect(events).toEqual([false, false]);

    http.verify();
  });

  test('should tell if the user is authenticated when authentication check succeeds but getting user fails', () => {
    const events: Array<boolean> = [];

    const subject = new Subject<LoginResponse>();

    oidcSecurityService.checkAuth.mockReturnValue(subject);

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

  test('should init and route to requested URL when authentication succeeds', () => {
    (sessionStorageMock.getItem as Mock).mockReturnValue('/foo');

    const subject = new Subject<LoginResponse>();

    oidcSecurityService.checkAuth.mockReturnValue(subject);

    service.init();

    subject.next({ isAuthenticated: true } as LoginResponse);
    http.expectOne('api/users/me').flush({});

    expect(router.navigateByUrl).toHaveBeenCalledWith('/foo', { replaceUrl: true });
  });
});
