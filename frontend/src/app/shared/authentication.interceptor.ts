import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { first, switchMap } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const oidcSecurityService = inject(OidcSecurityService);

  if (req.url.startsWith('api')) {
    return oidcSecurityService.getAccessToken().pipe(
      first(),
      switchMap(token => {
        let request = req;
        if (token) {
          request = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }
        return next(request);
      })
    );
  } else {
    return next(req);
  }
};
