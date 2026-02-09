import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthenticationService } from './shared/authentication.service';
import { of } from 'rxjs';
import { provideI18nTesting } from './i18n/mock-18n';
import { beforeEach, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { createMock, MockObject } from '../test/mock';

class AppComponentTester {
  readonly fixture = TestBed.createComponent(AppComponent);
  readonly navbar = page.getByCss('rb-navbar');
  readonly routerOutlet = page.getByCss('router-outlet');
  readonly toasts = page.getByCss('rb-toasts');
}

describe('AppComponent', () => {
  let tester: AppComponentTester;
  let authenticationService: MockObject<AuthenticationService>;

  beforeEach(async () => {
    authenticationService = createMock(AuthenticationService);
    authenticationService.getCurrentUser.mockReturnValue(of(null));

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: AuthenticationService, useValue: authenticationService }]
    });

    tester = new AppComponentTester();
  });

  test('should initialize auth', () => {
    expect(authenticationService.init).toHaveBeenCalled();
  });

  test('should have a router outlet', async () => {
    await expect.element(tester.routerOutlet).toBeInTheDocument();
  });

  test('should have a navbar', async () => {
    await expect.element(tester.navbar).toBeInTheDocument();
  });

  test('should have toasts', async () => {
    await expect.element(tester.toasts).toBeInTheDocument();
  });
});
