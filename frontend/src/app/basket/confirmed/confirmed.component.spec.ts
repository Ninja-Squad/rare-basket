import { TestBed } from '@angular/core/testing';

import { ConfirmedComponent } from './confirmed.component';
import { ComponentTester } from 'ngx-speculoos';
import { Component } from '@angular/core';
import { Basket } from '../basket.model';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

@Component({
  template: `<rb-confirmed [basket]="basket" />`,
  imports: [ConfirmedComponent]
})
class TestComponent {
  basket = {
    customer: {
      email: 'john@mail.com'
    },
    accessionHolderBaskets: []
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
      providers: [provideI18nTesting()]
    });

    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should display some text, containing the email', () => {
    expect(tester.testElement).toContainText('john@mail.com');
  });
});
