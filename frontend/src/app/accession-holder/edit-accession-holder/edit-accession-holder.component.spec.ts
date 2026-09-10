import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { createMock, MockObject } from '../../../test/mock';
import { ActivatedRouteStub, stubRoute } from '../../../test/route-stub';

import { EditAccessionHolderComponent } from './edit-accession-holder.component';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { AccessionHolder, AccessionHolderCommand, Grc } from '../../shared/user.model';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

class EditAccessionHolderComponentTester {
  readonly fixture = TestBed.createComponent(EditAccessionHolderComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly title = this.root.getByCss('h1');
  readonly name = this.root.getByCss('#name');
  readonly email = this.root.getByCss('#email');
  readonly phone = this.root.getByCss('#phone');
  readonly grc = this.root.getByCss('#grc');
  readonly errors = this.root.getByCss('.invalid-feedback div');
  readonly saveButton = this.root.getByCss('#save-button');

  optionLabels() {
    const select = this.grc.element() as HTMLSelectElement;
    return Array.from(select.options).map(option => option.textContent ?? '');
  }
}

describe('EditAccessionHolderComponent', () => {
  let tester: EditAccessionHolderComponentTester;
  let accessionHolderService: MockObject<AccessionHolderService>;
  let grcService: MockObject<GrcService>;
  let router: Router;
  let toastService: MockObject<ToastService>;
  let route: ActivatedRouteStub;

  beforeEach(() => {
    accessionHolderService = createMock(AccessionHolderService);
    grcService = createMock(GrcService);
    toastService = createMock(ToastService);
    route = stubRoute();

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
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    grcService.list.mockReturnValue(
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
  });

  describe('in create mode', () => {
    beforeEach(() => {
      tester = new EditAccessionHolderComponentTester();
    });

    test('should have a title', async () => {
      await expect.element(tester.title).toMatchTextContent(`Créer un gestionnaire d'accessions`);
    });

    test('should display an empty form', async () => {
      await expect.element(tester.name).toHaveValue('');
      await expect.element(tester.email).toHaveValue('');
      await expect.element(tester.phone).toHaveValue('');
      await expect.element(tester.grc).toHaveDisplayValue('');
      expect(tester.optionLabels()).toEqual(['', 'GRC1', 'GRC2']);
    });

    test('should not save if error', async () => {
      await expect.element(tester.errors).toHaveLength(0);

      await tester.saveButton.click();

      await expect.element(tester.errors).toHaveLength(4);
      await expect.element(tester.errors.nth(0)).toMatchTextContent('Le nom est obligatoire');
      await expect.element(tester.errors.nth(1)).toMatchTextContent('Le courriel est obligatoire');
      await expect.element(tester.errors.nth(2)).toMatchTextContent('Le téléphone est obligatoire');
      await expect.element(tester.errors.nth(3)).toMatchTextContent('Le CRB est obligatoire');

      await tester.email.fill('bad-email');
      await expect.element(tester.errors.nth(1)).toMatchTextContent('Le courriel doit être une adresse email valide');

      expect(accessionHolderService.create).not.toHaveBeenCalled();
    });

    test('should create an accession holder', async () => {
      await tester.name.fill('Cyril');
      await tester.email.fill('cyril@grc1.com');
      await tester.phone.fill('0601020304');
      await tester.grc.selectOptions('GRC1');

      accessionHolderService.create.mockReturnValue(of({} as AccessionHolder));
      await tester.saveButton.click();

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

  describe('in update mode', async () => {
    beforeEach(async () => {
      route.setParam('accessionHolderId', '41');
      accessionHolderService.get.mockReturnValue(
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
    });

    test('should have a title', async () => {
      await expect.element(tester.title).toHaveTextContent(`Modifier un gestionnaire d'accessions`);
    });

    test('should display a filled form', async () => {
      await expect.element(tester.name).toHaveValue('Cyril');
      await expect.element(tester.email).toHaveValue('cyril@grc2.fr');
      await expect.element(tester.phone).toHaveValue('0600000000');
      await expect.element(tester.grc).toHaveDisplayValue('GRC2');
      expect(tester.optionLabels()).toEqual(['', 'GRC1', 'GRC2']);
    });

    test('should update the accession holder', async () => {
      await tester.name.fill('Cédric');
      await tester.email.fill('cedric@grc1.fr');
      await tester.grc.selectOptions('GRC1');

      accessionHolderService.update.mockReturnValue(of(undefined));
      await tester.saveButton.click();

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
