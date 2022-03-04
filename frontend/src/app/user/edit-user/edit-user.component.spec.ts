import { TestBed } from '@angular/core/testing';

import { EditUserComponent } from './edit-user.component';
import { ComponentTester, createMock, speculoosMatchers, stubRoute, TestInput } from 'ngx-speculoos';
import { AccessionHolder, Grc, User, UserCommand } from '../../shared/user.model';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { ReactiveFormsModule } from '@angular/forms';
import { ValdemortModule } from 'ngx-valdemort';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionEnumPipe } from '../permission-enum.pipe';
import { UserService } from '../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { of } from 'rxjs';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';

class EditUserComponentTester extends ComponentTester<EditUserComponent> {
  constructor() {
    super(EditUserComponent);
  }

  get title() {
    return this.element('h1');
  }

  get name() {
    return this.input('#name');
  }

  get orderManagement() {
    return this.input('#order-management');
  }

  get orderVisualization() {
    return this.input('#order-visualization');
  }

  get administration() {
    return this.input('#administration');
  }

  get accessionHolder() {
    return this.select('#accession-holder');
  }

  get noGlobalVisualization() {
    return this.input('#no-global-visualization');
  }

  get globalVisualization() {
    return this.input('#global-visualization');
  }

  get visualizationGrcs() {
    return this.elements('.grcs input') as Array<TestInput>;
  }

  get errors() {
    return this.elements('.invalid-feedback div');
  }

  get grcOptionGroups() {
    return this.accessionHolder.elements('optgroup');
  }

  accessionHolderOptions(grcName: string) {
    return this.accessionHolder
      .elements('optgroup')
      .find(group => group.attr('label') === grcName)
      .elements('option');
  }

  get saveButton() {
    return this.button('#save-button');
  }
}

