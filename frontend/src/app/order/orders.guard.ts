import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService } from '../shared/authentication.service';

export function ordersGuard(): Observable<UrlTree> {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);
  return authenticationService.getCurrentUser().pipe(
    map(user => {
      if (user.permissions.includes('ORDER_MANAGEMENT')) {
        return router.parseUrl('/orders/in-progress');
      } else {
        return router.parseUrl('/orders/stats');
      }
    })
  );
}
