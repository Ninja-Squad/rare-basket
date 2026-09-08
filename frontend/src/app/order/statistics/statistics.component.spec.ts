import { TestBed } from '@angular/core/testing';

import { StatisticsComponent } from './statistics.component';
import { page } from 'vitest/browser';
import { ActivatedRouteStub, stubRoute } from '../../../test/route-stub';
import { createMock, MockObject } from '../../../test/mock';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order.service';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { formatDate } from '@angular/common';
import { Grc, User } from '../../shared/user.model';
import { AuthenticationService } from '../../shared/authentication.service';
import { GrcService } from '../../shared/grc.service';
import { OrderStatistics } from '../order.model';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { provideNgbDatepickerServices } from '../../rb-ngb/datepicker-providers';
import { beforeEach, describe, expect, test } from 'vitest';

class StatisticsComponentTester {
  readonly fixture = TestBed.createComponent(StatisticsComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly from = this.root.getByCss('#from');
  readonly to = this.root.getByCss('#to');
  readonly perimeter = this.root.getByCss('#perimeter');
  readonly editPerimeterButton = this.root.getByCss('#edit-perimeter');
  readonly noGlobalVisualizationRadio = this.root.getByCss('#no-global-visualization');
  readonly globalVisualizationRadio = this.root.getByCss('#global-visualization');
  readonly grcs = this.root.getByCss('.grcs input');
  readonly refreshButton = this.root.getByCss('#refresh-button');
  readonly numbers = this.root.getByCss('#numbers');
  readonly customerTypesChart = this.root.getByCss('#customer-types-chart');
  readonly customerTypeStats = this.root.getByCss('.customer-type-stat');
  readonly orderStatusChart = this.root.getByCss('#order-status-chart');
  readonly orderStatusStats = this.root.getByCss('.order-status-stat');
  readonly errors = this.root.getByCss('.invalid-feedback div');

  get componentInstance() {
    return this.fixture.componentInstance;
  }
}

describe('StatisticsComponent', () => {
  let tester: StatisticsComponentTester;
  let router: MockObject<Router>;
  let orderService: MockObject<OrderService>;
  let grcService: MockObject<GrcService>;
  let user: User;
  let allGrcs: Array<Grc>;
  let statistics: OrderStatistics;
  let route: ActivatedRouteStub;

  beforeEach(async () => {
    route = stubRoute();

    user = {
      globalVisualization: true,
      visualizationGrcs: [] as Array<Grc>
    } as User;

    allGrcs = [
      {
        id: 1,
        name: 'GRC1'
      },
      {
        id: 2,
        name: 'GRC2'
      },
      {
        id: 3,
        name: 'GRC3'
      }
    ] as Array<Grc>;

    statistics = {
      createdOrderCount: 40,
      finalizedOrderCount: 35,
      cancelledOrderCount: 10,
      distinctFinalizedOrderCustomerCount: 20,
      averageFinalizationDurationInDays: 3.5,
      orderStatusStatistics: [
        {
          orderStatus: 'DRAFT',
          createdOrderCount: 24
        },
        {
          orderStatus: 'FINALIZED',
          createdOrderCount: 16
        }
      ],
      customerTypeStatistics: [
        {
          customerType: 'CITIZEN',
          finalizedOrderCount: 22
        },
        {
          customerType: 'FARMER',
          finalizedOrderCount: 13
        }
      ]
    };

    router = createMock(Router);

    orderService = createMock(OrderService);
    orderService.getStatistics.mockReturnValue(of(statistics));

    const authenticationService = createMock(AuthenticationService);
    authenticationService.getCurrentUser.mockReturnValue(of(user));

    grcService = createMock(GrcService);
    grcService.list.mockReturnValue(of(allGrcs));

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        provideNgbDatepickerServices(),
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: OrderService, useValue: orderService },
        { provide: AuthenticationService, useValue: authenticationService },
        { provide: GrcService, useValue: grcService }
      ]
    });

