import { beforeEach, describe, expect, it, type MockedObject } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { lastValueFrom, of } from 'rxjs';
import { RouterStateSnapshot } from '@angular/router';
import { stubRoute } from 'ngx-speculoos';
import { authenticationGuard } from './authentication.guard';
import { createMock } from '../../mock';

describe('AuthenticationGuard', () => {
  let authenticationService: MockedObject<AuthenticationService>;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    authenticationService = createMock(AuthenticationService);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthenticationService, useValue: authenticationService }]
    });
    state = { url: '/foo' } as RouterStateSnapshot;
  });

  it('should route if authenticated', async () => {
    authenticationService.isAuthenticated.mockReturnValue(of(true));
    const guardResult = await lastValueFrom(TestBed.runInInjectionContext(() => authenticationGuard(stubRoute().snapshot, state)));
    expect(guardResult).toBe(true);
  });

  it('should login if not authenticated', async () => {
    authenticationService.isAuthenticated.mockReturnValue(of(false));
    const guardResult = await lastValueFrom(TestBed.runInInjectionContext(() => authenticationGuard(stubRoute().snapshot, state)));
    expect(guardResult).toBe(false);
    expect(authenticationService.login).toHaveBeenCalledWith(state.url);
  });
});
