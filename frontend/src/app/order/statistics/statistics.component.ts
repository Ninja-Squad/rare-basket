import { Component, computed, inject, LOCALE_ID, signal, Signal } from '@angular/core';
import { OrderService } from '../order.service';
import { CustomerTypeStatistics, OrderStatistics, OrderStatusStatistics } from '../order.model';
import { ArcElement, Chart, ChartConfiguration, DoughnutController, Legend, Tooltip } from 'chart.js';
import { COLORS } from '../../chart/colors';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DecimalPipe, formatDate, formatNumber, formatPercent, PercentPipe } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { validDateRange } from '../../shared/validators';
import { Grc, User } from '../../shared/user.model';
import { AuthenticationService } from '../../shared/authentication.service';
import { GrcService } from '../../shared/grc.service';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';
import { concat, of, ReplaySubject } from 'rxjs';
import { OrderStatusEnumPipe } from '../order-status-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { ChartComponent } from '../../chart/chart/chart.component';
import { ValidationErrorDirective, ValidationErrorsComponent } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { DatepickerContainerComponent } from '../../rb-ngb/datepicker-container.component';
import { toSignal } from '@angular/core/rxjs-interop';

function atLeastOneSelection(control: AbstractControl): ValidationErrors | null {
  const value: Array<{ grc: Grc; selected: boolean }> = control.value;
  return value.some(item => item.selected) ? null : { required: true };
}

interface ViewModel {
  user: User;
  grcs: Array<Grc>;
}

interface StatsParams {
  from: string;
  to: string;
  grcIds: Array<number>;
}

