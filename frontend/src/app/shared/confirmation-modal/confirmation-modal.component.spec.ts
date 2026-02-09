import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationOptions, ConfirmationService } from '../confirmation.service';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { provideDisabledNgbAnimation } from '../../rb-ngb/disable-animations';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

class ModalComponentTester {
  constructor(public fixture: ComponentFixture<unknown>) {}

  get modalWindow(): HTMLElement | null {
    return document.querySelector('ngb-modal-window');
  }

  get modalBackdrop(): HTMLElement | null {
    return document.querySelector('ngb-modal-backdrop');
  }

  get modalBody(): HTMLElement | null {
    return document.querySelector('.modal-body');
  }

  get modalTitle(): HTMLElement | null {
    return document.querySelector('.modal-title');
  }

  async yes() {
    (document.querySelector('#yes-button') as HTMLButtonElement).click();
    await this.fixture.whenStable();
  }

  async no() {
    (document.querySelector('#no-button') as HTMLButtonElement).click();
    await this.fixture.whenStable();
  }
}

/**
 * A test component just to be able to create a fixture to detect changes
 */
@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {}

describe('ConfirmationModalComponent and ConfirmationService', () => {
  let tester: ModalComponentTester;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), provideDisabledNgbAnimation()]
    });

    confirmationService = TestBed.inject(ConfirmationService);
    tester = new ModalComponentTester(TestBed.createComponent(TestComponent));
    await tester.fixture.whenStable();
  });

  afterEach(() => {
    if (tester.modalWindow) {
      tester.modalWindow.parentElement!.removeChild(tester.modalWindow);
    }
    if (tester.modalBackdrop) {
      tester.modalBackdrop.parentElement!.removeChild(tester.modalBackdrop);
    }
  });

  function confirm(options: ConfirmationOptions): Observable<void> {
    return confirmationService.confirm(options);
  }

  test('should display a modal dialog when confirming and use default title', async () => {
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' });
    await tester.fixture.whenStable();
    expect(tester.modalWindow).toBeTruthy();
    expect(tester.modalTitle?.textContent).toBe('Confirmation');
    expect(tester.modalBody?.textContent).toContain('Voulez-vous vraiment supprimer cette accession de votre commande\u00a0?');
  });

  test('should honor the titleKey option', async () => {
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion', titleKey: 'basket.edit-basket.email' });
    await tester.fixture.whenStable();
    expect(tester.modalTitle?.textContent).toBe('Votre adresse courriel');
  });

  test('should emit when confirming', async () => {
    let nexted = false;
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' }).subscribe(() => (nexted = true));
    await tester.fixture.whenStable();
    await tester.yes();

    expect(tester.modalWindow).toBeFalsy();
    expect(nexted).toBe(true);
  });

  test('should error when not confirming and errorOnClose is true', async () => {
    let errored = false;
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion', errorOnClose: true }).subscribe({
      error: () => (errored = true)
    });
    await tester.fixture.whenStable();
    await tester.no();

    expect(tester.modalWindow).toBeFalsy();
    expect(errored).toBe(true);
  });

  test('should do nothing when not confirming and errorOnClose is not set', async () => {
    let completed = false;
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' }).subscribe({
      complete: () => (completed = true)
    });
    await tester.fixture.whenStable();
    await tester.no();

    expect(tester.modalWindow).toBeFalsy();
    expect(completed).toBe(true);
  });
});
