import { TestBed, waitForAsync } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { of } from 'rxjs';
import { RouterStateSnapshot } from '@angular/router';
import { createMock } from 'ngx-speculoos';
import { authenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    authenticationService = createMock(AuthenticationService);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthenticationService, useValue: authenticationService }]
    });
    state = { url: '/foo' } as RouterStateSnapshot;
  });

  it('should route if authenticated', waitForAsync(() => {
    authenticationService.isAuthenticated.and.returnValue(of(true));
    TestBed.runInInjectionContext(() => authenticationGuard(null, state)).subscribe(value => expect(value).toBe(true));
  }));

  it('should login if not authenticated', waitForAsync(() => {
    authenticationService.isAuthenticated.and.returnValue(of(false));
    TestBed.runInInjectionContext(() => authenticationGuard(null, state)).subscribe(value => {
      expect(value).toBe(false);
      expect(authenticationService.login).toHaveBeenCalledWith(state.url);
    });
  }));
});
