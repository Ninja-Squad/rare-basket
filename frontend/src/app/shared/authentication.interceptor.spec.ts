import { beforeEach, describe, expect, it, type MockedObject } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { authenticationInterceptor } from './authentication.interceptor';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { createMock } from '../../mock';

describe('authenticationInterceptor', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;
  let oidcSecurityService: MockedObject<OidcSecurityService>;

  beforeEach(() => {
    oidcSecurityService = createMock(OidcSecurityService);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authenticationInterceptor])),
        provideHttpClientTesting(),
        {
          provide: OidcSecurityService,
          useValue: oidcSecurityService
        }
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should not do anything if not authenticated', () => {
    oidcSecurityService.getAccessToken.mockReturnValue(of(null as unknown as string));
    httpClient.get('api/foo').subscribe();

    const testRequest = httpTestingController.expectOne('api/foo');
    expect(testRequest.request.headers.get('Authorization')).toBeNull();
  });

  it('should not do anything if not to api', () => {
    oidcSecurityService.getAccessToken.mockReturnValue(of('token'));
    httpClient.get('http://foo.bar.comapi/foo').subscribe();

    const testRequest = httpTestingController.expectOne('http://foo.bar.comapi/foo');
    expect(testRequest.request.headers.get('Authorization')).toBeNull();
  });

  it('should add token if authenticated and request to api', () => {
    oidcSecurityService.getAccessToken.mockReturnValue(of('token'));
    httpClient.get('api/foo').subscribe();

    const testRequest = httpTestingController.expectOne('api/foo');
    expect(testRequest.request.headers.get('Authorization')).toBe('Bearer token');
  });
});
