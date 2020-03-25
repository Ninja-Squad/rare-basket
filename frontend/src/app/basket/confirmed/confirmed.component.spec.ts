import { TestBed } from '@angular/core/testing';

import { ConfirmedComponent } from './confirmed.component';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component } from '@angular/core';
import { Basket } from '../basket.model';

@Component({
  template: `
    <rb-confirmed [basket]="basket"></rb-confirmed>
  `
})
class TestComponent {
  basket = {
    customer: {
      email: 'john@mail.com'
    }
  } as Basket;
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }
}

describe('ConfirmedComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmedComponent, TestComponent],
      imports: [FontAwesomeModule]
    });

    tester = new TestComponentTester();
    tester.detectChanges();

    jasmine.addMatchers(speculoosMatchers);
  });

  it('should display some text, containing the email', () => {
    expect(tester.testElement).toContainText('john@mail.com');
  });
});
