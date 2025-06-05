import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ActivatedRouteStub, ComponentTester, createMock, stubRoute } from 'ngx-speculoos';

import { EditGrcComponent } from './edit-grc.component';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { Grc, GrcCommand } from '../../shared/user.model';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

class EditGrcComponentTester extends ComponentTester<EditGrcComponent> {
  constructor() {
    super(EditGrcComponent);
  }

  get title() {
    return this.element('h1');
  }

  get name() {
    return this.input('#name')!;
  }

  get institution() {
    return this.input('#institution')!;
  }

  get address() {
    return this.textarea('#address')!;
  }

  get errors() {
    return this.elements('.invalid-feedback div');
  }

  get saveButton() {
    return this.button('#save-button')!;
  }
}

describe('EditGrcComponent', () => {
  let tester: EditGrcComponentTester;
  let grcService: jasmine.SpyObj<GrcService>;
  let router: Router;
  let toastService: jasmine.SpyObj<ToastService>;
  let route: ActivatedRouteStub;

  beforeEach(async () => {
    route = stubRoute();
    grcService = createMock(GrcService);
    toastService = createMock(ToastService);

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        { provide: GrcService, useValue: grcService },
        { provide: ActivatedRoute, useValue: route },
        { provide: ToastService, useValue: toastService }
      ]
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    await TestBed.createComponent(ValidationDefaultsComponent).whenStable();
  });

  describe('in create mode', () => {
    beforeEach(async () => {
      tester = new EditGrcComponentTester();
      await tester.stable();
    });

    it('should have a title', () => {
      expect(tester.title).toContainText(`Créer un CRB`);
    });

    it('should display an empty form', () => {
      expect(tester.name).toHaveValue('');
      expect(tester.institution).toHaveValue('');
      expect(tester.address).toHaveValue('');
    });

    it('should not save if error', async () => {
      expect(tester.errors.length).toBe(0);

      await tester.saveButton.click();

      expect(tester.errors.length).toBe(3);
      expect(tester.errors[0]).toContainText('Le nom est obligatoire');
      expect(tester.errors[1]).toContainText("L'institution est obligatoire");
      expect(tester.errors[2]).toContainText("L'adresse est obligatoire");

      expect(grcService.create).not.toHaveBeenCalled();
    });

    it('should create a GRC', async () => {
      await tester.name.fillWith('GRC1');
      await tester.institution.fillWith('INRAE');
      await tester.address.fillWith('12 Boulevard Marie Curie, 69007 LYON');

      grcService.create.and.returnValue(of({} as Grc));
      await tester.saveButton.click();

      const expectedCommand: GrcCommand = {
        name: 'GRC1',
        institution: 'INRAE',
        address: '12 Boulevard Marie Curie, 69007 LYON'
      };
      expect(grcService.create).toHaveBeenCalledWith(expectedCommand);
      expect(router.navigate).toHaveBeenCalledWith(['/grcs']);
      expect(toastService.success).toHaveBeenCalled();
    });
  });

  describe('in update mode', () => {
    beforeEach(async () => {
      route.setParam('grcId', '41');

      grcService.get.and.returnValue(
        of({
          id: 41,
          name: 'GRC1',
          institution: 'INRAE',
          address: '12 Boulevard Marie Curie, 69007 LYON'
        } as Grc)
      );

      tester = new EditGrcComponentTester();
      await tester.stable();
    });

    it('should have a title', () => {
      expect(tester.title).toContainText(`Modifier un CRB`);
    });

    it('should display a filled form', () => {
      expect(tester.name).toHaveValue('GRC1');
      expect(tester.institution).toHaveValue('INRAE');
      expect(tester.address).toHaveValue('12 Boulevard Marie Curie, 69007 LYON');
    });

    it('should update the GRC', async () => {
      await tester.name.fillWith('GRC2');
      await tester.address.fillWith('13 Boulevard Marie Curie, 69007 LYON');

      grcService.update.and.returnValue(of(undefined));
      await tester.saveButton.click();

      const expectedCommand: GrcCommand = {
        name: 'GRC2',
        institution: 'INRAE',
        address: '13 Boulevard Marie Curie, 69007 LYON'
      };
      expect(grcService.update).toHaveBeenCalledWith(41, expectedCommand);
      expect(router.navigate).toHaveBeenCalledWith(['/grcs']);
      expect(toastService.success).toHaveBeenCalled();
    });
  });
});
