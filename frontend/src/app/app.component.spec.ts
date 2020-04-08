import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentTester } from 'ngx-speculoos';
import { By } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ValidationDefaultsComponent } from './validation-defaults/validation-defaults.component';
import { ValdemortModule } from 'ngx-valdemort';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthenticationService } from './shared/authentication.service';
import { of } from 'rxjs';
import { I18nTestingModule } from './i18n/i18n-testing.module.spec';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

class AppComponentTester extends ComponentTester<AppComponent> {
  constructor() {
    super(AppComponent);
  }

  get navbar() {
    return this.debugElement.query(By.directive(NavbarComponent));
  }

  get routerOutlet() {
    return this.debugElement.query(By.directive(RouterOutlet));
  }
}

describe('AppComponent', () => {
  let tester: AppComponentTester;

  beforeEach(() => {
    const authenticationService = jasmine.createSpyObj<AuthenticationService>('AuthenticationService', ['getUserData']);
    authenticationService.getUserData.and.returnValue(of(null));

    TestBed.configureTestingModule({
      declarations: [AppComponent, ValidationDefaultsComponent, NavbarComponent],
      imports: [I18nTestingModule, FontAwesomeModule, RouterTestingModule, ValdemortModule],
      providers: [{ provide: AuthenticationService, useValue: authenticationService }]
    });

    tester = new AppComponentTester();
    tester.detectChanges();
  });

  it('should have a router outlet', () => {
    expect(tester.routerOutlet).not.toBeNull();
  });

  it('should have a navbar', () => {
    expect(tester.navbar).not.toBeNull();
  });
});
