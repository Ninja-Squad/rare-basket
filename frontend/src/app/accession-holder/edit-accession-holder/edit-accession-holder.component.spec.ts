import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ComponentTester, createMock, stubRoute } from 'ngx-speculoos';

import { EditAccessionHolderComponent } from './edit-accession-holder.component';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { AccessionHolder, AccessionHolderCommand, Grc } from '../../shared/user.model';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

class EditAccessionHolderComponentTester extends ComponentTester<EditAccessionHolderComponent> {
  constructor() {
    super(EditAccessionHolderComponent);
  }

  get title() {
    return this.element('h1');
  }

  get name() {
    return this.input('#name');
  }

  get email() {
    return this.input('#email');
  }

  get phone() {
    return this.input('#phone');
  }

  get grc() {
    return this.select('#grc');
  }

  get errors() {
    return this.elements('.invalid-feedback div');
  }

  get saveButton() {
    return this.button('#save-button');
  }
}

describe('EditAccessionHolderComponent', () => {
  let tester: EditAccessionHolderComponentTester;
  let accessionHolderService: jasmine.SpyObj<AccessionHolderService>;
  let grcService: jasmine.SpyObj<GrcService>;
  let router: Router;
  let toastService: jasmine.SpyObj<ToastService>;

  function prepare(route: ActivatedRoute) {
    accessionHolderService = createMock(AccessionHolderService);
    grcService = createMock(GrcService);
    toastService = createMock(ToastService);

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        { provide: AccessionHolderService, useValue: accessionHolderService },
        { provide: GrcService, useValue: grcService },
        { provide: ActivatedRoute, useValue: route },
        { provide: ToastService, useValue: toastService }
      ]
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

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
  }

  describe('in create mode', () => {
    beforeEach(() => {
      const route = stubRoute();
      prepare(route);
      tester = new EditAccessionHolderComponentTester();
      tester.detectChanges();
    });

    it('should have a title', () => {
      expect(tester.title).toContainText(`Créer un gestionnaire d'accessions`);
    });

    it('should display an empty form', () => {
      expect(tester.name).toHaveValue('');
      expect(tester.email).toHaveValue('');
      expect(tester.phone).toHaveValue('');
      expect(tester.grc).toHaveSelectedLabel('');
      expect(tester.grc.optionLabels).toEqual(['', 'GRC1', 'GRC2']);
    });

    it('should not save if error', () => {
      expect(tester.errors.length).toBe(0);

      tester.saveButton.click();

      expect(tester.errors.length).toBe(4);
      expect(tester.errors[0]).toContainText('Le nom est obligatoire');
      expect(tester.errors[1]).toContainText('Le courriel est obligatoire');
      expect(tester.errors[2]).toContainText('Le téléphone est obligatoire');
      expect(tester.errors[3]).toContainText('Le CRB est obligatoire');

      tester.email.fillWith('bad-email');
      expect(tester.errors[1]).toContainText('Le courriel doit être une adresse email valide');

      expect(accessionHolderService.create).not.toHaveBeenCalled();
    });

    it('should create an accession holder', () => {
      tester.name.fillWith('Cyril');
      tester.email.fillWith('cyril@grc1.com');
      tester.phone.fillWith('0601020304');
      tester.grc.selectLabel('GRC1');

      accessionHolderService.create.and.returnValue(of({} as AccessionHolder));
      tester.saveButton.click();

      const expectedCommand: AccessionHolderCommand = {
        name: 'Cyril',
        email: 'cyril@grc1.com',
        phone: '0601020304',
        grcId: 1
      };
      expect(accessionHolderService.create).toHaveBeenCalledWith(expectedCommand);
      expect(router.navigate).toHaveBeenCalledWith(['/accession-holders']);
      expect(toastService.success).toHaveBeenCalled();
    });
  });

  describe('in update mode', () => {
    beforeEach(() => {
      const route = stubRoute({
        params: { accessionHolderId: '41' }
      });
      prepare(route);
      accessionHolderService.get.and.returnValue(
        of({
          id: 41,
          name: 'Cyril',
          email: 'cyril@grc2.fr',
          phone: '0600000000',
          grc: {
            id: 2
          }
        } as AccessionHolder)
      );
      tester = new EditAccessionHolderComponentTester();
      tester.detectChanges();
    });

    it('should have a title', () => {
      expect(tester.title).toContainText(`Modifier un gestionnaire d'accessions`);
    });

    it('should display a filled form', () => {
      expect(tester.name).toHaveValue('Cyril');
      expect(tester.email).toHaveValue('cyril@grc2.fr');
      expect(tester.phone).toHaveValue('0600000000');
      expect(tester.grc).toHaveSelectedLabel('GRC2');
      expect(tester.grc.optionLabels).toEqual(['', 'GRC1', 'GRC2']);
    });

    it('should update the accession holder', () => {
      tester.name.fillWith('Cédric');
      tester.email.fillWith('cedric@grc1.fr');
      tester.grc.selectLabel('GRC1');

      accessionHolderService.update.and.returnValue(of(undefined));
      tester.saveButton.click();

      const expectedCommand: AccessionHolderCommand = {
        name: 'Cédric',
        email: 'cedric@grc1.fr',
        phone: '0600000000',
        grcId: 1
      };
      expect(accessionHolderService.update).toHaveBeenCalledWith(41, expectedCommand);
      expect(router.navigate).toHaveBeenCalledWith(['/accession-holders']);
      expect(toastService.success).toHaveBeenCalled();
    });
  });
});
