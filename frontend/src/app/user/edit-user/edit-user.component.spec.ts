import { TestBed } from '@angular/core/testing';

import { EditUserComponent } from './edit-user.component';
import { createMock, MockObject } from '../../../test/mock';
import { ActivatedRouteStub, stubRoute } from '../../../test/route-stub';
import { AccessionHolder, Grc, User, UserCommand } from '../../shared/user.model';
import { UserService } from '../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { of } from 'rxjs';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

class EditUserComponentTester {
  readonly fixture = TestBed.createComponent(EditUserComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly title = this.root.getByCss('h1');
  readonly name = this.root.getByCss('#name');
  readonly orderManagement = this.root.getByCss('#order-management');
  readonly orderVisualization = this.root.getByCss('#order-visualization');
  readonly administration = this.root.getByCss('#administration');
  readonly accessionHolders = this.root.getByCss('.accession-holders input');
  readonly noGlobalVisualization = this.root.getByCss('#no-global-visualization');
  readonly globalVisualization = this.root.getByCss('#global-visualization');
  readonly visualizationGrcs = this.root.getByCss('.grcs input');
  readonly errors = this.root.getByCss('.invalid-feedback div');
  readonly saveButton = this.root.getByCss('#save-button');

  get componentInstance() {
    return this.fixture.componentInstance;
  }
}

describe('EditUserComponent', () => {
  let tester: EditUserComponentTester;
  let userService: MockObject<UserService>;
  let accessionHolderService: MockObject<AccessionHolderService>;
  let grcService: MockObject<GrcService>;
  let router: Router;
  let toastService: MockObject<ToastService>;
  let route: ActivatedRouteStub;

  beforeEach(() => {
    userService = createMock(UserService);
    accessionHolderService = createMock(AccessionHolderService);
    grcService = createMock(GrcService);
    toastService = createMock(ToastService);
    route = stubRoute();

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        { provide: UserService, useValue: userService },
        { provide: AccessionHolderService, useValue: accessionHolderService },
        { provide: GrcService, useValue: grcService },
        { provide: ToastService, useValue: toastService },
        { provide: ActivatedRoute, useValue: route }
      ]
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    TestBed.createComponent(ValidationDefaultsComponent);

    accessionHolderService.list.mockReturnValue(
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
      tester = new EditUserComponentTester();
    });

    test('should have a title', async () => {
      await expect.element(tester.title).toHaveTextContent('Créer un utilisateur');
    });

    test('should display an empty form', async () => {
      await expect.element(tester.name).toHaveValue('');
      await expect.element(tester.orderManagement).not.toBeChecked();
      await expect.element(tester.orderVisualization).not.toBeChecked();
      await expect.element(tester.administration).not.toBeChecked();

      await expect.element(tester.accessionHolders).toHaveLength(0);
      await expect.element(tester.noGlobalVisualization).not.toBeInTheDocument();
      await expect.element(tester.globalVisualization).not.toBeInTheDocument();
      await expect.element(tester.visualizationGrcs).toHaveLength(0);

      await tester.orderManagement.click();

      await expect.element(tester.accessionHolders).toHaveLength(3);

      await tester.orderVisualization.click();

      await expect.element(tester.noGlobalVisualization).toBeInTheDocument();
      await expect.element(tester.globalVisualization).toBeInTheDocument();
      await expect.element(tester.noGlobalVisualization).toBeChecked();
      await expect.element(tester.globalVisualization).not.toBeChecked();
      await expect.element(tester.visualizationGrcs).toHaveLength(2);

      await tester.globalVisualization.click();
      await expect.element(tester.visualizationGrcs).toHaveLength(0);
    });

    test('should not save if error', async () => {
      await expect.element(tester.errors).toHaveLength(0);

      await tester.saveButton.click();

      await expect.element(tester.errors).toHaveLength(1);
      await expect.element(tester.errors.nth(0)).toHaveTextContent('Le nom est obligatoire');
      await tester.name.fill('Test');
      expect(tester.componentInstance.form().valid()).toBe(true);

      await tester.orderManagement.click();
      expect(tester.componentInstance.form().valid()).toBe(false);

      await expect.element(tester.errors).toHaveLength(1);
      await expect.element(tester.errors.nth(0)).toHaveTextContent(`Au moins un gestionnaire d'accessions doit être sélectionné`);

      await tester.orderManagement.click();
      expect(tester.componentInstance.form().valid()).toBe(true);
      await expect.element(tester.errors).toHaveLength(0);

      await tester.orderVisualization.click();
      expect(tester.componentInstance.form().valid()).toBe(false);
      await expect.element(tester.errors).toHaveLength(1);
      await expect.element(tester.errors.nth(0)).toHaveTextContent(`Au moins un CRB doit être sélectionné`);

      await tester.globalVisualization.click();
      expect(tester.componentInstance.form().valid()).toBe(true);
      await expect.element(tester.errors).toHaveLength(0);

      await tester.noGlobalVisualization.click();
      expect(tester.componentInstance.form().valid()).toBe(false);

      await tester.orderVisualization.click();
      expect(tester.componentInstance.form().valid()).toBe(true);

      expect(userService.create).not.toHaveBeenCalled();
    });

    test('should create user', async () => {
      await tester.name.fill('Test');
      await tester.orderManagement.click();
      await tester.accessionHolders.nth(1).click();

      await tester.orderVisualization.click();
      await tester.visualizationGrcs.nth(1).click();

      userService.create.mockReturnValue(of({} as User));
      await tester.saveButton.click();

      const expectedCommand: UserCommand = {
        name: 'Test',
        permissions: ['ORDER_MANAGEMENT', 'ORDER_VISUALIZATION'],
        accessionHolderIds: [12],
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
      route.setParam('userId', '42');
      userService.get.mockReturnValue(
        of({
          id: 42,
          name: 'Test',
          permissions: ['ORDER_MANAGEMENT', 'ORDER_VISUALIZATION'],
          accessionHolders: [{ id: 12 }],
          globalVisualization: false,
          visualizationGrcs: [
            {
              id: 2
            }
          ]
        } as User)
      );

      tester = new EditUserComponentTester();
    });

    test('should have a title', async () => {
      await expect.element(tester.title).toHaveTextContent(`Modifier l'utilisateur Test`);
    });

    test('should display a filled form', async () => {
      await expect.element(tester.name).toHaveValue('Test');
      await expect.element(tester.orderManagement).toBeChecked();
      await expect.element(tester.accessionHolders.nth(0)).not.toBeChecked();
      await expect.element(tester.accessionHolders.nth(1)).toBeChecked();
      await expect.element(tester.accessionHolders.nth(2)).not.toBeChecked();
      await expect.element(tester.orderVisualization).toBeChecked();
      await expect.element(tester.noGlobalVisualization).toBeChecked();
      await expect.element(tester.globalVisualization).not.toBeChecked();
      await expect.element(tester.visualizationGrcs.nth(0)).not.toBeChecked();
      await expect.element(tester.visualizationGrcs.nth(1)).toBeChecked();
      await expect.element(tester.administration).not.toBeChecked();
    });

    test('should update user', async () => {
      await tester.name.fill('Test2');
      await tester.orderManagement.click();
      await tester.orderVisualization.click();
      await tester.administration.click();

      userService.update.mockReturnValue(of(undefined));
      await tester.saveButton.click();

      const expectedCommand: UserCommand = {
        name: 'Test2',
        permissions: ['ADMINISTRATION'],
        accessionHolderIds: [],
        globalVisualization: false,
        visualizationGrcIds: []
      };
      expect(userService.update).toHaveBeenCalledWith(42, expectedCommand);
      expect(router.navigate).toHaveBeenCalledWith(['/users']);
      expect(toastService.success).toHaveBeenCalled();
    });
  });
});
