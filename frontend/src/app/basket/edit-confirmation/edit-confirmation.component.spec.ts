import { TestBed } from '@angular/core/testing';

import { EditConfirmationComponent } from './edit-confirmation.component';
import { Component } from '@angular/core';
import { Basket } from '../basket.model';
import { ComponentTester, TestButton } from 'ngx-speculoos';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { BasketContentComponent } from '../basket-content/basket-content.component';
import { SharedModule } from '../../shared/shared.module';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';

@Component({
  template: `
    <rb-edit-confirmation
      [basket]="basket"
      (basketConfirmed)="confirmationCode = $event"
      (refreshRequested)="refreshRequested = true"
    ></rb-edit-confirmation>
  `
})
class TestComponent {
  basket = {
    customer: {
      email: 'john@mail.com'
    },
    accessionHolderBaskets: []
  } as Basket;
  confirmationCode: string = null;
  refreshRequested = false;
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditConfirmationComponent, TestComponent, BasketContentComponent],
      imports: [I18nTestingModule, FontAwesomeModule, ReactiveFormsModule, SharedModule]
    });

    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should display empty form', () => {
    expect(tester.infoRefreshLink).not.toBeNull();
    expect(tester.confirmationCode).toHaveValue('');
    expect(tester.confirmButton.disabled).toBe(true);
  });

  it('should emit when info refresh link clicked', () => {
    tester.infoRefreshLink.click();
    expect(tester.componentInstance.refreshRequested).toBe(true);
  });

  it('should emit when confirming', () => {
    tester.confirmationCode.fillWith('ZYXWVUTS');
    expect(tester.confirmButton.disabled).toBe(false);
    tester.confirmButton.click();
    expect(tester.componentInstance.confirmationCode).toBe('ZYXWVUTS');
  });
});
