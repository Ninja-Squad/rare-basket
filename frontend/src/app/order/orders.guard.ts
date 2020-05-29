import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService } from '../shared/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  canActivate(): Observable<UrlTree> {
    return this.authenticationService.getCurrentUser().pipe(
      map(user => {
        if (user.permissions.includes('ORDER_MANAGEMENT')) {
          return this.router.parseUrl('/orders/in-progress');
        } else {
          return this.router.parseUrl('/orders/stats');
        }
      })
    );
  }
}
