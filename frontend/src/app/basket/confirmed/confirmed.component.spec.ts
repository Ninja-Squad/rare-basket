import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { AccessionHolderBasket, Basket } from '../basket.model';
import { ConfirmedComponent } from './confirmed.component';

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
    accessionHolderBaskets: [] as Array<AccessionHolderBasket>
  } as Basket;
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
}

describe('ConfirmedComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });

    tester = new TestComponentTester();
  });

  test('should display some text, containing the email', async () => {
    await expect.element(tester.root).toMatchTextContent('john@mail.com');
  });
});
