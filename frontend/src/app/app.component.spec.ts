import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentTester } from 'ngx-speculoos';
import { By } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ValidationDefaultsComponent } from './validation-defaults/validation-defaults.component';
import { ValdemortModule } from 'ngx-valdemort';

class AppComponentTester extends ComponentTester<AppComponent> {
  constructor() {
    super(AppComponent);
  }

  get routerOutlet() {
    return this.debugElement.query(By.directive(RouterOutlet));
  }
}

describe('AppComponent', () => {
  let tester: AppComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, ValidationDefaultsComponent],
      imports: [RouterTestingModule, ValdemortModule]
    });

    tester = new AppComponentTester();
    tester.detectChanges();
  });

  it('should have a router outlet', () => {
    expect(tester.routerOutlet).not.toBeNull();
  });
});
