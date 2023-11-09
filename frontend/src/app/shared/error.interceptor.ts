import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { ToastService } from './toast.service';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    tap({
      error: error => {
        const status = error.status;
        if (status) {
          // The backend returned an unsuccessful response code.
          const body = error.error;
          const functionalError = body?.functionalError;

          if (status === HttpStatusCode.BadRequest && functionalError) {
            toastService.error(`common.error-interceptor.functional-error.${functionalError}`);
          } else {
            const errorMessage = body?.message ?? body ?? '';
            toastService.error('common.error-interceptor.server-error', { status, message: errorMessage });
          }
        } else {
          // A client-side or network error occurred.
          toastService.error('common.error-interceptor.client-error');
        }
      }
    })
  );
};
