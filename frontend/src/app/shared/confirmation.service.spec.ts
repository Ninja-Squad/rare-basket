import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { ConfirmationOptions, ConfirmationService } from './confirmation.service';
import { MockModalService, provideModalTesting } from '../rb-ngb/mock-modal.service';
import { provideI18nTesting } from '../i18n/mock-18n';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { createMock } from '../../mock';

describe('ConfirmationService', () => {
  let confirmationService: ConfirmationService;
  let mockModalService: MockModalService<ConfirmationModalComponent>;
  let confirmationModalComponent: ConfirmationModalComponent;
  const commonOptions = { messageKey: 'basket.edit-basket.confirm-accession-deletion' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), provideModalTesting(), { provide: NgbActiveModal, useValue: createMock(NgbActiveModal) }]
    });
    mockModalService = TestBed.inject(MockModalService);
    confirmationService = TestBed.inject(ConfirmationService);
    confirmationModalComponent = TestBed.runInInjectionContext(() => new ConfirmationModalComponent());
  });

  it('should create a modal instance with title and message', () => {
    mockModalService.mockClosedModal(confirmationModalComponent);

    let closed = false;
    confirmationService.confirm(commonOptions).subscribe(() => (closed = true));

    expect(confirmationModalComponent.title()).toBe('Confirmation');
    expect(confirmationModalComponent.message()).toBe('Voulez-vous vraiment supprimer cette accession de votre commande\u00a0?');
    expect(closed).toBe(true);
  });

  it('should do nothing on No', () => {
    mockModalService.mockDismissedModal(confirmationModalComponent);

    let closed = false;
    confirmationService.confirm(commonOptions).subscribe(() => (closed = true));

    expect(closed).toBe(false);
  });

  it('should emit an error if on No if options says so', () => {
    mockModalService.mockDismissedWithErrorModal(confirmationModalComponent);

    let hasErrored = false;
    const options: ConfirmationOptions = { ...commonOptions, errorOnClose: true };
    confirmationService.confirm(options).subscribe({ error: () => (hasErrored = true) });

    expect(hasErrored).toBe(true);
  });
});
