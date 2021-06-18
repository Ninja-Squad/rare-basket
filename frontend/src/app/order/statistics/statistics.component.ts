import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { CustomerTypeStatistics, OrderStatistics, OrderStatusStatistics } from '../order.model';
import { ChartConfiguration } from 'chart.js';
import { COLORS } from '../../chart/colors';
import { TranslateService } from '@ngx-translate/core';
import { formatDate, formatNumber, formatPercent } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { validDateRange } from '../../shared/validators';
import { Grc, User } from '../../shared/user.model';
import { AuthenticationService } from '../../shared/authentication.service';
import { GrcService } from '../../shared/grc.service';
import { first, switchMap, tap } from 'rxjs/operators';
import { concat, of } from 'rxjs';

export interface FormValue {
  from: string;
  to: string;
  global: boolean;
  grcs: Array<{ grc: Grc; selected: boolean }>;
}

function atLeastOneSelection(control: AbstractControl): ValidationErrors | null {
  const value: Array<{ grc: Grc; selected: boolean }> = control.value;
  return value.some(item => item.selected) ? null : { required: true };
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
  user: User;
  perimeterEdited = false;
  refreshed = false;
  private choosableGrcs: Array<Grc>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private translateService: TranslateService,
    private authenticationService: AuthenticationService,
    private grcService: GrcService,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  ngOnInit() {
    this.authenticationService
      .getCurrentUser()
      .pipe(
        first(),
        tap(user => (this.user = user)),
        switchMap(user => (user.globalVisualization ? this.grcService.list() : of(user.visualizationGrcs)))
      )
      .subscribe(grcs => {
        this.choosableGrcs = grcs;
        this.form = this.createForm();
        this.initializeForm();
        this.refresh();
      });
  }

  refresh() {
    if (this.form.invalid) {
      return;
    }

    this.refreshed = false;
    this.perimeterEdited = false;
    const formValue: FormValue = this.form.value;
    const grcIds = formValue.global ? [] : formValue.grcs.filter(({ selected }) => selected).map(({ grc }) => grc.id);

    const queryParams: Params = {
      from: formValue.from,
      to: formValue.to
    };
    if (!formValue.global) {
      queryParams.grcs = grcIds;
    }
    this.router.navigate(['.'], {
      queryParams,
      relativeTo: this.route,
      replaceUrl: true
    });

    this.orderService.getStatistics(formValue.from, formValue.to, grcIds).subscribe(stats => {
      this.stats = stats;
      this.stats.customerTypeStatistics.sort((s1, s2) => s2.finalizedOrderCount - s1.finalizedOrderCount);
      this.createCharts();
      this.refreshed = true;
    });
  }

  createdOrderCountRatio(stat: OrderStatusStatistics) {
    return stat.createdOrderCount / this.stats.createdOrderCount;
  }

  finalizedOrderCountRatio(stat: CustomerTypeStatistics) {
    return stat.finalizedOrderCount / this.stats.finalizedOrderCount;
  }

  get grcs(): FormArray {
    return this.form.get('grcs') as FormArray;
  }

  get constrainedPerimeterGrcs(): string {
    const formValue: FormValue = this.form.value;
    return formValue.grcs
      .filter(({ selected }) => selected)
      .map(({ grc }) => grc.name)
      .join(', ');
  }

  get perimeterModifiable() {
    return this.choosableGrcs.length > 1;
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
            label: tooltipItem => {
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
            label: tooltipItem => {
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

  private createForm(): FormGroup {
    const now = new Date();
    const startOfYear = new Date();
    startOfYear.setDate(1);
    startOfYear.setMonth(0);

    const grcsFormArray = this.fb.array([], atLeastOneSelection);
    this.choosableGrcs.forEach(grc => {
      grcsFormArray.push(
        this.fb.group({
          grc,
          selected: false
        })
      );
    });

    const globalControl = this.fb.control(this.user.globalVisualization);

    const result = this.fb.group(
      {
        from: [formatDate(startOfYear, 'yyyy-MM-dd', this.locale), Validators.required],
        to: [formatDate(now, 'yyyy-MM-dd', this.locale), Validators.required],
        global: globalControl,
        grcs: grcsFormArray
      },
      { validators: validDateRange }
    );

    concat(of(globalControl.value), globalControl.valueChanges).subscribe(global => {
      if (global) {
        grcsFormArray.disable();
      } else {
        grcsFormArray.enable();
      }
    });

    return result;
  }

  private initializeForm() {
    const newValue: Partial<FormValue> = {};
    const paramMap = this.route.snapshot.queryParamMap;
    if (paramMap.get('from')) {
      newValue.from = paramMap.get('from');
    }
    if (paramMap.get('to')) {
      newValue.to = paramMap.get('to');
    }
    if (this.user.globalVisualization) {
      const grcIds = paramMap.getAll('grcs');
      if (grcIds.length > 0) {
        newValue.global = false;
        newValue.grcs = this.choosableGrcs.map(grc => ({ grc, selected: grcIds.includes(`${grc.id}`) }));
      } else {
        newValue.global = true;
      }
    } else {
      newValue.global = false;
      const grcIds = paramMap.getAll('grcs');
      if (grcIds.length > 0) {
        newValue.grcs = this.choosableGrcs.map(grc => ({ grc, selected: grcIds.includes(`${grc.id}`) }));
      } else {
        newValue.grcs = this.choosableGrcs.map(grc => ({ grc, selected: true }));
      }
    }

    this.form.patchValue(newValue);
  }
}
