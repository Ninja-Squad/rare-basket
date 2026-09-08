import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { createMock, MockObject } from '../../../test/mock';
import { ActivatedRouteStub, stubRoute } from '../../../test/route-stub';

import { EditGrcComponent } from './edit-grc.component';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { Grc, GrcCommand } from '../../shared/user.model';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

class EditGrcComponentTester {
  readonly fixture = TestBed.createComponent(EditGrcComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly title = this.root.getByCss('h1');
  readonly name = this.root.getByCss('#name');
  readonly institution = this.root.getByCss('#institution');
  readonly address = this.root.getByCss('#address');
  readonly errors = this.root.getByCss('.invalid-feedback div');
  readonly saveButton = this.root.getByCss('#save-button');
}

describe('EditGrcComponent', () => {
  let tester: EditGrcComponentTester;
  let grcService: MockObject<GrcService>;
  let router: Router;
  let toastService: MockObject<ToastService>;
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
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await TestBed.createComponent(ValidationDefaultsComponent).whenStable();
  });

  describe('in create mode', () => {
    beforeEach(async () => {
      tester = new EditGrcComponentTester();
      await tester.fixture.whenStable();
    });

    test('should have a title', () => {
      expect(tester.title.element().textContent).toContain(`Créer un CRB`);
    });

    test('should display an empty form', async () => {
      await expect.element(tester.name).toHaveValue('');
      await expect.element(tester.institution).toHaveValue('');
      await expect.element(tester.address).toHaveValue('');
    });

    test('should not save if error', async () => {
      await expect.element(tester.errors).toHaveLength(0);

      await tester.saveButton.click();

      await expect.element(tester.errors).toHaveLength(3);
      await expect.element(tester.errors.nth(0)).toMatchTextContent('Le nom est obligatoire');
      await expect.element(tester.errors.nth(1)).toMatchTextContent("L'institution est obligatoire");
      await expect.element(tester.errors.nth(2)).toMatchTextContent("L'adresse est obligatoire");

      expect(grcService.create).not.toHaveBeenCalled();
    });

    test('should create a GRC', async () => {
      await tester.name.fill('GRC1');
      await tester.institution.fill('INRAE');
      await tester.address.fill('12 Boulevard Marie Curie, 69007 LYON');

      grcService.create.mockReturnValue(of({} as Grc));
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

      grcService.get.mockReturnValue(
        of({
          id: 41,
          name: 'GRC1',
          institution: 'INRAE',
          address: '12 Boulevard Marie Curie, 69007 LYON'
        } as Grc)
      );

      tester = new EditGrcComponentTester();
      await tester.fixture.whenStable();
    });

    test('should have a title', () => {
      expect(tester.title.element().textContent).toContain(`Modifier un CRB`);
    });

    test('should display a filled form', async () => {
      await expect.element(tester.name).toHaveValue('GRC1');
      await expect.element(tester.institution).toHaveValue('INRAE');
      await expect.element(tester.address).toHaveValue('12 Boulevard Marie Curie, 69007 LYON');
    });

    test('should update the GRC', async () => {
      await tester.name.fill('GRC2');
      await tester.address.fill('13 Boulevard Marie Curie, 69007 LYON');

      grcService.update.mockReturnValue(of(undefined));
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
