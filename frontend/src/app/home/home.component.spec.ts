import { TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

class HomeComponentTester extends ComponentTester<HomeComponent> {
  constructor() {
    super(HomeComponent);
  }
}

describe('HomeComponent', () => {
  let tester: HomeComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [FontAwesomeModule]
    });

    jasmine.addMatchers(speculoosMatchers);

    tester = new HomeComponentTester();
    tester.detectChanges();
  });

  it('should create', () => {});
});
