import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { lastValueFrom, of } from 'rxjs';
import { RouterStateSnapshot } from '@angular/router';
import { createMock, stubRoute } from 'ngx-speculoos';
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

  it('should route if authenticated', async () => {
    authenticationService.isAuthenticated.and.returnValue(of(true));
    const guardResult = await lastValueFrom(TestBed.runInInjectionContext(() => authenticationGuard(stubRoute().snapshot, state)));
    expect(guardResult).toBeTrue();
  });

  it('should login if not authenticated', async () => {
    authenticationService.isAuthenticated.and.returnValue(of(false));
    const guardResult = await lastValueFrom(TestBed.runInInjectionContext(() => authenticationGuard(stubRoute().snapshot, state)));
    expect(guardResult).toBeFalse();
    expect(authenticationService.login).toHaveBeenCalledWith(state.url);
  });
});
