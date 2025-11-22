import { beforeEach, describe, expect, it, type MockedObject } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { StatisticsComponent } from './statistics.component';
import { ActivatedRouteStub, ComponentTester, stubRoute, TestInput } from 'ngx-speculoos';
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
import { createMock } from '../../../mock';

class StatisticsComponentTester extends ComponentTester<StatisticsComponent> {
  constructor() {
    super(StatisticsComponent);
  }

  get from() {
    return this.input('#from')!;
  }

  get to() {
    return this.input('#to')!;
  }

  get perimeter() {
    return this.element('#perimeter')!;
  }

  get editPerimeterButton() {
    return this.element<HTMLAnchorElement>('#edit-perimeter');
  }

  get noGlobalVisualizationRadio() {
    return this.input('#no-global-visualization');
  }

  get globalVisualizationRadio() {
    return this.input('#global-visualization');
  }

  get grcs() {
    return this.elements('.grcs input') as Array<TestInput>;
  }

  get refreshButton() {
    return this.button('#refresh-button')!;
  }

  get numbers() {
    return this.element('#numbers');
  }

  get customerTypesChart() {
    return this.element('#customer-types-chart');
  }

  get customerTypeStats() {
    return this.elements('.customer-type-stat');
  }

  get orderStatusChart() {
    return this.element('#order-status-chart');
  }

  get orderStatusStats() {
    return this.elements('.order-status-stat');
  }

  get errors() {
    return this.elements('.invalid-feedback div');
  }
}

