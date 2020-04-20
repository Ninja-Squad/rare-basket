import { TestBed } from '@angular/core/testing';

import { EditUserComponent } from './edit-user.component';
import { ComponentTester, fakeRoute, fakeSnapshot, speculoosMatchers } from 'ngx-speculoos';
import { AccessionHolder, ALL_PERMISSIONS, Permission, User, UserCommand } from '../../shared/user.model';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { ReactiveFormsModule } from '@angular/forms';
import { ValdemortModule } from 'ngx-valdemort';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionEnumPipe } from '../permission-enum.pipe';
import { UserService } from '../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { of } from 'rxjs';

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

  get permissions() {
    return this.elements('.form-check-input');
  }

  permission(permission: Permission) {
    return this.input(`#permission-${permission}`);
  }

  get accessionHolder() {
    return this.select('#accession-holder');
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
  let router: Router;

  function prepare(route: ActivatedRoute) {
    userService = jasmine.createSpyObj<UserService>('UserService', ['get', 'create', 'update', 'listAccessionHolders']);

    TestBed.configureTestingModule({
      imports: [I18nTestingModule, ReactiveFormsModule, ValdemortModule, RouterTestingModule],
      declarations: [EditUserComponent, PermissionEnumPipe, ValidationDefaultsComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: ActivatedRoute, useValue: route }
      ]
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    jasmine.addMatchers(speculoosMatchers);

    userService.listAccessionHolders.and.returnValue(
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

    tester = new EditUserComponentTester();
  }

  describe('in create mode', () => {
    beforeEach(() => {
      const route = fakeRoute({
        snapshot: fakeSnapshot({
          params: {}
        })
      });
      prepare(route);
      tester.detectChanges();
    });

    it('should have a title', () => {
      expect(tester.title).toContainText('Créer un utilisateur');
    });

    it('should display an empty form', () => {
      expect(tester.name).toHaveValue('');
      expect(tester.permissions.length).toBe(ALL_PERMISSIONS.length);
      ALL_PERMISSIONS.forEach(p => expect(tester.permission(p)).not.toBeChecked());
      expect(tester.accessionHolder).toHaveSelectedLabel('');

      expect(tester.grcOptionGroups.length).toBe(2);
      expect(tester.grcOptionGroups[0].attr('label')).toBe('GRC1');
      expect(tester.grcOptionGroups[1].attr('label')).toBe('GRC2');

      expect(tester.accessionHolderOptions('GRC1').length).toBe(2);
      expect(tester.accessionHolderOptions('GRC2').length).toBe(1);

      expect(tester.accessionHolder.optionLabels).toEqual(['', 'Contact11', 'Contact12', 'Contact21']);
    });

    it('should not save if error', () => {
      expect(tester.errors.length).toBe(0);

      tester.saveButton.click();

      expect(tester.errors.length).toBe(1);
      expect(tester.errors[0]).toContainText('Le nom est obligatoire');

      tester.permission('ORDER_MANAGEMENT').check();

      expect(tester.errors.length).toBe(2);
      expect(tester.errors[1]).toContainText(`Le gestionnaire d'accessions est obligatoire`);

      tester.permission('ORDER_MANAGEMENT').uncheck();

      expect(tester.errors.length).toBe(1);

      expect(userService.create).not.toHaveBeenCalled();
    });

    it('should create user', () => {
      tester.name.fillWith('Test');
      tester.permission('ORDER_MANAGEMENT').check();
      tester.accessionHolder.selectLabel('Contact12');

      expect(tester.accessionHolder).toHaveSelectedLabel('GRC1 - Contact12');

      userService.create.and.returnValue(of({} as User));
      tester.saveButton.click();

      const expectedCommand: UserCommand = {
        name: 'Test',
        permissions: ['ORDER_MANAGEMENT'],
        accessionHolderId: 12
      };
      expect(userService.create).toHaveBeenCalledWith(expectedCommand);
      expect(router.navigate).toHaveBeenCalledWith(['/users']);
    });
  });

  describe('in update mode', () => {
    beforeEach(() => {
      const route = fakeRoute({
        snapshot: fakeSnapshot({
          params: { userId: '42' }
        })
      });
      prepare(route);

      userService.get.and.returnValue(
        of({
          id: 42,
          name: 'Test',
          permissions: ['ORDER_MANAGEMENT'],
          accessionHolder: {
            id: 12
          }
        } as User)
      );

      tester.detectChanges();
    });

    it('should have a title', () => {
      expect(tester.title).toContainText('Modifier un utilisateur');
    });

    it('should display a filled form', () => {
      expect(tester.name).toHaveValue('Test');
      expect(tester.permissions.length).toBe(ALL_PERMISSIONS.length);
      expect(tester.permission('ORDER_MANAGEMENT')).toBeChecked();
      expect(tester.permission('USER_MANAGEMENT')).not.toBeChecked();
      expect(tester.accessionHolder).toHaveSelectedLabel('GRC1 - Contact12');

      expect(tester.accessionHolder.optionLabels).toEqual(['', 'Contact11', 'GRC1 - Contact12', 'Contact21']);
    });

    it('should update user', () => {
      tester.name.fillWith('Test2');
      tester.permission('ORDER_MANAGEMENT').uncheck();
      tester.permission('USER_MANAGEMENT').check();
      tester.accessionHolder.selectLabel('');

      userService.update.and.returnValue(of(undefined));
      tester.saveButton.click();

      const expectedCommand: UserCommand = {
        name: 'Test2',
        permissions: ['USER_MANAGEMENT'],
        accessionHolderId: null
      };
      expect(userService.update).toHaveBeenCalledWith(42, expectedCommand);
      expect(router.navigate).toHaveBeenCalledWith(['/users']);
    });
  });
});