    await TestBed.createComponent(ValidationDefaultsComponent).whenStable();
  });

  describe('initialization, with global visualization user', () => {
    test('should initialize form when no query param', async () => {
      tester = new StatisticsComponentTester();
      await tester.fixture.whenStable();

      const currentYear = new Date().getFullYear();
      await expect.element(tester.from).toHaveValue(`01/01/${currentYear}`);
      await expect.element(tester.to).toHaveDisplayValue(/\d\d\/\d\d\/\d\d\d\d/);

      await expect.element(tester.noGlobalVisualizationRadio).toHaveLength(0);
      await expect.element(tester.globalVisualizationRadio).toHaveLength(0);
      await expect.element(tester.grcs).toHaveLength(0);
      await expect.element(tester.perimeter).toMatchTextContent('Pour tous les CRBs');

      await tester.editPerimeterButton.click();
      await expect.element(tester.perimeter).toHaveLength(0);

      await expect.element(tester.noGlobalVisualizationRadio).not.toBeChecked();
      await expect.element(tester.globalVisualizationRadio).toBeChecked();
      await expect.element(tester.grcs).toHaveLength(0);

      await tester.noGlobalVisualizationRadio.click();
      await expect.element(tester.globalVisualizationRadio).not.toBeChecked();
      await expect.element(tester.grcs).toHaveLength(3);
      for (let index = 0; index < 3; index += 1) {
        await expect.element(tester.grcs.nth(index)).not.toBeChecked();
      }
    });

    test('should initialize form when query params present', async () => {
      route.setQueryParams({
        from: '2019-01-01',
        to: '2020-01-01',
        grcs: ['2', '3']
      });

      tester = new StatisticsComponentTester();

      await expect.element(tester.from).toHaveValue(`01/01/2019`);
      await expect.element(tester.to).toHaveValue('01/01/2020');

      await expect.element(tester.perimeter).toMatchTextContent(/Pour le\(s\) CRB\(s\) suivant\(s\)\s*:\s*GRC2, GRC3/);

      await tester.editPerimeterButton.click();
      await expect.element(tester.perimeter).not.toBeInTheDocument();

      await expect.element(tester.noGlobalVisualizationRadio).toBeChecked();
      await expect.element(tester.globalVisualizationRadio).not.toBeChecked();
      await expect.element(tester.grcs).toHaveLength(3);

      await expect.element(tester.grcs.nth(0)).not.toBeChecked();
      await expect.element(tester.grcs.nth(1)).toBeChecked();
      await expect.element(tester.grcs.nth(2)).toBeChecked();
    });

    test('should display numbers, charts and tables', async () => {
      tester = new StatisticsComponentTester();
      await tester.fixture.whenStable();

      const currentYear = new Date().getFullYear();
      const now = new Date();
      const from = `${currentYear}-01-01`;
      const to = formatDate(now, 'yyyy-MM-dd', 'en-us');
      expect(orderService.getStatistics).toHaveBeenCalledWith(from, to, []);
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { from, to },
        replaceUrl: true
      });

      await expect.element(tester.numbers).toMatchTextContent('40 commandes créées');
      await expect.element(tester.numbers).toMatchTextContent('35 commandes finalisées');
      await expect.element(tester.numbers).toMatchTextContent('10 commandes annulées');
      await expect.element(tester.numbers).toMatchTextContent('20 clients distincts');
      await expect.element(tester.numbers).toMatchTextContent('3,5 jours pour finaliser une commande');

      await expect.element(tester.customerTypesChart).toHaveLength(1);
      await expect.element(tester.customerTypeStats).toHaveLength(2);
      await expect.element(tester.customerTypeStats.nth(0)).toMatchTextContent('Citoyen');
      await expect.element(tester.customerTypeStats.nth(0)).toMatchTextContent('22');
      await expect.element(tester.customerTypeStats.nth(1)).toMatchTextContent('Agriculteur');
      await expect.element(tester.customerTypeStats.nth(1)).toMatchTextContent('13');

      await expect.element(tester.orderStatusChart).toHaveLength(1);
      await expect.element(tester.orderStatusStats).toHaveLength(2);
      await expect.element(tester.orderStatusStats.nth(0)).toMatchTextContent('En cours');
      await expect.element(tester.orderStatusStats.nth(0)).toMatchTextContent(/24\s*\(60\s*%\)/);
    });

    test('should display charts and tables for the given parameters', async () => {
      route.setQueryParams({
        from: '2019-01-01',
        to: '2020-01-01',
        grcs: ['2', '3']
      });

      tester = new StatisticsComponentTester();
      await tester.fixture.whenStable();

      await expect.element(tester.from).toHaveValue('01/01/2019');
      await expect.element(tester.to).toHaveValue('01/01/2020');
      expect(orderService.getStatistics).toHaveBeenCalledWith('2019-01-01', '2020-01-01', [2, 3]);
    });
  });

  describe('initialization, with constrained visualization user having more than one grc', () => {
    beforeEach(() => {
      user.globalVisualization = false;
      user.visualizationGrcs = [allGrcs[0], allGrcs[1]];
    });

    test('should initialize form when no query param', async () => {
      tester = new StatisticsComponentTester();
      await tester.fixture.whenStable();

      const currentYear = new Date().getFullYear();
      await expect.element(tester.from).toHaveValue(`01/01/${currentYear}`);
      expect((tester.to.element() as HTMLInputElement).value).toMatch(/\d\d\/\d\d\/\d\d\d\d/);

      await expect.element(tester.noGlobalVisualizationRadio).toHaveLength(0);
      await expect.element(tester.globalVisualizationRadio).toHaveLength(0);
      await expect.element(tester.grcs).toHaveLength(0);
      await expect.element(tester.perimeter).toMatchTextContent(/Pour le\(s\) CRB\(s\) suivant\(s\)\s*:\s*GRC1, GRC2/);

      await tester.editPerimeterButton.click();
      await expect.element(tester.perimeter).not.toBeInTheDocument();
      await expect.element(tester.noGlobalVisualizationRadio).toHaveLength(0);
      await expect.element(tester.globalVisualizationRadio).toHaveLength(0);
      await expect.element(tester.grcs).toHaveLength(2);
      for (let index = 0; index < 2; index += 1) {
        await expect.element(tester.grcs.nth(index)).toBeChecked();
      }
    });

    test('should initialize form when query params present', async () => {
      route.setQueryParams({
        from: '2019-01-01',
        to: '2020-01-01',
        grcs: ['2']
      });

      tester = new StatisticsComponentTester();
      await tester.fixture.whenStable();

      await expect.element(tester.from).toHaveValue(`01/01/2019`);
      await expect.element(tester.to).toHaveValue('01/01/2020');

      await expect.element(tester.perimeter).toMatchTextContent(/Pour le\(s\) CRB\(s\) suivant\(s\)\s*:\s*GRC2/);

      await tester.editPerimeterButton.click();
      await expect.element(tester.perimeter).toHaveLength(0);
      await expect.element(tester.grcs).toHaveLength(2);
      await expect.element(tester.grcs.nth(0)).not.toBeChecked();
      await expect.element(tester.grcs.nth(1)).toBeChecked();
    });

    test('should get statistics', async () => {
      tester = new StatisticsComponentTester();
      await tester.fixture.whenStable();

      const currentYear = new Date().getFullYear();
      const now = new Date();
      const from = `${currentYear}-01-01`;
      const to = formatDate(now, 'yyyy-MM-dd', 'en-us');
      expect(orderService.getStatistics).toHaveBeenCalledWith(from, to, [1, 2]);
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { from, to, grcs: [1, 2] },
        replaceUrl: true
      });
    });

    test('should display charts and tables for the given parameters', async () => {
      route.setQueryParams({
        from: '2019-01-01',
        to: '2020-01-01',
        grcs: ['2']
      });

      tester = new StatisticsComponentTester();
      await tester.fixture.whenStable();

      await expect.element(tester.from).toHaveValue('01/01/2019');
      await expect.element(tester.to).toHaveValue('01/01/2020');
      expect(orderService.getStatistics).toHaveBeenCalledWith('2019-01-01', '2020-01-01', [2]);
    });
  });

  describe('initialization, with constrained visualization user having more only one grc', () => {
    beforeEach(() => {
      user.globalVisualization = false;
      user.visualizationGrcs = [allGrcs[0]];
    });

    test('should initialize form when no query param', async () => {
      tester = new StatisticsComponentTester();
      await tester.fixture.whenStable();

      const currentYear = new Date().getFullYear();
      await expect.element(tester.from).toHaveValue(`01/01/${currentYear}`);
      expect((tester.to.element() as HTMLInputElement).value).toMatch(/\d\d\/\d\d\/\d\d\d\d/);

      await expect.element(tester.noGlobalVisualizationRadio).not.toBeInTheDocument();
      await expect.element(tester.globalVisualizationRadio).not.toBeInTheDocument();
      await expect.element(tester.grcs).toHaveLength(0);
      await expect.element(tester.perimeter).toMatchTextContent(/Pour le\(s\) CRB\(s\) suivant\(s\)\s*:\s*GRC1/);

      await expect.element(tester.editPerimeterButton).not.toBeInTheDocument();
    });

    test('should initialize form when query params present', async () => {
      route.setQueryParams({
        from: '2019-01-01',
        to: '2020-01-01',
        grcs: ['1']
      });

      tester = new StatisticsComponentTester();
      await tester.fixture.whenStable();

      await expect.element(tester.from).toHaveValue(`01/01/2019`);
      await expect.element(tester.to).toHaveValue('01/01/2020');

      await expect.element(tester.perimeter).toMatchTextContent(/Pour le\(s\) CRB\(s\) suivant\(s\)\s*:\s*GRC1/);
      await expect.element(tester.editPerimeterButton).not.toBeInTheDocument();
    });

    test('should get statistics', async () => {
      tester = new StatisticsComponentTester();
      await tester.fixture.whenStable();

      const currentYear = new Date().getFullYear();
      const now = new Date();
      const from = `${currentYear}-01-01`;
      const to = formatDate(now, 'yyyy-MM-dd', 'en-us');
      expect(orderService.getStatistics).toHaveBeenCalledWith(from, to, [1]);
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { from, to, grcs: [1] },
        replaceUrl: true
      });
    });

    test('should display charts and tables for the given parameters', async () => {
      route.setQueryParams({
        from: '2019-01-01',
        to: '2020-01-01',
        grcs: ['1']
      });

      tester = new StatisticsComponentTester();
      await tester.fixture.whenStable();

      await expect.element(tester.from).toHaveValue('01/01/2019');
      await expect.element(tester.to).toHaveValue('01/01/2020');
      expect(orderService.getStatistics).toHaveBeenCalledWith('2019-01-01', '2020-01-01', [1]);
    });
  });

  describe('after first display', () => {
    beforeEach(async () => {
      tester = new StatisticsComponentTester();
      await tester.fixture.whenStable();
      router.navigate.mockReset();
      orderService.getStatistics.mockReset();
      orderService.getStatistics.mockReturnValue(of(statistics));
    });

    test('should not navigate and refresh if invalid', async () => {
      await tester.from.fill('2019-02-01');
      await tester.to.fill('2019-01-31');
      await tester.refreshButton.click();

      await expect.element(tester.errors).toHaveLength(1);
      await expect.element(tester.root).toMatchTextContent('La plage de dates est invalide');

      await tester.from.fill('');
      await tester.to.fill('');
      await tester.refreshButton.click();

      // required errors are not displayed because it messes up the layout, but the form should be invalid
      expect(tester.componentInstance.form.invalid).toBe(true);

      await tester.editPerimeterButton.click();
      await tester.noGlobalVisualizationRadio.click();
      const grcCount = tester.grcs.length;
      for (let index = 0; index < grcCount; index += 1) {
        await tester.grcs.nth(index).click();
      }
      await tester.fixture.whenStable();

      expect(router.navigate).not.toHaveBeenCalled();
      expect(orderService.getStatistics).not.toHaveBeenCalled();
    });

    test('should not display charts and tables if no order', async () => {
      statistics.createdOrderCount = 0;
      statistics.finalizedOrderCount = 0;
      statistics.orderStatusStatistics = [];
      statistics.customerTypeStatistics = [];

      await tester.refreshButton.click();

      await expect.element(tester.orderStatusStats).toHaveLength(0);
      await expect.element(tester.orderStatusChart).toHaveLength(0);
      await expect.element(tester.customerTypeStats).toHaveLength(0);
      await expect.element(tester.customerTypesChart).toHaveLength(0);

      await expect.element(tester.root).toMatchTextContent('Aucune commande finalisée sur cette plage de temps et ce périmètre');
      await expect.element(tester.root).toMatchTextContent('Aucune commande créée sur cette plage de temps et ce périmètre');
    });
  });
});
