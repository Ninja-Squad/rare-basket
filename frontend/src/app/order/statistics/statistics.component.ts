import { Component, Inject, InjectionToken, LOCALE_ID, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { OrderStatistics, OrderStatusStatistics } from '../order.model';
import { ChartConfiguration } from 'chart.js';
import { COLORS } from '../../chart/colors';
import { TranslateService } from '@ngx-translate/core';
import { formatNumber, formatPercent } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { concat, of } from 'rxjs';

export const FIRST_YEAR = new InjectionToken<number>('FIRST_YEAR');

@Component({
  selector: 'rb-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  form: FormGroup;
  years: Array<number>;

  stats: OrderStatistics;
  customerTypeBar: ChartConfiguration;
  orderStatusDoughnut: ChartConfiguration;
  totalOrderCount: number;
  colors = COLORS;

  constructor(
    fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private translateService: TranslateService,
    @Inject(FIRST_YEAR) firstYear: number,
    @Inject(LOCALE_ID) private locale: string
  ) {
    const currentYear = new Date().getFullYear();
    this.years = [];
    for (let year = currentYear; year >= firstYear; year--) {
      this.years.push(year);
    }
    this.form = fb.group({
      year: [this.years[0]]
    });
  }

  ngOnInit() {
    this.route.queryParamMap.pipe(map(params => +(params.get('year') || this.years[0]))).subscribe(year => {
      this.form.setValue({ year });
    });

    concat(of(this.form.value), this.form.valueChanges)
      .pipe(
        map(formValue => formValue.year),
        distinctUntilChanged(),
        tap(year => this.router.navigate(['.'], { queryParams: { year: `${year}` }, relativeTo: this.route, replaceUrl: true })),
        switchMap(year => this.orderService.getStatistics(year))
      )
      .subscribe(stats => {
        this.stats = stats;
        this.stats.customerTypeStatistics.sort((s1, s2) => s2.accessionCount - s1.accessionCount);
        this.totalOrderCount = this.countOrders();
        this.createCharts();
      });
  }

  orderCountRatio(stat: OrderStatusStatistics) {
    return stat.orderCount / this.totalOrderCount;
  }

  private createCharts() {
    this.createCustomerTypeDoughnutChart();
    this.createOrderStatusBarChart();
  }

  private createCustomerTypeDoughnutChart() {
    const shortLabels: Array<string> = [];
    const labels: Array<string> = [];
    const data: Array<number> = [];
    const backgroundColor: Array<string> = [];

    this.stats.customerTypeStatistics.forEach((value, index) => {
      labels.push(this.translateService.instant(`enums.customer-type.${value.customerType}`));
      shortLabels.push(this.translateService.instant(`enums.short-customer-type.${value.customerType}`));
      data.push(value.accessionCount);
      backgroundColor.push(COLORS[index % COLORS.length]);
    });

    this.customerTypeBar = {
      type: 'bar',
      data: { labels: shortLabels, datasets: [{ data, backgroundColor }] },
      options: {
        tooltips: {
          callbacks: {
            label: (tooltipItem, chart) => {
              const label = labels[tooltipItem.index];
              const stat = this.stats.customerTypeStatistics[tooltipItem.index];
              const accessionCount = formatNumber(stat.accessionCount, this.locale);
              return `${label}: ${accessionCount}`;
            }
          }
        },
        legend: {
          display: false
        },
        aspectRatio: 1.5
      }
    };
  }

  private createOrderStatusBarChart() {
    const labels: Array<string> = [];
    const data: Array<number> = [];
    const backgroundColor: Array<string> = [];

    this.stats.orderStatusStatistics.forEach((value, index) => {
      labels.push(this.translateService.instant(`enums.order-status.${value.orderStatus}`));
      data.push(value.orderCount);
      backgroundColor.push(COLORS[index % COLORS.length]);
    });

    this.orderStatusDoughnut = {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor }] },
      options: {
        cutoutPercentage: 70,
        tooltips: {
          callbacks: {
            label: (tooltipItem, chart) => {
              const label = labels[tooltipItem.index];
              const stat = this.stats.orderStatusStatistics[tooltipItem.index];
              const orderCount = formatNumber(stat.orderCount, this.locale);
              const percentage = formatPercent(this.orderCountRatio(stat), this.locale, '.0-0');
              return `${label}: ${orderCount} (${percentage})`;
            }
          }
        },
        legend: {
          display: false
        },
        aspectRatio: 2
      }
    };
  }

  private countOrders() {
    let result = 0;
    this.stats.orderStatusStatistics.forEach(s => (result += s.orderCount));
    return result;
  }
}
