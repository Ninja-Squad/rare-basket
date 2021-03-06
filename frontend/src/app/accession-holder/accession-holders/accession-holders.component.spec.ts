import { TestBed } from '@angular/core/testing';

import { ComponentTester, createMock, TestButton } from 'ngx-speculoos';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY, of } from 'rxjs';
import { AccessionHolder } from '../../shared/user.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmationService } from '../../shared/confirmation.service';
import { AccessionHoldersComponent } from './accession-holders.component';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { ToastService } from '../../shared/toast.service';
import { RbNgbTestingModule } from '../../rb-ngb/rb-ngb-testing.module';

class AccessionHoldersComponentTester extends ComponentTester<AccessionHoldersComponent> {
  constructor() {
    super(AccessionHoldersComponent);
  }

  get accessionHolders() {
    return this.elements('.accession-holder');
  }

  get createLink() {
    return this.element('#create-accession-holder');
  }

  get deleteButtons() {
    return this.elements('.delete-accession-holder-button') as Array<TestButton>;
  }
}

describe('AccessionHoldersComponent', () => {
  let tester: AccessionHoldersComponentTester;
  let accessionHolderService: jasmine.SpyObj<AccessionHolderService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    accessionHolderService = createMock(AccessionHolderService);
    confirmationService = createMock(ConfirmationService);
    toastService = createMock(ToastService);

    TestBed.configureTestingModule({
      imports: [I18nTestingModule, FontAwesomeModule, RbNgbTestingModule, RouterTestingModule],
      declarations: [AccessionHoldersComponent],
      providers: [
        { provide: AccessionHolderService, useValue: accessionHolderService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: ToastService, useValue: toastService }
      ]
    });

    tester = new AccessionHoldersComponentTester();
  });

  it('should not display anything until accession holders are available', () => {
    accessionHolderService.list.and.returnValue(EMPTY);
    tester.detectChanges();

    expect(tester.accessionHolders.length).toBe(0);
    expect(tester.createLink).toBeNull();
  });

  it('should display accession holders', () => {
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

    accessionHolderService.list.and.returnValue(of(accessionHolders));
    tester.detectChanges();

    expect(tester.accessionHolders.length).toBe(2);
    expect(tester.accessionHolders[0]).toContainText('Holder1');
    expect(tester.accessionHolders[0]).toContainText('holder1@mail.com');
    expect(tester.accessionHolders[0]).toContainText('GRC1');
    expect(tester.accessionHolders[1]).toContainText('Holder2');
    expect(tester.accessionHolders[1]).toContainText('holder2@mail.com');
    expect(tester.accessionHolders[1]).toContainText('GRC2');
    expect(tester.createLink).not.toBeNull();
  });

  it('should delete after confirmation and reload', () => {
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

    accessionHolderService.list.and.returnValues(of(accessionHolders), of([accessionHolders[1]]));
    tester.detectChanges();

    confirmationService.confirm.and.returnValue(of(undefined));
    accessionHolderService.delete.and.returnValue(of(undefined));

    tester.deleteButtons[0].click();

    expect(tester.accessionHolders.length).toBe(1);
    expect(accessionHolderService.delete).toHaveBeenCalledWith(1);
    expect(toastService.success).toHaveBeenCalled();
  });
});
