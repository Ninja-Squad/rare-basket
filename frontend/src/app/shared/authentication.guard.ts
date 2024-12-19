import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

export function authenticationGuard(_childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
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
