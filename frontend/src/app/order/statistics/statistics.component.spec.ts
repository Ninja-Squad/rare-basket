import { TestBed } from '@angular/core/testing';

import { FIRST_YEAR, StatisticsComponent } from './statistics.component';
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

class StatisticsComponentTester extends ComponentTester<StatisticsComponent> {
  constructor() {
    super(StatisticsComponent);
  }

  get year() {
    return this.select('#year');
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
      imports: [I18nTestingModule, ReactiveFormsModule, ChartModule, RouterTestingModule, SharedModule],
      declarations: [StatisticsComponent, OrderStatusEnumPipe],
      providers: [
        { provide: FIRST_YEAR, useValue: 2010 },
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: OrderService, useValue: orderService }
      ]
    });

    tester = new StatisticsComponentTester();

    jasmine.addMatchers(speculoosMatchers);
  });

  it('should display current year charts and tables', () => {
    orderService.getStatistics.and.returnValue(
      of({
        orderStatusStatistics: [
          {
            orderStatus: 'DRAFT',
            orderCount: 2
          },
          {
            orderStatus: 'FINALIZED',
            orderCount: 18
          }
        ],
        customerTypeStatistics: [
          {
            customerType: 'CITIZEN',
            accessionCount: 1
          },
          {
            customerType: 'FARMER',
            accessionCount: 2
          }
        ]
      })
    );

    tester.detectChanges();

    expect(orderService.getStatistics).toHaveBeenCalledWith(new Date().getFullYear());
    expect(tester.customerTypesChart).not.toBeNull();
    expect(tester.customerTypeStats.length).toBe(2);
    expect(tester.customerTypeStats[0]).toContainText('Agriculteur');
    expect(tester.customerTypeStats[0]).toContainText('2');
    expect(tester.customerTypeStats[1]).toContainText('Citoyen');
    expect(tester.customerTypeStats[1]).toContainText('1');
    expect(tester.orderStatusChart).not.toBeNull();
    expect(tester.orderStatusStats.length).toBe(2);
    expect(tester.orderStatusStats[0]).toContainText('En cours');
    expect(tester.orderStatusStats[0]).toContainText('2 (10 %)');
  });

  it('should display given year charts and tables', () => {
    orderService.getStatistics.and.returnValue(
      of({
        orderStatusStatistics: [],
        customerTypeStatistics: []
      })
    );

    queryParamsSubject.next({ year: '2019' });
    tester.detectChanges();

    expect(tester.year).toHaveSelectedLabel('2019');
    expect(orderService.getStatistics).toHaveBeenCalledWith(2019);
  });

  it('should navigate when changing year', () => {
    orderService.getStatistics.and.returnValue(
      of({
        orderStatusStatistics: [],
        customerTypeStatistics: []
      })
    );

    queryParamsSubject.next({});
    tester.detectChanges();

    tester.year.selectLabel('2019');

    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      queryParams: { year: '2019' },
      relativeTo: TestBed.inject(ActivatedRoute),
      replaceUrl: true
    });
  });
});
