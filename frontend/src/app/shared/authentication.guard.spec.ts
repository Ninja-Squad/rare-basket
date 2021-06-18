import { TestBed, waitForAsync } from '@angular/core/testing';

import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from './authentication.service';
import { of } from 'rxjs';
import { RouterStateSnapshot } from '@angular/router';

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    authenticationService = jasmine.createSpyObj<AuthenticationService>('AuthenticationService', ['isAuthenticated', 'login']);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthenticationService, useValue: authenticationService }]
    });
    guard = TestBed.inject(AuthenticationGuard);
    state = { url: '/foo' } as RouterStateSnapshot;
  });

  it(
    'should route if authenticated',
    waitForAsync(() => {
      authenticationService.isAuthenticated.and.returnValue(of(true));
      guard.canActivate(null, state).subscribe(value => expect(value).toBe(true));
      guard.canActivateChild(null, state).subscribe(value => expect(value).toBe(true));
    })
  );

  it(
    'should login if not authenticated',
    waitForAsync(() => {
      authenticationService.isAuthenticated.and.returnValue(of(false));
      guard.canActivate(null, state).subscribe(value => {
        expect(value).toBe(false);
        expect(authenticationService.login).toHaveBeenCalledWith(state.url);
      });
      guard.canActivateChild(null, state).subscribe(value => {
        expect(value).toBe(false);
        expect(authenticationService.login).toHaveBeenCalledWith(state.url);
      });
    })
  );
});
