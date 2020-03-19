import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../shared.module';
import { ConfirmationOptions, ConfirmationService } from '../confirmation.service';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [SharedModule]
    });

    confirmationService = TestBed.inject(ConfirmationService);
    tester = new ModalComponentTester(TestBed.createComponent(TestComponent));
    tester.detectChanges();
  }));

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
    confirm({ message: 'Really?' });
    expect(tester.modalWindow).toBeTruthy();
    expect(tester.modalTitle.textContent).toBe('Confirmation');
    expect(tester.modalBody.textContent).toContain('Really?');
  });

  it('should honor the title option', () => {
    confirm({ message: 'Really?', title: 'foo' });
    expect(tester.modalTitle.textContent).toBe('foo');
  });

  it('should emit when confirming', (done: DoneFn) => {
    confirm({ message: 'Really?' }).subscribe(() => done());
    tester.yes();

    expect(tester.modalWindow).toBeFalsy();
  });

  it('should error when not confirming and errorOnClose is true', (done: DoneFn) => {
    confirm({ message: 'Really?', errorOnClose: true }).subscribe({ error: () => done() });
    tester.no();

    expect(tester.modalWindow).toBeFalsy();
  });

  it('should do nothing when not confirming and errorOnClose is not set', (done: DoneFn) => {
    confirm({ message: 'Really?' }).subscribe({
      error: () => fail(),
      complete: () => done()
    });
    tester.no();

    expect(tester.modalWindow).toBeFalsy();
  });
});
