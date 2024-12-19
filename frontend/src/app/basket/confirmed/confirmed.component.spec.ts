import { TestBed } from '@angular/core/testing';

import { ConfirmedComponent } from './confirmed.component';
import { ComponentTester } from 'ngx-speculoos';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Basket } from '../basket.model';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

@Component({
  template: `<rb-confirmed [basket]="basket" />`,
  imports: [ConfirmedComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });

    tester = new TestComponentTester();
    await tester.stable();
  });

  it('should display some text, containing the email', () => {
    expect(tester.testElement).toContainText('john@mail.com');
  });
});