@Component({
  selector: 'rb-statistics',
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    DatepickerContainerComponent,
    NgbInputDatepicker,
    FormControlValidationDirective,
    ValidationErrorsComponent,
    ValidationErrorDirective,
    ChartComponent,
    DecimalPipe,
    PercentPipe,
    CustomerTypeEnumPipe,
    OrderStatusEnumPipe
  ]
})
export class StatisticsComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private translateService = inject(TranslateService);

  private fb = inject(NonNullableFormBuilder);
  readonly grcsFormArray = this.fb.array<FormGroup<{ grc: FormControl<Grc>; selected: FormControl<boolean> }>>([], atLeastOneSelection);
  readonly form = this.fb.group(
    {
      from: [null as string | null, Validators.required],
      to: [null as string | null, Validators.required],
      global: null as boolean | null,
      grcs: this.grcsFormArray
    },
    { validators: validDateRange }
  );

  readonly vm: Signal<ViewModel | undefined>;
  readonly perimeterModifiable = computed(() => {
    const vm = this.vm();
    return !!vm && vm.grcs.length > 1;
  });

  readonly startParamsSubject = new ReplaySubject<StatsParams>(1);
  readonly stats: Signal<OrderStatistics | undefined>;
  readonly customerTypeDoughnut: Signal<ChartConfiguration<'doughnut'> | undefined>;
  readonly orderStatusDoughnut: Signal<ChartConfiguration<'doughnut'> | undefined>;

  readonly colors = COLORS;
  readonly perimeterEdited = signal(false);
  readonly refreshed = signal(false);

  private locale = inject(LOCALE_ID);

  constructor() {
    const authenticationService = inject(AuthenticationService);
    const grcService = inject(GrcService);

    this.vm = toSignal(
      authenticationService.getCurrentUser().pipe(
        first(),
        switchMap(user => {
          const u = user!;
          const grcs$ = u.globalVisualization ? grcService.list() : of(u.visualizationGrcs);
          return grcs$.pipe(map(grcs => ({ grcs, user: u })));
        }),
        tap(vm => {
          this.populateForm(vm);
          this.initializeForm(vm);
          this.refresh();
        })
      )
    );

    this.stats = toSignal(
      this.startParamsSubject.pipe(
        switchMap(statsParams =>
          this.orderService.getStatistics(statsParams.from, statsParams.to, statsParams.grcIds).pipe(
            tap(() => this.refreshed.set(true)),
            tap(stats => stats.customerTypeStatistics.sort((s1, s2) => s2.finalizedOrderCount - s1.finalizedOrderCount)),
            catchError(() => of(undefined))
          )
        )
      )
    );

    this.customerTypeDoughnut = computed(() => {
      const stats = this.stats();
      return stats ? this.createCustomerTypeDoughnutChart(stats.customerTypeStatistics) : undefined;
    });
    this.orderStatusDoughnut = computed(() => {
      const stats = this.stats();
      return stats ? this.createOrderStatusDoughnutChart(stats.orderStatusStatistics) : undefined;
    });
  }

  refresh() {
    if (!this.form.valid) {
      return;
    }

    this.refreshed.set(false);
    this.perimeterEdited.set(false);
    const formValue = this.form.value;
    const grcIds = formValue.global ? [] : formValue.grcs!.filter(({ selected }) => selected).map(({ grc }) => grc!.id);

    const statsParams: StatsParams = {
      from: formValue.from!,
      to: formValue.to!,
      grcIds: grcIds
    };
    const queryParams: Params = {
      from: statsParams.from,
      to: statsParams.to
    };
    if (statsParams.grcIds.length > 0) {
      queryParams.grcs = statsParams.grcIds;
    }

    this.router.navigate([], {
      queryParams,
      replaceUrl: true
    });

    this.startParamsSubject.next(statsParams);
  }

  createdOrderCountRatio(stat: OrderStatusStatistics) {
    return stat.createdOrderCount / this.stats()!.createdOrderCount;
  }

  finalizedOrderCountRatio(stat: CustomerTypeStatistics) {
    return stat.finalizedOrderCount / this.stats()!.finalizedOrderCount;
  }

  get constrainedPerimeterGrcs(): string {
    const formValue = this.form.value;
    return formValue
      .grcs!.filter(({ selected }) => selected)
      .map(({ grc }) => grc!.name)
      .join(', ');
  }

  private createCustomerTypeDoughnutChart(stats: Array<CustomerTypeStatistics>): ChartConfiguration<'doughnut'> {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

    const shortLabels: Array<string> = [];
    const data: Array<number> = [];
    const backgroundColor: Array<string> = [];

    stats.forEach((value, index) => {
      shortLabels.push(this.translateService.instant(`enums.short-customer-type.${value.customerType}`));
      data.push(value.finalizedOrderCount);
      backgroundColor.push(COLORS[index % COLORS.length]);
    });

    return {
      type: 'doughnut',
      data: { labels: shortLabels, datasets: [{ data, backgroundColor }] },
      options: {
        cutout: '70%',
        plugins: {
          tooltip: {
            callbacks: {
              label: tooltipItem => {
                const label = tooltipItem.label;
                const stat = stats[tooltipItem.dataIndex];
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

  private createOrderStatusDoughnutChart(stats: Array<OrderStatusStatistics>): ChartConfiguration<'doughnut'> {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

    const labels: Array<string> = [];
    const data: Array<number> = [];
    const backgroundColor: Array<string> = [];

    stats.forEach((value, index) => {
      labels.push(this.translateService.instant(`enums.order-status.${value.orderStatus}`));
      data.push(value.createdOrderCount);
      backgroundColor.push(COLORS[index % COLORS.length]);
    });

    return {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor }] },
      options: {
        cutout: '70%',
        plugins: {
          tooltip: {
            callbacks: {
              label: tooltipItem => {
                const label = tooltipItem.label;
                const stat = stats[tooltipItem.dataIndex];
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

  private populateForm(vm: ViewModel) {
    const now = new Date();
    const startOfYear = new Date();
    startOfYear.setDate(1);
    startOfYear.setMonth(0);

    vm.grcs.forEach(grc => {
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
      global: vm.user.globalVisualization
    });

    const globalControl = this.form.controls.global;
    concat(of(globalControl.value), globalControl.valueChanges).subscribe(global => {
      if (global) {
        this.grcsFormArray.disable();
      } else {
        this.grcsFormArray.enable();
      }
    });
  }

  private initializeForm(vm: ViewModel) {
    const newValue: {
      from?: string;
      to?: string;
      global?: boolean;
      grcs?: Array<{ grc: Grc; selected: boolean }>;
    } = {};
    const paramMap = this.route.snapshot.queryParamMap;
    const from = paramMap.get('from');
    if (from) {
      newValue.from = from;
    }
    const to = paramMap.get('to');
    if (to) {
      newValue.to = to;
    }
    if (vm.user.globalVisualization) {
      const grcIds = paramMap.getAll('grcs');
      if (grcIds.length > 0) {
        newValue.global = false;
        newValue.grcs = vm.grcs.map(grc => ({ grc, selected: grcIds.includes(`${grc.id}`) }));
      } else {
        newValue.global = true;
      }
    } else {
      newValue.global = false;
      const grcIds = paramMap.getAll('grcs');
      if (grcIds.length > 0) {
        newValue.grcs = vm.grcs.map(grc => ({ grc, selected: grcIds.includes(`${grc.id}`) }));
      } else {
        newValue.grcs = vm.grcs.map(grc => ({ grc, selected: true }));
      }
    }

    this.form.patchValue(newValue);
  }
}
