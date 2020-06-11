import { TestBed } from '@angular/core/testing';

import { GrcsComponent } from './grcs.component';
import { ComponentTester, speculoosMatchers, TestButton } from 'ngx-speculoos';
import { ConfirmationService } from '../../shared/confirmation.service';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RbNgbModule } from '../../rb-ngb/rb-ngb.module';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY, of } from 'rxjs';
import { Grc } from '../../shared/user.model';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';

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
  let grcService: jasmine.SpyObj<GrcService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    grcService = jasmine.createSpyObj<GrcService>('GrcService', ['list', 'delete']);
    confirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['success']);

    TestBed.configureTestingModule({
      imports: [I18nTestingModule, FontAwesomeModule, RbNgbModule, RouterTestingModule],
      declarations: [GrcsComponent],
      providers: [
        { provide: GrcService, useValue: grcService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: ToastService, useValue: toastService }
      ]
    });

    jasmine.addMatchers(speculoosMatchers);
    tester = new GrcsComponentTester();
  });

  it('should not display anything until grcs are available', () => {
    grcService.list.and.returnValue(EMPTY);
    tester.detectChanges();

    expect(tester.grcs.length).toBe(0);
    expect(tester.createLink).toBeNull();
  });

  it('should display grcs', () => {
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

    grcService.list.and.returnValue(of(grcs));
    tester.detectChanges();

    expect(tester.grcs.length).toBe(2);
    expect(tester.grcs[0]).toContainText('GRC1');
    expect(tester.grcs[0]).toContainText('INRAE');
    expect(tester.grcs[1]).toContainText('GRC2');
    expect(tester.grcs[1]).toContainText('INRAE');
    expect(tester.createLink).not.toBeNull();
  });

  it('should delete after confirmation and reload', () => {
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

    grcService.list.and.returnValues(of(grcs), of([grcs[1]]));
    tester.detectChanges();

    confirmationService.confirm.and.returnValue(of(undefined));
    grcService.delete.and.returnValue(of(undefined));

    tester.deleteButtons[0].click();

    expect(tester.grcs.length).toBe(1);
    expect(grcService.delete).toHaveBeenCalledWith(432);
    expect(toastService.success).toHaveBeenCalled();
  });
});
