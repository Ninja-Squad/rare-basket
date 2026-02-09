import { TestBed } from '@angular/core/testing';
import { HttpStatusCode } from '@angular/common/http';

import { Toast, ToastService } from './toast.service';
import { provideI18nTesting } from '../i18n/mock-18n';
import { beforeEach, describe, expect, test } from 'vitest';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });
    service = TestBed.inject(ToastService);
  });

  test('should signal errors and successes', () => {
    const toasts: Array<Toast> = [];
    service.toasts().subscribe(toast => toasts.push(toast));

    service.error('common.error-interceptor.server-error', { status: HttpStatusCode.BadRequest, message: 'foo' });
    service.success('common.yes');

    expect(toasts).toEqual([
      {
        message: `Une erreur inattendue (400) s'est produite sur le serveur\u00a0: foo`,
        type: 'error'
      },
      {
        message: 'Oui',
        type: 'success'
      }
    ]);
  });
});
