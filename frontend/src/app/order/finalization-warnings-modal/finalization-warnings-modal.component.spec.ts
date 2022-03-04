import { TestBed } from '@angular/core/testing';

import { FinalizationWarningsModalComponent } from './finalization-warnings-modal.component';
import { ComponentTester, createMock, speculoosMatchers } from 'ngx-speculoos';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RbNgbTestingModule } from '../../rb-ngb/rb-ngb-testing.module';

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
      imports: [I18nTestingModule, RbNgbTestingModule, FontAwesomeModule],
      declarations: [FinalizationWarningsModalComponent],
      providers: [{ provide: NgbActiveModal, useValue: activeModal }]
    });

    jasmine.addMatchers(speculoosMatchers);

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
