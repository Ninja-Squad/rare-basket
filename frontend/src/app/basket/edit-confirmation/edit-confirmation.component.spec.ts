import { TestBed } from '@angular/core/testing';

import { EditConfirmationComponent } from './edit-confirmation.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Basket } from '../basket.model';
import { ComponentTester, TestButton } from 'ngx-speculoos';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

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
    accessionHolderBaskets: []
  } as Basket);
  readonly confirmationCode = signal<string | null>(null);
  readonly refreshRequested = signal(false);
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get infoRefreshLink() {
    return this.element<HTMLAnchorElement>('#info-refresh-link');
  }

  get confirmationCode() {
    return this.input('#confirmation-code');
  }

  get confirmButton(): TestButton {
    return this.button('#confirm-button');
  }
}

describe('EditConfirmationComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });

    tester = new TestComponentTester();
    await tester.stable();
  });

  it('should display empty form', () => {
    expect(tester.infoRefreshLink).not.toBeNull();
    expect(tester.confirmationCode).toHaveValue('');
    expect(tester.confirmButton.disabled).toBe(true);
  });

  it('should emit when info refresh link clicked', async () => {
    await tester.infoRefreshLink.click();
    expect(tester.componentInstance.refreshRequested()).toBe(true);
  });

  it('should emit when confirming', async () => {
    await tester.confirmationCode.fillWith('ZYXWVUTS');
    expect(tester.confirmButton.disabled).toBe(false);
    await tester.confirmButton.click();
    expect(tester.componentInstance.confirmationCode()).toBe('ZYXWVUTS');
  });
});
