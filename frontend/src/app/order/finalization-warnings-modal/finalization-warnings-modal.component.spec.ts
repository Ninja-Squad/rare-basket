import { TestBed } from '@angular/core/testing';

import { FinalizationWarningsModalComponent } from './finalization-warnings-modal.component';
import { createMock, MockObject } from '../../../test/mock';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

class FinalizationWarningsModalComponentTester {
  readonly fixture = TestBed.createComponent(FinalizationWarningsModalComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly yesButton = this.root.getByCss('#yes-button');
  readonly noButton = this.root.getByCss('#no-button');
  readonly messages = this.root.getByCss('li');

  get componentInstance() {
    return this.fixture.componentInstance;
  }
}

describe('FinalizationWarningsModalComponent', () => {
  let tester: FinalizationWarningsModalComponentTester;
  let activeModal: MockObject<NgbActiveModal>;

  beforeEach(async () => {
    activeModal = createMock(NgbActiveModal);

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: NgbActiveModal, useValue: activeModal }]
    });

    tester = new FinalizationWarningsModalComponentTester();
    tester.componentInstance.init(['foo', 'bar']);
    await tester.fixture.whenStable();
  });

  test('should display messages', async () => {
    await expect.element(tester.messages).toHaveLength(2);
    await expect.element(tester.messages.nth(0)).toHaveTextContent('foo');
    await expect.element(tester.messages.nth(1)).toHaveTextContent('bar');
  });

  test('should close when clicking yes', async () => {
    await tester.yesButton.click();
    expect(activeModal.close).toHaveBeenCalled();
  });

  test('should dismiss when clicking no', async () => {
    await tester.noButton.click();
    expect(activeModal.dismiss).toHaveBeenCalled();
  });
});
