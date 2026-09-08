import { beforeEach, describe, expect, test } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { createMock, MockObject } from '../../../test/mock';
import { EMPTY, of } from 'rxjs';
import { AccessionHolder } from '../../shared/user.model';
import { ConfirmationService } from '../../shared/confirmation.service';
import { AccessionHoldersComponent } from './accession-holders.component';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { ToastService } from '../../shared/toast.service';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { provideRouter } from '@angular/router';
import { page } from 'vitest/browser';

class AccessionHoldersComponentTester {
  readonly fixture = TestBed.createComponent(AccessionHoldersComponent);
  readonly accessionHolders = page.getByCss('.accession-holder');
  readonly createLink = page.getByCss('#create-accession-holder');
  readonly deleteButtons = page.getByCss('.delete-accession-holder-button');
}

describe('AccessionHoldersComponent', () => {
  let tester: AccessionHoldersComponentTester;
  let accessionHolderService: MockObject<AccessionHolderService>;
  let confirmationService: MockObject<ConfirmationService>;
  let toastService: MockObject<ToastService>;

  beforeEach(() => {
    accessionHolderService = createMock(AccessionHolderService);
    confirmationService = createMock(ConfirmationService);
    toastService = createMock(ToastService);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideI18nTesting(),
        { provide: AccessionHolderService, useValue: accessionHolderService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: ToastService, useValue: toastService }
      ]
    });
  });

  test('should not display anything until accession holders are available', async () => {
    accessionHolderService.list.mockReturnValue(EMPTY);
    tester = new AccessionHoldersComponentTester();

    await expect.element(tester.accessionHolders).toHaveLength(0);
    await expect.element(tester.createLink).not.toBeInTheDocument();
  });

  test('should display accession holders', async () => {
    const accessionHolders: Array<AccessionHolder> = [
      {
        id: 1,
        name: 'Holder1',
        email: 'holder1@mail.com',
        phone: '',
        grc: {
          id: 432,
          name: 'GRC1',
          institution: '',
          address: ''
        }
      },
      {
        id: 2,
        name: 'Holder2',
        email: 'holder2@mail.com',
        phone: '',
        grc: {
          id: 433,
          name: 'GRC2',
          institution: '',
          address: ''
        }
      }
    ];

    accessionHolderService.list.mockReturnValue(of(accessionHolders));
    tester = new AccessionHoldersComponentTester();

    await expect.element(tester.accessionHolders).toHaveLength(2);
    await expect.element(tester.accessionHolders.nth(0)).toMatchTextContent('Holder1');
    await expect.element(tester.accessionHolders.nth(0)).toMatchTextContent('holder1@mail.com');
    await expect.element(tester.accessionHolders.nth(0)).toMatchTextContent('GRC1');
    await expect.element(tester.accessionHolders.nth(1)).toMatchTextContent('Holder2');
    await expect.element(tester.accessionHolders.nth(1)).toMatchTextContent('holder2@mail.com');
    await expect.element(tester.accessionHolders.nth(1)).toMatchTextContent('GRC2');
    await expect.element(tester.createLink).toBeInTheDocument();
  });

  test('should delete after confirmation and reload', async () => {
    const accessionHolders: Array<AccessionHolder> = [
      {
        id: 1,
        name: 'Holder1',
        email: 'holder1@mail.com',
        phone: '',
        grc: {
          id: 432,
          name: 'GRC1',
          institution: '',
          address: ''
        }
      },
      {
        id: 2,
        name: 'Holder2',
        email: 'holder2@mail.com',
        phone: '',
        grc: {
          id: 433,
          name: 'GRC2',
          institution: '',
          address: ''
        }
      }
    ];

    accessionHolderService.list.mockReturnValueOnce(of(accessionHolders)).mockReturnValueOnce(of([accessionHolders[1]]));
    tester = new AccessionHoldersComponentTester();

    confirmationService.confirm.mockReturnValue(of(undefined));
    accessionHolderService.delete.mockReturnValue(of(undefined));

    await tester.deleteButtons.nth(0).click();

    await expect.element(tester.accessionHolders).toHaveLength(1);
    expect(accessionHolderService.delete).toHaveBeenCalledWith(1);
    expect(toastService.success).toHaveBeenCalled();
  });
});