describe('EditUserComponent', () => {
  let tester: EditUserComponentTester;
  let userService: jasmine.SpyObj<UserService>;
  let accessionHolderService: jasmine.SpyObj<AccessionHolderService>;
  let grcService: jasmine.SpyObj<GrcService>;
  let router: Router;
  let toastService: jasmine.SpyObj<ToastService>;

  function prepare(route: ActivatedRoute) {
    userService = createMock(UserService);
    accessionHolderService = createMock(AccessionHolderService);
    grcService = createMock(GrcService);
    toastService = createMock(ToastService);

    TestBed.configureTestingModule({
      imports: [I18nTestingModule, ReactiveFormsModule, ValdemortModule, RouterTestingModule],
      declarations: [EditUserComponent, PermissionEnumPipe, ValidationDefaultsComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: AccessionHolderService, useValue: accessionHolderService },
        { provide: GrcService, useValue: grcService },
        { provide: ToastService, useValue: toastService },
        { provide: ActivatedRoute, useValue: route }
      ]
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    jasmine.addMatchers(speculoosMatchers);

    accessionHolderService.list.and.returnValue(
      of([
        {
          id: 11,
          name: 'Contact11',
          grc: {
            id: 1,
            name: 'GRC1'
          }
        },
        {
          id: 12,
          name: 'Contact12',
          grc: {
            id: 1,
            name: 'GRC1'
          }
        },
        {
          id: 21,
          name: 'Contact21',
          grc: {
            id: 2,
            name: 'GRC2'
          }
        }
      ] as Array<AccessionHolder>)
    );

    grcService.list.and.returnValue(
      of([
        {
          id: 1,
          name: 'GRC1'
        },
        {
          id: 2,
          name: 'GRC2'
        }
      ] as Array<Grc>)
    );

    tester = new EditUserComponentTester();
  }

  describe('in create mode', () => {
    beforeEach(() => {
      const route = stubRoute();
      prepare(route);
      tester.detectChanges();
    });

    it('should have a title', () => {
      expect(tester.title).toContainText('Créer un utilisateur');
    });

    it('should display an empty form', () => {
      expect(tester.name).toHaveValue('');
      expect(tester.orderManagement).not.toBeChecked();
      expect(tester.orderVisualization).not.toBeChecked();
      expect(tester.administration).not.toBeChecked();

      expect(tester.accessionHolder).toBeNull();
      expect(tester.noGlobalVisualization).toBeNull();
      expect(tester.globalVisualization).toBeNull();
      expect(tester.visualizationGrcs.length).toBe(0);

      tester.orderManagement.check();

      expect(tester.accessionHolder).not.toBeNull();

      expect(tester.grcOptionGroups.length).toBe(2);
      expect(tester.grcOptionGroups[0].attr('label')).toBe('GRC1');
      expect(tester.grcOptionGroups[1].attr('label')).toBe('GRC2');
      expect(tester.accessionHolderOptions('GRC1').length).toBe(2);
      expect(tester.accessionHolderOptions('GRC2').length).toBe(1);
      expect(tester.accessionHolder.optionLabels).toEqual(['', 'Contact11', 'Contact12', 'Contact21']);

      tester.orderVisualization.check();

      expect(tester.noGlobalVisualization).not.toBeNull();
      expect(tester.globalVisualization).not.toBeNull();
      expect(tester.noGlobalVisualization).toBeChecked();
      expect(tester.globalVisualization).not.toBeChecked();
      expect(tester.visualizationGrcs.length).toBe(2);

      tester.globalVisualization.check();
      expect(tester.visualizationGrcs.length).toBe(0);
    });

    it('should not save if error', () => {
      expect(tester.errors.length).toBe(0);

      tester.saveButton.click();

      expect(tester.errors.length).toBe(1);
      expect(tester.errors[0]).toContainText('Le nom est obligatoire');
      tester.name.fillWith('Test');
      expect(tester.componentInstance.form.valid).toBe(true);

      tester.orderManagement.check();
      expect(tester.componentInstance.form.valid).toBe(false);

      expect(tester.errors.length).toBe(1);
      expect(tester.errors[0]).toContainText(`Le gestionnaire d'accessions est obligatoire`);

      tester.orderManagement.uncheck();
      expect(tester.componentInstance.form.valid).toBe(true);
      expect(tester.errors.length).toBe(0);

      tester.orderVisualization.check();
      expect(tester.componentInstance.form.valid).toBe(false);
      expect(tester.errors.length).toBe(1);
      expect(tester.errors[0]).toContainText(`Au moins un CRB doit être sélectionné`);

      tester.globalVisualization.check();
      expect(tester.componentInstance.form.valid).toBe(true);
      expect(tester.errors.length).toBe(0);

      tester.noGlobalVisualization.check();
      expect(tester.componentInstance.form.valid).toBe(false);

      tester.orderVisualization.uncheck();
      expect(tester.componentInstance.form.valid).toBe(true);

      expect(userService.create).not.toHaveBeenCalled();
    });

    it('should create user', () => {
      tester.name.fillWith('Test');
      tester.orderManagement.check();
      tester.accessionHolder.selectLabel('Contact12');
      expect(tester.accessionHolder).toHaveSelectedLabel('GRC1 - Contact12');

      tester.orderVisualization.check();
      tester.visualizationGrcs[1].check();

      userService.create.and.returnValue(of({} as User));
      tester.saveButton.click();

      const expectedCommand: UserCommand = {
        name: 'Test',
        permissions: ['ORDER_MANAGEMENT', 'ORDER_VISUALIZATION'],
        accessionHolderId: 12,
        globalVisualization: false,
        visualizationGrcIds: [2]
      };
      expect(userService.create).toHaveBeenCalledWith(expectedCommand);
      expect(router.navigate).toHaveBeenCalledWith(['/users']);
      expect(toastService.success).toHaveBeenCalled();
    });
  });

  describe('in update mode', () => {
    beforeEach(() => {
      const route = stubRoute({
        params: { userId: '42' }
      });
      prepare(route);

      userService.get.and.returnValue(
        of({
          id: 42,
          name: 'Test',
          permissions: ['ORDER_MANAGEMENT', 'ORDER_VISUALIZATION'],
          accessionHolder: {
            id: 12
          },
          globalVisualization: false,
          visualizationGrcs: [
            {
              id: 2
            }
          ]
        } as User)
      );

      tester.detectChanges();
    });

    it('should have a title', () => {
      expect(tester.title).toContainText(`Modifier l'utilisateur Test`);
    });

    it('should display a filled form', () => {
      expect(tester.name).toHaveValue('Test');
      expect(tester.orderManagement).toBeChecked();
      expect(tester.accessionHolder).toHaveSelectedLabel('GRC1 - Contact12');
      expect(tester.orderVisualization).toBeChecked();
      expect(tester.noGlobalVisualization).toBeChecked();
      expect(tester.globalVisualization).not.toBeChecked();
      expect(tester.visualizationGrcs[0]).not.toBeChecked();
      expect(tester.visualizationGrcs[1]).toBeChecked();
      expect(tester.administration).not.toBeChecked();
    });

    it('should update user', () => {
      tester.name.fillWith('Test2');
      tester.orderManagement.uncheck();
      tester.orderVisualization.uncheck();
      tester.administration.check();

      userService.update.and.returnValue(of(undefined));
      tester.saveButton.click();

      const expectedCommand: UserCommand = {
        name: 'Test2',
        permissions: ['ADMINISTRATION'],
        accessionHolderId: null,
        globalVisualization: false,
        visualizationGrcIds: []
      };
      expect(userService.update).toHaveBeenCalledWith(42, expectedCommand);
      expect(router.navigate).toHaveBeenCalledWith(['/users']);
      expect(toastService.success).toHaveBeenCalled();
    });
  });
});
