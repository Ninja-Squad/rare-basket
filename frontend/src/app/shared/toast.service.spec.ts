import { TestBed } from '@angular/core/testing';

import { Toast, ToastService } from './toast.service';
import { I18nTestingModule } from '../i18n/i18n-testing.module.spec';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule]
    });
    service = TestBed.inject(ToastService);
  });

  it('should signal errors and successes', () => {
    const toasts: Array<Toast> = [];
    service.toasts().subscribe(toast => toasts.push(toast));

    service.error('common.error-interceptor.server-error', { status: 400, message: 'foo' });
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
