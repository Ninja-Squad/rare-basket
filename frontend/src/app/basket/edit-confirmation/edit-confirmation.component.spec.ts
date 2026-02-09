import { TestBed } from '@angular/core/testing';

import { EditConfirmationComponent } from './edit-confirmation.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AccessionHolderBasket, Basket } from '../basket.model';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

@Component({
  template: `
    <rb-edit-confirmation
      [basket]="basket()"
      (basketConfirmed)="confirmationCode.set($event)"
      (refreshRequested)="refreshRequested.set(true)"
    />
  `,
  imports: [EditConfirmationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  readonly basket = signal<Basket>({
    customer: {
      email: 'john@mail.com'
    },
    accessionHolderBaskets: [] as Array<AccessionHolderBasket>
  } as Basket);
  readonly confirmationCode = signal<string | null>(null);
  readonly refreshRequested = signal(false);
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly infoRefreshLink = this.root.getByCss('#info-refresh-link');
  readonly confirmationCode = this.root.getByCss('#confirmation-code');
  readonly confirmButton = this.root.getByCss('#confirm-button');

  get componentInstance() {
    return this.fixture.componentInstance;
  }
}

describe('EditConfirmationComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });

    tester = new TestComponentTester();
    await tester.fixture.whenStable();
  });

  test('should display empty form', async () => {
    await expect.element(tester.infoRefreshLink).toBeInTheDocument();
    await expect.element(tester.confirmationCode).toHaveValue('');
    await expect.element(tester.confirmButton).toBeDisabled();
  });

  test('should emit when info refresh link clicked', async () => {
    await tester.infoRefreshLink.click();
    expect(tester.componentInstance.refreshRequested()).toBe(true);
  });

  test('should emit when confirming', async () => {
    await tester.confirmationCode.fill('ZYXWVUTS');
    await expect.element(tester.confirmButton).not.toBeDisabled();
    await tester.confirmButton.click();
    expect(tester.componentInstance.confirmationCode()).toBe('ZYXWVUTS');
  });
});
