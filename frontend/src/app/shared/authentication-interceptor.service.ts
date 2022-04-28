import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, first, switchMap } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable()
export class AuthenticationInterceptorService implements HttpInterceptor {
  private oidcSecurityService: OidcSecurityService;

  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // we can't depend directly on OidcSecurityService, because (as documented), it would introduce
    // a dependency cycle
    if (!this.oidcSecurityService) {
      this.oidcSecurityService = this.injector.get(OidcSecurityService);
    }

    if (req.url.startsWith('api')) {
      return this.oidcSecurityService.getAccessToken().pipe(
        first(),
        switchMap(token => {
          let request = req;
          if (token) {
            request = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
          }
          return next.handle(request);
        })
      );
    } else {
      return next.handle(req);
    }
  }
}
