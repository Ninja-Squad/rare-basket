import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationOptions, ConfirmationService } from '../confirmation.service';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';
import { provideDisabledNgbAnimation } from '../../rb-ngb/disable-animations';

class ModalComponentTester {
  constructor(private fixture: ComponentFixture<unknown>) {}

  async stable() {
    await this.fixture.whenStable();
  }

  get modalWindow(): HTMLElement {
    return document.querySelector('ngb-modal-window');
  }

  get modalBackdrop(): HTMLElement {
    return document.querySelector('ngb-modal-backdrop');
  }

  get modalBody(): HTMLElement {
    return document.querySelector('.modal-body');
  }

  get modalTitle(): HTMLElement {
    return document.querySelector('.modal-title');
  }

  async yes() {
    (document.querySelector('#yes-button') as HTMLButtonElement).click();
    await this.stable();
  }

  async no() {
    (document.querySelector('#no-button') as HTMLButtonElement).click();
    await this.stable();
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
    await tester.stable();
  });

  afterEach(() => {
    if (tester.modalWindow) {
      tester.modalWindow.parentElement.removeChild(tester.modalWindow);
    }
    if (tester.modalBackdrop) {
      tester.modalBackdrop.parentElement.removeChild(tester.modalBackdrop);
    }
  });

  function confirm(options: ConfirmationOptions): Observable<void> {
    return confirmationService.confirm(options);
  }

  it('should display a modal dialog when confirming and use default title', async () => {
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' });
    await tester.stable();
    expect(tester.modalWindow).toBeTruthy();
    expect(tester.modalTitle.textContent).toBe('Confirmation');
    expect(tester.modalBody.textContent).toContain('Voulez-vous vraiment supprimer cette accession de votre commande\u00a0?');
  });

  it('should honor the titleKey option', async () => {
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion', titleKey: 'basket.edit-basket.email' });
    await tester.stable();
    expect(tester.modalTitle.textContent).toBe('Votre adresse courriel');
  });

  it('should emit when confirming', async () => {
    let nexted = false;
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' }).subscribe(() => (nexted = true));
    await tester.stable();
    await tester.yes();

    expect(tester.modalWindow).toBeFalsy();
    expect(nexted).toBeTrue();
  });

  it('should error when not confirming and errorOnClose is true', async () => {
    let errored = false;
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion', errorOnClose: true }).subscribe({
      error: () => (errored = true)
    });
    await tester.stable();
    await tester.no();

    expect(tester.modalWindow).toBeFalsy();
    expect(errored).toBeTrue();
  });

  it('should do nothing when not confirming and errorOnClose is not set', async () => {
    let completed = false;
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' }).subscribe({
      complete: () => (completed = true)
    });
    await tester.stable();
    await tester.no();

    expect(tester.modalWindow).toBeFalsy();
    expect(completed).toBeTrue();
  });
});
