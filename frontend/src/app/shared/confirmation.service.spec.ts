import { TestBed } from '@angular/core/testing';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { ConfirmationOptions, ConfirmationService } from './confirmation.service';
import { RbNgbModule } from '../rb-ngb/rb-ngb.module';
import { MockModalModule, MockModalService } from './mock-modal.service.spec';

describe('ConfirmationService', () => {
  let confirmationService: ConfirmationService;
  let mockModalService: MockModalService<ConfirmationModalComponent>;
  let confirmationModalComponent: ConfirmationModalComponent;
  const commonOptions = { message: 'world', title: 'Hello' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmationModalComponent],
      imports: [RbNgbModule, MockModalModule]
    });
    mockModalService = TestBed.inject(MockModalService);
    confirmationService = TestBed.inject(ConfirmationService);
    confirmationModalComponent = new ConfirmationModalComponent(null);
  });

  it('should create a modal instance with title and message', () => {
    mockModalService.mockClosedModal(confirmationModalComponent);

    let closed = false;
    confirmationService.confirm(commonOptions).subscribe(() => (closed = true));

    expect(confirmationModalComponent.title).toBe('Hello');
    expect(confirmationModalComponent.message).toBe('world');
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
