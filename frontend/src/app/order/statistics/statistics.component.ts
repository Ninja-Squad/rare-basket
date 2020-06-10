import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { CustomerTypeStatistics, OrderStatistics, OrderStatusStatistics } from '../order.model';
import { ChartConfiguration } from 'chart.js';
import { COLORS } from '../../chart/colors';
import { TranslateService } from '@ngx-translate/core';
import { formatDate, formatNumber, formatPercent } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { validDateRange } from '../../shared/validators';

export interface FormValue {
  from: string;
  to: string;
}

@Component({
  selector: 'rb-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  form: FormGroup;

  stats: OrderStatistics;
  customerTypeDoughnut: ChartConfiguration;
  orderStatusDoughnut: ChartConfiguration;
  colors = COLORS;

  constructor(
    fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private translateService: TranslateService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    const now = new Date();
    const startOfYear = new Date();
    startOfYear.setDate(1);
    startOfYear.setMonth(0);

    this.form = fb.group(
      {
        from: [formatDate(startOfYear, 'yyyy-MM-dd', locale), Validators.required],
        to: [formatDate(now, 'yyyy-MM-dd', locale), Validators.required]
      },
      { validators: validDateRange }
    );
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(paramMap => {
      if (paramMap.get('from')) {
        this.form.patchValue({ from: paramMap.get('from') });
      }
      if (paramMap.get('to')) {
        this.form.patchValue({ to: paramMap.get('to') });
      }
    });

    this.refresh();
  }

  refresh() {
    if (this.form.invalid) {
      return;
    }

    const formValue: FormValue = this.form.value;
    this.router.navigate(['.'], {
      queryParams: { from: formValue.from, to: formValue.to },
      relativeTo: this.route,
      replaceUrl: true
    });
    this.orderService.getStatistics(formValue.from, formValue.to).subscribe(stats => {
      this.stats = stats;
      this.stats.customerTypeStatistics.sort((s1, s2) => s2.finalizedOrderCount - s1.finalizedOrderCount);
      this.createCharts();
    });
  }

  createdOrderCountRatio(stat: OrderStatusStatistics) {
    return stat.createdOrderCount / this.stats.createdOrderCount;
  }

  finalizedOrderCountRatio(stat: CustomerTypeStatistics) {
    return stat.finalizedOrderCount / this.stats.finalizedOrderCount;
  }

  private createCharts() {
    this.createCustomerTypeDoughnutChart();
    this.createOrderStatusDoughnutChart();
  }

  private createCustomerTypeDoughnutChart() {
    const shortLabels: Array<string> = [];
    const labels: Array<string> = [];
    const data: Array<number> = [];
    const backgroundColor: Array<string> = [];

    this.stats.customerTypeStatistics.forEach((value, index) => {
      labels.push(this.translateService.instant(`enums.customer-type.${value.customerType}`));
      shortLabels.push(this.translateService.instant(`enums.short-customer-type.${value.customerType}`));
      data.push(value.finalizedOrderCount);
      backgroundColor.push(COLORS[index % COLORS.length]);
    });

    this.customerTypeDoughnut = {
      type: 'doughnut',
      data: { labels: shortLabels, datasets: [{ data, backgroundColor }] },
      options: {
        cutoutPercentage: 70,
        tooltips: {
          callbacks: {
            label: (tooltipItem, chart) => {
              const label = labels[tooltipItem.index];
              const stat = this.stats.customerTypeStatistics[tooltipItem.index];
              const count = formatNumber(stat.finalizedOrderCount, this.locale);
              const percentage = formatPercent(this.finalizedOrderCountRatio(stat), this.locale, '.0-0');
              return `${label}: ${count} (${percentage})`;
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

  private createOrderStatusDoughnutChart() {
    const labels: Array<string> = [];
    const data: Array<number> = [];
    const backgroundColor: Array<string> = [];

    this.stats.orderStatusStatistics.forEach((value, index) => {
      labels.push(this.translateService.instant(`enums.order-status.${value.orderStatus}`));
      data.push(value.createdOrderCount);
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
              const orderCount = formatNumber(stat.createdOrderCount, this.locale);
              const percentage = formatPercent(this.createdOrderCountRatio(stat), this.locale, '.0-0');
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
}
