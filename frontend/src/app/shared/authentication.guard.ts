import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { map } from 'rxjs/operators';

export function authenticationGuard(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
  const authenticationService = inject(AuthenticationService);
  return authenticationService.isAuthenticated().pipe(
    map(authenticated => {
      if (!authenticated) {
        authenticationService.login(state.url);
      }
      return authenticated;
    })
  );
}
