import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { RouterOutlet } from '@angular/router';
import { ValidationDefaultsComponent } from './validation-defaults/validation-defaults.component';
import { ValdemortModule } from 'ngx-valdemort';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthenticationService } from './shared/authentication.service';
import { of } from 'rxjs';
import { I18nTestingModule } from './i18n/i18n-testing.module.spec';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastsComponent } from './rb-ngb/toasts/toasts.component';
import { RbNgbTestingModule } from './rb-ngb/rb-ngb-testing.module';

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
  let authenticationService: jasmine.SpyObj<AuthenticationService>;

  beforeEach(() => {
    authenticationService = createMock(AuthenticationService);
    authenticationService.getCurrentUser.and.returnValue(of(null));

    TestBed.configureTestingModule({
      declarations: [AppComponent, ValidationDefaultsComponent, NavbarComponent],
      imports: [I18nTestingModule, FontAwesomeModule, RouterTestingModule, ValdemortModule, RbNgbTestingModule],
      providers: [{ provide: AuthenticationService, useValue: authenticationService }]
    });

    tester = new AppComponentTester();
    tester.detectChanges();
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
