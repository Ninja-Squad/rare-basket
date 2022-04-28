import { TestBed } from '@angular/core/testing';

import { AuthenticationInterceptorService } from './authentication-interceptor.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Injector } from '@angular/core';
import { createMock } from 'ngx-speculoos';
import { of } from 'rxjs';

describe('AuthenticationInterceptorService', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let oidcSecurityService: jasmine.SpyObj<OidcSecurityService>;

  beforeEach(() => {
    oidcSecurityService = createMock(OidcSecurityService);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthenticationInterceptorService, useClass: AuthenticationInterceptorService },
        { provide: HTTP_INTERCEPTORS, useExisting: AuthenticationInterceptorService, multi: true }
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);

    const fakeInjector = jasmine.createSpyObj<Injector>('Injector', ['get']);

    fakeInjector.get.and.returnValue(oidcSecurityService);
    const interceptor = TestBed.inject(AuthenticationInterceptorService);
    (interceptor as any).injector = fakeInjector;
  });

  it('should not do anything if not authenticated', () => {
    oidcSecurityService.getAccessToken.and.returnValue(of(null));
    httpClient.get('api/foo').subscribe();

    const testRequest = httpTestingController.expectOne('api/foo');
    expect(testRequest.request.headers.get('Authorization')).toBeNull();
  });

  it('should not do anything if not to api', () => {
    oidcSecurityService.getAccessToken.and.returnValue(of('token'));
    httpClient.get('http://foo.bar.comapi/foo').subscribe();

    const testRequest = httpTestingController.expectOne('http://foo.bar.comapi/foo');
    expect(testRequest.request.headers.get('Authorization')).toBeNull();
  });

  it('should add token if authenticated and request to api', () => {
    oidcSecurityService.getAccessToken.and.returnValue(of('token'));
    httpClient.get('api/foo').subscribe();

    const testRequest = httpTestingController.expectOne('api/foo');
    expect(testRequest.request.headers.get('Authorization')).toBe('Bearer token');
  });
});
