import { TestBed } from '@angular/core/testing';

import { AuthenticationInterceptorService } from './authentication-interceptor.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Injector } from '@angular/core';

describe('AuthenticationInterceptorService', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let oidcSecurityService: jasmine.SpyObj<OidcSecurityService>;

  beforeEach(() => {
    oidcSecurityService = jasmine.createSpyObj<OidcSecurityService>('OidcSecurityService', ['getToken']);

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
    // tslint:disable-next-line:deprecation
    fakeInjector.get.and.returnValue(oidcSecurityService);
    const interceptor = TestBed.inject(AuthenticationInterceptorService);
    (interceptor as any).injector = fakeInjector;
  });

  it('should not do anything if not authenticated', () => {
    httpClient.get('/api/foo').subscribe(() => {});

    const testRequest = httpTestingController.expectOne('/api/foo');
    expect(testRequest.request.headers.get('Authorization')).toBeNull();
  });

  it('should not do anything if not to api', () => {
    oidcSecurityService.getToken.and.returnValue('token');
    httpClient.get('http://foo.bar.com/api/foo').subscribe(() => {});

    const testRequest = httpTestingController.expectOne('http://foo.bar.com/api/foo');
    expect(testRequest.request.headers.get('Authorization')).toBeNull();
  });

  it('should add token if authenticated and request to api', () => {
    oidcSecurityService.getToken.and.returnValue('token');
    httpClient.get('/api/foo').subscribe(() => {});

    let testRequest = httpTestingController.expectOne('/api/foo');
    expect(testRequest.request.headers.get('Authorization')).toBe('Bearer token');

    httpClient.get('api/foo').subscribe(() => {});

    testRequest = httpTestingController.expectOne('api/foo');
    expect(testRequest.request.headers.get('Authorization')).toBe('Bearer token');
  });
});
