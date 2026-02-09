import { TestBed } from '@angular/core/testing';

import { errorInterceptor } from './error.interceptor';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { ToastService } from './toast.service';
import { createMock, MockObject } from '../../test/mock';
import { beforeEach, describe, expect, test } from 'vitest';

describe('errorInterceptor', () => {
  let http: HttpTestingController;
  let httpClient: HttpClient;
  let toastService: MockObject<ToastService>;

  beforeEach(() => {
    toastService = createMock(ToastService);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toastService }
      ]
    });

    http = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  test('should do nothing if no error', () => {
    httpClient.get('api/foo').subscribe({
      error: () => {
        // ignore
      }
    });

    http.expectOne('api/foo').flush('test');

    expect(toastService.error).not.toHaveBeenCalled();
  });

  test('should signal functional errors', () => {
    httpClient.get('api/foo').subscribe({
      error: () => {
        // ignore
      }
    });

    http.expectOne('api/foo').flush({ functionalError: 'FOO' }, { status: 400, statusText: 'Bad Request' });

    expect(toastService.error).toHaveBeenCalledWith('common.error-interceptor.functional-error.FOO');
  });

  test('should signal server errors', () => {
    httpClient.get('api/foo').subscribe({
      error: () => {
        // ignore
      }
    });

    http.expectOne('api/foo').flush({ message: 'FOO' }, { status: 400, statusText: 'Bad Request' });

    expect(toastService.error).toHaveBeenCalledWith('common.error-interceptor.server-error', { status: 400, message: 'FOO' });
  });

  test('should signal client errors', () => {
    httpClient.get('api/foo').subscribe({
      error: () => {
        // ignore
      }
    });

    http.expectOne('api/foo').error(new ProgressEvent('error'));

    expect(toastService.error).toHaveBeenCalledWith('common.error-interceptor.client-error');
  });
});
