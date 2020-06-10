import { TestBed } from '@angular/core/testing';

import { StatisticsComponent } from './statistics.component';
import { ComponentTester, fakeRoute, speculoosMatchers } from 'ngx-speculoos';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { ReactiveFormsModule } from '@angular/forms';
import { ChartModule } from '../../chart/chart.module';
import { BehaviorSubject, of } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { OrderService } from '../order.service';
import { SharedModule } from '../../shared/shared.module';
import { OrderStatusEnumPipe } from '../order-status-enum.pipe';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { RbNgbModule } from '../../rb-ngb/rb-ngb.module';
import { ValdemortModule } from 'ngx-valdemort';
import { formatDate } from '@angular/common';

class StatisticsComponentTester extends ComponentTester<StatisticsComponent> {
  constructor() {
    super(StatisticsComponent);
  }

  get from() {
    return this.input('#from');
  }

  get to() {
    return this.input('#to');
  }

  get refreshButton() {
    return this.button('#refresh-button');
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
  let queryParamsSubject: BehaviorSubject<Params>;
  let router: jasmine.SpyObj<Router>;
  let orderService: jasmine.SpyObj<OrderService>;

  beforeEach(() => {
    queryParamsSubject = new BehaviorSubject<Params>({});
    const route = fakeRoute({
      queryParams: queryParamsSubject
    });

    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    orderService = jasmine.createSpyObj<OrderService>('OrderService', ['getStatistics']);

    TestBed.configureTestingModule({
      imports: [I18nTestingModule, RbNgbModule, ReactiveFormsModule, ChartModule, RouterTestingModule, SharedModule, ValdemortModule],
      declarations: [StatisticsComponent, OrderStatusEnumPipe, ValidationDefaultsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: OrderService, useValue: orderService }
      ]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    tester = new StatisticsComponentTester();

    jasmine.addMatchers(speculoosMatchers);
  });

  it('should display current year numbers, charts and tables', () => {
    orderService.getStatistics.and.returnValue(
      of({
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
      })
    );

    tester.detectChanges();

    const currentYear = new Date().getFullYear();
    const now = new Date();
    expect(tester.from).toHaveValue(`01/01/${currentYear}`);
    expect(tester.to.value).toMatch(/\d\d\/\d\d\/\d\d\d\d/);

    expect(orderService.getStatistics).toHaveBeenCalledWith(`${currentYear}-01-01`, formatDate(now, 'yyyy-MM-dd', 'en-us'));

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

  it('should display charts and tables for the given route parameters', () => {
    orderService.getStatistics.and.returnValue(
      of({
        createdOrderCount: 0,
        finalizedOrderCount: 0,
        cancelledOrderCount: 0,
        distinctFinalizedOrderCustomerCount: 0,
        averageFinalizationDurationInDays: 0,
        orderStatusStatistics: [],
        customerTypeStatistics: []
      })
    );

    queryParamsSubject.next({ from: '2019-01-01', to: '2019-02-01' });
    tester.detectChanges();

    expect(tester.from).toHaveValue('01/01/2019');
    expect(tester.to).toHaveValue('01/02/2019');
    expect(orderService.getStatistics).toHaveBeenCalledWith('2019-01-01', '2019-02-01');
  });

  describe('after first display', () => {
    beforeEach(() => {
      orderService.getStatistics.and.returnValue(
        of({
          createdOrderCount: 0,
          finalizedOrderCount: 0,
          cancelledOrderCount: 0,
          distinctFinalizedOrderCustomerCount: 0,
          averageFinalizationDurationInDays: 0,
          orderStatusStatistics: [],
          customerTypeStatistics: []
        })
      );

      queryParamsSubject.next({});
      tester.detectChanges();

      router.navigate.calls.reset();
      orderService.getStatistics.calls.reset();
    });

    it('should navigate and refresh', () => {
      tester.from.fillWith('2019-01-01');
      tester.to.fillWith('2019-02-01');
      tester.refreshButton.click();

      expect(router.navigate).toHaveBeenCalledWith(['.'], {
        queryParams: { from: '2019-01-01', to: '2019-02-01' },
        relativeTo: TestBed.inject(ActivatedRoute),
        replaceUrl: true
      });
      expect(orderService.getStatistics).toHaveBeenCalledWith('2019-01-01', '2019-02-01');
    });

    it('should not navigate and refresh if invalid', () => {
      tester.from.fillWith('2019-02-01');
      tester.to.fillWith('2019-01-31');
      tester.refreshButton.click();

      expect(tester.errors.length).toBe(1);
      expect(tester.testElement).toContainText('La plage de dates est invalide');

      tester.from.fillWith('');
      tester.to.fillWith('');
      tester.refreshButton.click();

      // required errors are not displayed because it messes up the layout, but the form should be invalid
      expect(tester.componentInstance.form.invalid).toBe(true);

      expect(router.navigate).not.toHaveBeenCalled();
      expect(orderService.getStatistics).not.toHaveBeenCalled();
    });
  });
});
