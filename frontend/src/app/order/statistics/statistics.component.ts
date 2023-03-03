import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { CustomerTypeStatistics, OrderStatistics, OrderStatusStatistics } from '../order.model';
import { ArcElement, Chart, ChartConfiguration, DoughnutController, Legend, Tooltip } from 'chart.js';
import { COLORS } from '../../chart/colors';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { formatDate, formatNumber, formatPercent, NgIf, NgFor, DecimalPipe, PercentPipe } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { validDateRange } from '../../shared/validators';
import { Grc, User } from '../../shared/user.model';
import { AuthenticationService } from '../../shared/authentication.service';
import { GrcService } from '../../shared/grc.service';
import { first, map, switchMap } from 'rxjs/operators';
import { concat, of } from 'rxjs';
import { OrderStatusEnumPipe } from '../order-status-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { ChartComponent } from '../../chart/chart/chart.component';
import { ValidationErrorsComponent, ValidationErrorDirective } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { DatepickerContainerComponent } from '../../rb-ngb/datepicker-container.component';

function atLeastOneSelection(control: AbstractControl): ValidationErrors | null {
  const value: Array<{ grc: Grc; selected: boolean }> = control.value;
  return value.some(item => item.selected) ? null : { required: true };
}

@Component({
  selector: 'rb-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    TranslateModule,
    DatepickerContainerComponent,
    NgbInputDatepicker,
    FormControlValidationDirective,
    ValidationErrorsComponent,
    NgFor,
    ValidationErrorDirective,
    ChartComponent,
    DecimalPipe,
    PercentPipe,
    CustomerTypeEnumPipe,
    OrderStatusEnumPipe
  ]
})
export class StatisticsComponent implements OnInit {
  grcsFormArray = this.fb.array<FormGroup<{ grc: FormControl<Grc>; selected: FormControl<boolean> }>>([], atLeastOneSelection);
  form = this.fb.group(
    {
      from: [null as string, Validators.required],
      to: [null as string, Validators.required],
      global: null as boolean,
      grcs: this.grcsFormArray
    },
    { validators: validDateRange }
  );

  stats: OrderStatistics;
  customerTypeDoughnut: ChartConfiguration<'doughnut'>;
  orderStatusDoughnut: ChartConfiguration<'doughnut'>;
  colors = COLORS;
  user: User;
  perimeterEdited = false;
  refreshed = false;
  private choosableGrcs: Array<Grc>;

  constructor(
    private fb: NonNullableFormBuilder,
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
        switchMap(user => {
          const grcs$ = user.globalVisualization ? this.grcService.list() : of(user.visualizationGrcs);
          return grcs$.pipe(map(grcs => ({ grcs, user })));
        })
      )
      .subscribe(({ grcs, user }) => {
        this.user = user;
        this.choosableGrcs = grcs;
        this.populateForm();
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
    const formValue = this.form.value;
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

  get constrainedPerimeterGrcs(): string {
    const formValue = this.form.value;
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
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

    const shortLabels: Array<string> = [];
    const data: Array<number> = [];
    const backgroundColor: Array<string> = [];

    this.stats.customerTypeStatistics.forEach((value, index) => {
      shortLabels.push(this.translateService.instant(`enums.short-customer-type.${value.customerType}`));
      data.push(value.finalizedOrderCount);
      backgroundColor.push(COLORS[index % COLORS.length]);
    });

    this.customerTypeDoughnut = {
      type: 'doughnut',
      data: { labels: shortLabels, datasets: [{ data, backgroundColor }] },
      options: {
        cutout: '70%',
        plugins: {
          tooltip: {
            callbacks: {
              label: tooltipItem => {
                const label = tooltipItem.label;
                const stat = this.stats.customerTypeStatistics[tooltipItem.dataIndex];
                const count = formatNumber(stat.finalizedOrderCount, this.locale);
                const percentage = formatPercent(this.finalizedOrderCountRatio(stat), this.locale, '.0-0');
                return `${label}: ${count} (${percentage})`;
              }
            }
          },
          legend: {
            display: false
          }
        },
        aspectRatio: 2
      }
    };
  }

  private createOrderStatusDoughnutChart() {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

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
        cutout: '70%',
        plugins: {
          tooltip: {
            callbacks: {
              label: tooltipItem => {
                const label = tooltipItem.label;
                const stat = this.stats.orderStatusStatistics[tooltipItem.dataIndex];
                const orderCount = formatNumber(stat.createdOrderCount, this.locale);
                const percentage = formatPercent(this.createdOrderCountRatio(stat), this.locale, '.0-0');
                return `${label}: ${orderCount} (${percentage})`;
              }
            }
          },
          legend: {
            display: false
          }
        },
        aspectRatio: 2
      }
    };
  }

  private populateForm() {
    const now = new Date();
    const startOfYear = new Date();
    startOfYear.setDate(1);
    startOfYear.setMonth(0);

    this.choosableGrcs.forEach(grc => {
      this.grcsFormArray.push(
        this.fb.group({
          grc,
          selected: false as boolean
        })
      );
    });
    this.form.patchValue({
      from: formatDate(startOfYear, 'yyyy-MM-dd', this.locale),
      to: formatDate(now, 'yyyy-MM-dd', this.locale),
      global: this.user.globalVisualization
    });

    const globalControl = this.form.get('global');
    concat(of(globalControl.value), globalControl.valueChanges).subscribe(global => {
      if (global) {
        this.grcsFormArray.disable();
      } else {
        this.grcsFormArray.enable();
      }
    });
  }

  private initializeForm() {
    const newValue: {
      from?: string;
      to?: string;
      global?: boolean;
      grcs?: Array<{ grc: Grc; selected: boolean }>;
    } = {};
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
