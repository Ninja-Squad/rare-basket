import { TestBed } from '@angular/core/testing';

import { ErrorInterceptorService } from './error-interceptor.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { ToastService } from './toast.service';

describe('ErrorInterceptorService', () => {
  let http: HttpTestingController;
  let httpClient: HttpClient;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['error']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptorService, multi: true },
        { provide: ToastService, useValue: toastService }
      ]
    });

    http = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should do nothing if no error', () => {
    httpClient.get('api/foo').subscribe({
      error: () => {
        // ignore
      }
    });

    http.expectOne('api/foo').flush('test');

    expect(toastService.error).not.toHaveBeenCalled();
  });

  it('should signal functional errors', () => {
    httpClient.get('api/foo').subscribe({
      error: () => {
        // ignore
      }
    });

    http.expectOne('api/foo').flush({ functionalError: 'FOO' }, { status: 400, statusText: 'Bad Request' });

    expect(toastService.error).toHaveBeenCalledWith('common.error-interceptor.functional-error.FOO');
  });

  it('should signal server errors', () => {
    httpClient.get('api/foo').subscribe({
      error: () => {
        // ignore
      }
    });

    http.expectOne('api/foo').flush({ message: 'FOO' }, { status: 400, statusText: 'Bad Request' });

    expect(toastService.error).toHaveBeenCalledWith('common.error-interceptor.server-error', { status: 400, message: 'FOO' });
  });

  it('should signal client errors', () => {
    httpClient.get('api/foo').subscribe({
      error: () => {
        // ignore
      }
    });

    http.expectOne('api/foo').error(new ErrorEvent('error'));

    expect(toastService.error).toHaveBeenCalledWith('common.error-interceptor.client-error');
  });
});
