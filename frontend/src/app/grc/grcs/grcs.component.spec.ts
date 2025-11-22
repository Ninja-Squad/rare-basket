import { beforeEach, describe, expect, it, type MockedObject } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { GrcsComponent } from './grcs.component';
import { ComponentTester, TestButton } from 'ngx-speculoos';
import { ConfirmationService } from '../../shared/confirmation.service';
import { EMPTY, of } from 'rxjs';
import { Grc } from '../../shared/user.model';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { provideRouter } from '@angular/router';
import { createMock } from '../../../mock';

class GrcsComponentTester extends ComponentTester<GrcsComponent> {
  constructor() {
    super(GrcsComponent);
  }

  get grcs() {
    return this.elements('.grc');
  }

  get createLink() {
    return this.element('#create-grc');
  }

  get deleteButtons() {
    return this.elements('.delete-grc-button') as Array<TestButton>;
  }
}

describe('GrcsComponent', () => {
  let tester: GrcsComponentTester;
  let grcService: MockedObject<GrcService>;
  let confirmationService: MockedObject<ConfirmationService>;
  let toastService: MockedObject<ToastService>;

  beforeEach(() => {
    grcService = createMock(GrcService);
    confirmationService = createMock(ConfirmationService);
    toastService = createMock(ToastService);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideI18nTesting(),
        { provide: GrcService, useValue: grcService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: ToastService, useValue: toastService }
      ]
    });
  });

  it('should not display anything until grcs are available', async () => {
    grcService.list.mockReturnValue(EMPTY);
    tester = new GrcsComponentTester();
    await tester.stable();

    expect(tester.grcs.length).toBe(0);
    expect(tester.createLink).toBeNull();
  });

  it('should display grcs', async () => {
    const grcs: Array<Grc> = [
      {
        id: 432,
        name: 'GRC1',
        institution: 'INRAE',
        address: ''
      },
      {
        id: 433,
        name: 'GRC2',
        institution: 'INRAE',
        address: ''
      }
    ];

    grcService.list.mockReturnValue(of(grcs));
    tester = new GrcsComponentTester();
    await tester.stable();

    expect(tester.grcs.length).toBe(2);
    expect(tester.grcs[0]).toContainText('GRC1');
    expect(tester.grcs[0]).toContainText('INRAE');
    expect(tester.grcs[1]).toContainText('GRC2');
    expect(tester.grcs[1]).toContainText('INRAE');
    expect(tester.createLink).not.toBeNull();
  });

  it('should delete after confirmation and reload', async () => {
    const grcs: Array<Grc> = [
      {
        id: 432,
        name: 'GRC1',
        institution: 'INRAE',
        address: ''
      },
      {
        id: 433,
        name: 'GRC2',
        institution: 'INRAE',
        address: ''
      }
    ];

    grcService.list.mockReturnValueOnce(of(grcs)).mockReturnValueOnce(of([grcs[1]]));
    tester = new GrcsComponentTester();
    await tester.stable();

    confirmationService.confirm.mockReturnValue(of(undefined));
    grcService.delete.mockReturnValue(of(undefined));

    await tester.deleteButtons[0].click();

    expect(tester.grcs.length).toBe(1);
    expect(grcService.delete).toHaveBeenCalledWith(432);
    expect(toastService.success).toHaveBeenCalled();
  });
});
