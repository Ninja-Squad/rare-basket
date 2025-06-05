import { TestBed } from '@angular/core/testing';

import { ordersGuard } from './orders.guard';
import { AuthenticationService } from '../shared/authentication.service';
import { BehaviorSubject } from 'rxjs';
import { User } from '../shared/user.model';
import { UrlTree } from '@angular/router';

describe('ordersGuard', () => {
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let currentUserSubject: BehaviorSubject<User>;

  beforeEach(() => {
    currentUserSubject = new BehaviorSubject<User>({
      permissions: ['ORDER_MANAGEMENT', 'ORDER_VISUALIZATION']
    } as User);
    authenticationService = jasmine.createSpyObj('AuthenticationService', ['getCurrentUser']);
    authenticationService.getCurrentUser.and.returnValue(currentUserSubject);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthenticationService, useValue: authenticationService }]
    });
  });

  it('should redirect to in progress orders if user has permission ORDER_MANAGEMENT', () => {
    let result: UrlTree | undefined;
    TestBed.runInInjectionContext(() => ordersGuard()).subscribe(r => (result = r));
    expect(result!.toString()).toBe('/orders/in-progress');
  });

  it('should redirect to statistics if user does not have permission ORDER_MANAGEMENT', () => {
    currentUserSubject.next({
      permissions: ['ORDER_VISUALIZATION']
    } as User);
    let result: UrlTree | undefined;
    TestBed.runInInjectionContext(() => ordersGuard()).subscribe(r => (result = r));
    expect(result!.toString()).toBe('/orders/stats');
  });
});
