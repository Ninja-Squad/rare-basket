import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { lastValueFrom, of } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authenticationGuard } from './authentication.guard';
import { beforeEach, describe, expect, test } from 'vitest';
import { createMock, MockObject } from '../../test/mock';

describe('AuthenticationGuard', () => {
  let authenticationService: MockObject<AuthenticationService>;
  let state: RouterStateSnapshot;
  let route: ActivatedRouteSnapshot;

  beforeEach(() => {
    authenticationService = createMock(AuthenticationService);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthenticationService, useValue: authenticationService }]
    });
    state = { url: '/foo' } as RouterStateSnapshot;
    route = {} as ActivatedRouteSnapshot;
  });

  test('should route if authenticated', async () => {
    authenticationService.isAuthenticated.mockReturnValue(of(true));
    const guardResult = await lastValueFrom(TestBed.runInInjectionContext(() => authenticationGuard(route, state)));
    expect(guardResult).toBe(true);
  });

  test('should login if not authenticated', async () => {
    authenticationService.isAuthenticated.mockReturnValue(of(false));
    const guardResult = await lastValueFrom(TestBed.runInInjectionContext(() => authenticationGuard(route, state)));
    expect(guardResult).toBe(false);
    expect(authenticationService.login).toHaveBeenCalledWith(state.url);
  });
});
