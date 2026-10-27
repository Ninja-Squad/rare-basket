import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { beforeEach, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { createMock, MockObject } from '../../../test/mock';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { ConfirmationService } from '../../shared/confirmation.service';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';
import { Grc } from '../../shared/user.model';
import { GrcsComponent } from './grcs.component';

class GrcsComponentTester {
  readonly fixture = TestBed.createComponent(GrcsComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly grcs = this.root.getByCss('.grc');
  readonly createLink = this.root.getByCss('#create-grc');
  readonly deleteButtons = this.root.getByCss('.delete-grc-button');
}

describe('GrcsComponent', () => {
  let tester: GrcsComponentTester;
  let grcService: MockObject<GrcService>;
  let confirmationService: MockObject<ConfirmationService>;
  let toastService: MockObject<ToastService>;

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

  test('should not display anything until grcs are available', async () => {
    grcService.list.mockReturnValue(EMPTY);
    tester = new GrcsComponentTester();

    await expect.element(tester.grcs).toHaveLength(0);
    await expect.element(tester.createLink).not.toBeInTheDocument();
  });

  test('should display grcs', async () => {
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
    await tester.fixture.whenStable();

    await expect.element(tester.grcs).toHaveLength(2);
    await expect.element(tester.grcs.nth(0)).toMatchTextContent('GRC1');
    await expect.element(tester.grcs.nth(0)).toMatchTextContent('INRAE');
    await expect.element(tester.grcs.nth(1)).toMatchTextContent('GRC2');
    await expect.element(tester.grcs.nth(1)).toMatchTextContent('INRAE');
    await expect.element(tester.createLink).toBeInTheDocument();
  });

  test('should delete after confirmation and reload', async () => {
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

    confirmationService.confirm.mockReturnValue(of(undefined));
    grcService.delete.mockReturnValue(of(undefined));

    await tester.deleteButtons.nth(0).click();

    await expect.element(tester.grcs).toHaveLength(1);
    expect(grcService.delete).toHaveBeenCalledWith(432);
    expect(toastService.success).toHaveBeenCalled();
  });
});
