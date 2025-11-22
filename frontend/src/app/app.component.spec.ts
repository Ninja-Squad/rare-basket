import { beforeEach, describe, expect, it, type MockedObject } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ComponentTester } from 'ngx-speculoos';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthenticationService } from './shared/authentication.service';
import { of } from 'rxjs';
import { ToastsComponent } from './rb-ngb/toasts/toasts.component';
import { provideI18nTesting } from './i18n/mock-18n';
import { createMock } from '../mock';

class AppComponentTester extends ComponentTester<AppComponent> {
  constructor() {
    super(AppComponent);
  }

  get navbar() {
    return this.element(NavbarComponent);
  }

  get routerOutlet() {
    return this.element(RouterOutlet);
  }

  get toasts() {
    return this.element(ToastsComponent);
  }
}

describe('AppComponent', () => {
  let tester: AppComponentTester;
  let authenticationService: MockedObject<AuthenticationService>;

  beforeEach(async () => {
    authenticationService = createMock(AuthenticationService);
    authenticationService.getCurrentUser.mockReturnValue(of(null));

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: AuthenticationService, useValue: authenticationService }]
    });

    tester = new AppComponentTester();
    await tester.stable();
  });

  it('should initialize auth', () => {
    expect(authenticationService.init).toHaveBeenCalled();
  });

  it('should have a router outlet', () => {
    expect(tester.routerOutlet).not.toBeNull();
  });

  it('should have a navbar', () => {
    expect(tester.navbar).not.toBeNull();
  });

  it('should have toasts', () => {
    expect(tester.toasts).not.toBeNull();
  });
});
