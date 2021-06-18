import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../shared.module';
import { ConfirmationOptions, ConfirmationService } from '../confirmation.service';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { RbNgbTestingModule } from '../../rb-ngb/rb-ngb-testing.module';

class ModalComponentTester {
  constructor(private fixture: ComponentFixture<any>) {}

  detectChanges() {
    this.fixture.detectChanges();
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

  yes() {
    (document.querySelector('#yes-button') as HTMLButtonElement).click();
    this.detectChanges();
  }

  no() {
    (document.querySelector('#no-button') as HTMLButtonElement).click();
    this.detectChanges();
  }
}

/**
 * A test component jsut to be able to create a fixture to detect changes
 */
@Component({
  template: ''
})
class TestComponent {}

describe('ConfirmationModalComponent and ConfirmationService', () => {
  let tester: ModalComponentTester;
  let confirmationService: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [I18nTestingModule, SharedModule, RbNgbTestingModule]
    });

    confirmationService = TestBed.inject(ConfirmationService);
    tester = new ModalComponentTester(TestBed.createComponent(TestComponent));
    tester.detectChanges();
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
    const result = confirmationService.confirm(options);
    tester.detectChanges();
    return result;
  }

  it('should display a modal dialog when confirming and use default title', () => {
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' });
    expect(tester.modalWindow).toBeTruthy();
    expect(tester.modalTitle.textContent).toBe('Confirmation');
    expect(tester.modalBody.textContent).toContain('Voulez-vous vraiment supprimer cette accession de votre commande\u00a0?');
  });

  it('should honor the titleKey option', () => {
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion', titleKey: 'basket.edit-basket.email' });
    expect(tester.modalTitle.textContent).toBe('Votre adresse courriel');
  });

  it('should emit when confirming', (done: DoneFn) => {
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' }).subscribe(() => done());
    tester.yes();

    expect(tester.modalWindow).toBeFalsy();
  });

  it('should error when not confirming and errorOnClose is true', (done: DoneFn) => {
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion', errorOnClose: true }).subscribe({ error: () => done() });
    tester.no();

    expect(tester.modalWindow).toBeFalsy();
  });

  it('should do nothing when not confirming and errorOnClose is not set', (done: DoneFn) => {
    confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' }).subscribe({
      error: () => fail(),
      complete: () => done()
    });
    tester.no();

    expect(tester.modalWindow).toBeFalsy();
  });
});
