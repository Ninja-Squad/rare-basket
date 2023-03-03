import { TestBed } from '@angular/core/testing';

import { FinalizationWarningsModalComponent } from './finalization-warnings-modal.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

class FinalizationWarningsModalComponentTester extends ComponentTester<FinalizationWarningsModalComponent> {
  constructor() {
    super(FinalizationWarningsModalComponent);
  }

  get yesButton() {
    return this.button('#yes-button');
  }

  get noButton() {
    return this.button('#no-button');
  }

  get messages() {
    return this.elements('li');
  }
}

describe('FinalizationWarningsModalComponent', () => {
  let tester: FinalizationWarningsModalComponentTester;
  let activeModal: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(() => {
    activeModal = createMock(NgbActiveModal);

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: NgbActiveModal, useValue: activeModal }]
    });

    tester = new FinalizationWarningsModalComponentTester();
    tester.componentInstance.init(['foo', 'bar']);
    tester.detectChanges();
  });

  it('should display messages', () => {
    expect(tester.messages.length).toBe(2);
    expect(tester.messages[0]).toHaveText('foo');
    expect(tester.messages[1]).toHaveText('bar');
  });

  it('should close when clicking yes', () => {
    tester.yesButton.click();
    expect(activeModal.close).toHaveBeenCalled();
  });

  it('should dismiss when clicking no', () => {
    tester.noButton.click();
    expect(activeModal.dismiss).toHaveBeenCalled();
  });
});