describe('StatisticsComponent', () => {
  let tester: StatisticsComponentTester;
  let router: MockedObject<Router>;
  let orderService: MockedObject<OrderService>;
  let grcService: MockedObject<GrcService>;
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
    it.only('should initialize form when no query param', async () => {
      tester = new StatisticsComponentTester();
      await tester.stable();

      const currentYear = new Date().getFullYear();
      expect(tester.from).toHaveValue(`01/01/${currentYear}`);
      expect(tester.to.value).toMatch(/\d\d\/\d\d\/\d\d\d\d/);

      expect(tester.noGlobalVisualizationRadio).toBeNull();
      expect(tester.globalVisualizationRadio).toBeNull();
      expect(tester.grcs.length).toBe(0);
      expect(tester.perimeter).toContainText('Pour tous les CRBs');

      await tester.editPerimeterButton!.click();
      expect(tester.perimeter).toBeNull();

      expect(tester.noGlobalVisualizationRadio).not.toBeChecked();
      expect(tester.globalVisualizationRadio).toBeChecked();
      expect(tester.grcs.length).toBe(0);

      await tester.noGlobalVisualizationRadio!.check();
      expect(tester.globalVisualizationRadio).not.toBeChecked();
      expect(tester.grcs.length).toBe(3);
      tester.grcs.forEach(grc => expect(grc).not.toBeChecked());
    });

    it('should initialize form when query params present', async () => {
      route.setQueryParams({
        from: '2019-01-01',
        to: '2020-01-01',
        grcs: ['2', '3']
      });

      tester = new StatisticsComponentTester();
      await tester.stable();

      expect(tester.from).toHaveValue(`01/01/2019`);
      expect(tester.to.value).toMatch('01/01/2020');

      expect(tester.perimeter).toContainText('Pour le(s) CRB(s) suivant(s)\u00a0: GRC2, GRC3');

      await tester.editPerimeterButton!.click();
      expect(tester.perimeter).toBeNull();

      expect(tester.noGlobalVisualizationRadio).toBeChecked();
      expect(tester.globalVisualizationRadio).not.toBeChecked();
      expect(tester.grcs.length).toBe(3);

      expect(tester.grcs[0]).not.toBeChecked();
      expect(tester.grcs[1]).toBeChecked();
      expect(tester.grcs[2]).toBeChecked();
    });

    it('should display numbers, charts and tables', async () => {
      tester = new StatisticsComponentTester();
      await tester.stable();

      const currentYear = new Date().getFullYear();
      const now = new Date();
      const from = `${currentYear}-01-01`;
      const to = formatDate(now, 'yyyy-MM-dd', 'en-us');
      expect(orderService.getStatistics).toHaveBeenCalledWith(from, to, []);
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { from, to },
        replaceUrl: true
      });

      expect(tester.numbers).toContainText('40 commandes créées');
      expect(tester.numbers).toContainText('35 commandes finalisées');
      expect(tester.numbers).toContainText('10 commandes annulées');
      expect(tester.numbers).toContainText('20 clients distincts');
      expect(tester.numbers).toContainText('3,5 jours pour finaliser une commande');

      expect(tester.customerTypesChart).not.toBeNull();
      expect(tester.customerTypeStats.length).toBe(2);
      expect(tester.customerTypeStats[0]).toContainText('Citoyen');
      expect(tester.customerTypeStats[0]).toContainText('22');
      expect(tester.customerTypeStats[1]).toContainText('Agriculteur');
      expect(tester.customerTypeStats[1]).toContainText('13');

      expect(tester.orderStatusChart).not.toBeNull();
      expect(tester.orderStatusStats.length).toBe(2);
      expect(tester.orderStatusStats[0]).toContainText('En cours');
      expect(tester.orderStatusStats[0]).toContainText('24 (60 %)');
    });

    it('should display charts and tables for the given parameters', async () => {
      route.setQueryParams({
        from: '2019-01-01',
        to: '2020-01-01',
        grcs: ['2', '3']
      });

      tester = new StatisticsComponentTester();
      await tester.stable();

      expect(tester.from).toHaveValue('01/01/2019');
      expect(tester.to).toHaveValue('01/01/2020');
      expect(orderService.getStatistics).toHaveBeenCalledWith('2019-01-01', '2020-01-01', [2, 3]);
    });
  });

  describe('initialization, with constrained visualization user having more than one grc', () => {
    beforeEach(() => {
      user.globalVisualization = false;
      user.visualizationGrcs = [allGrcs[0], allGrcs[1]];
    });

    it('should initialize form when no query param', async () => {
      tester = new StatisticsComponentTester();
      await tester.stable();

      const currentYear = new Date().getFullYear();
      expect(tester.from).toHaveValue(`01/01/${currentYear}`);
      expect(tester.to.value).toMatch(/\d\d\/\d\d\/\d\d\d\d/);

      expect(tester.noGlobalVisualizationRadio).toBeNull();
      expect(tester.globalVisualizationRadio).toBeNull();
      expect(tester.grcs.length).toBe(0);
      expect(tester.perimeter).toContainText('Pour le(s) CRB(s) suivant(s)\u00a0: GRC1, GRC2');

      await tester.editPerimeterButton!.click();
      expect(tester.perimeter).toBeNull();

      expect(tester.noGlobalVisualizationRadio).toBeNull();
      expect(tester.globalVisualizationRadio).toBeNull();
      expect(tester.grcs.length).toBe(2);
      tester.grcs.forEach(grc => expect(grc).toBeChecked());
    });

    it('should initialize form when query params present', async () => {
      route.setQueryParams({
        from: '2019-01-01',
        to: '2020-01-01',
        grcs: ['2']
      });

      tester = new StatisticsComponentTester();
      await tester.stable();

      expect(tester.from).toHaveValue(`01/01/2019`);
      expect(tester.to.value).toMatch('01/01/2020');

      expect(tester.perimeter).toContainText('Pour le(s) CRB(s) suivant(s)\u00a0: GRC2');

      await tester.editPerimeterButton!.click();
      expect(tester.perimeter).toBeNull();

      expect(tester.grcs.length).toBe(2);

      expect(tester.grcs[0]).not.toBeChecked();
      expect(tester.grcs[1]).toBeChecked();
    });

    it('should get statistics', async () => {
      tester = new StatisticsComponentTester();
      await tester.stable();

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

    it('should display charts and tables for the given parameters', async () => {
      route.setQueryParams({
        from: '2019-01-01',
        to: '2020-01-01',
        grcs: ['2']
      });

      tester = new StatisticsComponentTester();
      await tester.stable();

      expect(tester.from).toHaveValue('01/01/2019');
      expect(tester.to).toHaveValue('01/01/2020');
      expect(orderService.getStatistics).toHaveBeenCalledWith('2019-01-01', '2020-01-01', [2]);
    });
  });

  describe('initialization, with constrained visualization user having more only one grc', () => {
    beforeEach(() => {
      user.globalVisualization = false;
      user.visualizationGrcs = [allGrcs[0]];
    });

    it('should initialize form when no query param', async () => {
      tester = new StatisticsComponentTester();
      await tester.stable();

      const currentYear = new Date().getFullYear();
      expect(tester.from).toHaveValue(`01/01/${currentYear}`);
      expect(tester.to.value).toMatch(/\d\d\/\d\d\/\d\d\d\d/);

      expect(tester.noGlobalVisualizationRadio).toBeNull();
      expect(tester.globalVisualizationRadio).toBeNull();
      expect(tester.grcs.length).toBe(0);
      expect(tester.perimeter).toContainText('Pour le(s) CRB(s) suivant(s)\u00a0: GRC1');

      expect(tester.editPerimeterButton).toBeNull();
    });

    it('should initialize form when query params present', async () => {
      route.setQueryParams({
        from: '2019-01-01',
        to: '2020-01-01',
        grcs: ['1']
      });

      tester = new StatisticsComponentTester();
      await tester.stable();

      expect(tester.from).toHaveValue(`01/01/2019`);
      expect(tester.to.value).toMatch('01/01/2020');

      expect(tester.perimeter).toContainText('Pour le(s) CRB(s) suivant(s)\u00a0: GRC1');
      expect(tester.editPerimeterButton).toBeNull();
    });

    it('should get statistics', async () => {
      tester = new StatisticsComponentTester();
      await tester.stable();

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

    it('should display charts and tables for the given parameters', async () => {
      route.setQueryParams({
        from: '2019-01-01',
        to: '2020-01-01',
        grcs: ['1']
      });

      tester = new StatisticsComponentTester();
      await tester.stable();

      expect(tester.from).toHaveValue('01/01/2019');
      expect(tester.to).toHaveValue('01/01/2020');
      expect(orderService.getStatistics).toHaveBeenCalledWith('2019-01-01', '2020-01-01', [1]);
    });
  });

  describe('after first display', () => {
    beforeEach(async () => {
      tester = new StatisticsComponentTester();
      await tester.stable();
      router.navigate.mockClear();
      orderService.getStatistics.mockClear();
    });

    it('should navigate and refresh', async () => {
      await tester.from.fillWith('2019-01-01');
      await tester.to.fillWith('2019-02-01');
      await tester.refreshButton.click();

      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { from: '2019-01-01', to: '2019-02-01' },
        replaceUrl: true
      });
      expect(orderService.getStatistics).toHaveBeenCalledWith('2019-01-01', '2019-02-01', []);
    });

    it('should not navigate and refresh if invalid', async () => {
      await tester.from.fillWith('2019-02-01');
      await tester.to.fillWith('2019-01-31');
      await tester.refreshButton.click();

      expect(tester.errors.length).toBe(1);
      expect(tester.testElement).toContainText('La plage de dates est invalide');

      await tester.from.fillWith('');
      await tester.to.fillWith('');
      await tester.refreshButton.click();

      // required errors are not displayed because it messes up the layout, but the form should be invalid
      expect(tester.componentInstance.form.invalid).toBe(true);

      await tester.editPerimeterButton!.click();
      await tester.noGlobalVisualizationRadio!.check();
      tester.grcs.forEach(async grc => await grc.uncheck());

      expect(tester.errors.length).toBe(1);
      expect(tester.testElement).toContainText('Au moins un CRB doit être sélectionné');

      expect(router.navigate).not.toHaveBeenCalled();
      expect(orderService.getStatistics).not.toHaveBeenCalled();
    });
  });

  describe('after first display', () => {
    beforeEach(async () => {
      tester = new StatisticsComponentTester();
      await tester.stable();
      router.navigate.mockClear();
      orderService.getStatistics.mockClear();
    });

    it('should navigate and refresh', async () => {
      await tester.from.fillWith('2019-01-01');
      await tester.to.fillWith('2019-02-01');
      await tester.refreshButton.click();

      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { from: '2019-01-01', to: '2019-02-01' },
        replaceUrl: true
      });
      expect(orderService.getStatistics).toHaveBeenCalledWith('2019-01-01', '2019-02-01', []);
    });

    it('should not navigate and refresh if invalid', async () => {
      await tester.from.fillWith('2019-02-01');
      await tester.to.fillWith('2019-01-31');
      await tester.refreshButton.click();

      expect(tester.errors.length).toBe(1);
      expect(tester.testElement).toContainText('La plage de dates est invalide');

      await tester.from.fillWith('');
      await tester.to.fillWith('');
      await tester.refreshButton.click();

      // required errors are not displayed because it messes up the layout, but the form should be invalid
      expect(tester.componentInstance.form.invalid).toBe(true);

      await tester.editPerimeterButton!.click();
      await tester.noGlobalVisualizationRadio!.check();
      await tester.grcs.forEach(grc => grc.uncheck());

      expect(tester.errors.length).toBe(1);
      expect(tester.testElement).toContainText('Au moins un CRB doit être sélectionné');

      expect(router.navigate).not.toHaveBeenCalled();
      expect(orderService.getStatistics).not.toHaveBeenCalled();
    });

    it('should not display charts and tables if no order', async () => {
      statistics.createdOrderCount = 0;
      statistics.finalizedOrderCount = 0;

      await tester.refreshButton.click();

      expect(tester.orderStatusStats.length).toBe(0);
      expect(tester.orderStatusChart).toBeNull();
      expect(tester.customerTypeStats.length).toBe(0);
      expect(tester.customerTypesChart).toBeNull();

      expect(tester.testElement).toContainText('Aucune commande finalisée sur cette plage de temps et ce périmètre');
      expect(tester.testElement).toContainText('Aucune commande créée sur cette plage de temps et ce périmètre');
    });
  });
});
