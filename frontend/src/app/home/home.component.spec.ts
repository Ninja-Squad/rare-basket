import { TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

class HomeComponentTester extends ComponentTester<HomeComponent> {
  constructor() {
    super(HomeComponent);
  }

  get title() {
    return this.element('h1');
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

  it('should have a title', () => {
    expect(tester.title).toContainText('Bienvenue dans Rare Basket');
  });
});
