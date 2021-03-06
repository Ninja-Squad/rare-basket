import { TestBed } from '@angular/core/testing';

import { ConfirmedComponent } from './confirmed.component';
import { ComponentTester } from 'ngx-speculoos';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component } from '@angular/core';
import { Basket } from '../basket.model';
import { BasketContentComponent } from '../basket-content/basket-content.component';
import { SharedModule } from '../../shared/shared.module';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';

@Component({
  template: `<rb-confirmed [basket]="basket"></rb-confirmed>`
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
      declarations: [ConfirmedComponent, TestComponent, BasketContentComponent],
      imports: [I18nTestingModule, FontAwesomeModule, SharedModule]
    });

    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should display some text, containing the email', () => {
    expect(tester.testElement).toContainText('john@mail.com');
  });
});
