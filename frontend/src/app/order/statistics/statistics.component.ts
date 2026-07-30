import { ChangeDetectionStrategy, Component, computed, inject, LOCALE_ID, signal } from '@angular/core';
import { OrderService } from '../order.service';
import { CustomerTypeStatistics, OrderStatusStatistics } from '../order.model';
import { ArcElement, Chart, ChartConfiguration, DoughnutController, Legend, Tooltip } from 'chart.js';
import { COLORS } from '../../chart/colors';
import { TranslateDirective, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DecimalPipe, formatDate, formatNumber, formatPercent, PercentPipe } from '@angular/common';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Grc, User } from '../../shared/user.model';
import { AuthenticationService } from '../../shared/authentication.service';
import { GrcService } from '../../shared/grc.service';
import { catchError, first, map, of, ReplaySubject, switchMap, tap } from 'rxjs';
import { OrderStatusEnumPipe } from '../order-status-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { ChartComponent } from '../../chart/chart/chart.component';
import { ValidationErrorDirective, ValidationSignalErrorsComponent } from 'ngx-valdemort';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { DatepickerContainerComponent } from '../../rb-ngb/datepicker-container.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { validSignalDateRange } from '../../shared/validators';

interface ViewModel {
  user: User;
  grcs: Array<Grc>;
}

interface StatsParams {
  from: string;
  to: string;
  grcIds: Array<number>;
}

// Native radio values are strings; convert this back to a boolean when building stats params.
type GlobalSelection = 'true' | 'false';

@Component({
  selector: 'rb-statistics',
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
  imports: [
    FormRoot,
    FormField,
    TranslateDirective,
    TranslatePipe,
    DatepickerContainerComponent,
    NgbInputDatepicker,
    ValidationSignalErrorsComponent,
    ValidationErrorDirective,
    ChartComponent,
    DecimalPipe,
    PercentPipe,
    CustomerTypeEnumPipe,
    OrderStatusEnumPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticsComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly grcService = inject(GrcService);
  private readonly translateService = inject(TranslateService);

  readonly formValue = signal({
    from: '',
    to: '',
    global: 'false' as GlobalSelection,
    grcs: [] as Array<{ grc: Grc; selected: boolean }>
  });
  readonly form = form(
    this.formValue,
    f => {
      required(f.from);
      required(f.to);
      validSignalDateRange(f);
      validate(f.grcs, ({ value }) =>
        this.formValue().global === 'true' || value().some(item => item.selected) ? undefined : { kind: 'required' }
      );
    },
    {
      submission: {
        action: async () => {
          await this.refresh();
          return undefined;
        }
      }
    }
  );

  readonly colors = COLORS;
  readonly perimeterEdited = signal(false);
  readonly refreshed = signal(false);

  private readonly locale = inject(LOCALE_ID);

  readonly startParamsSubject = new ReplaySubject<StatsParams>(1);
  readonly stats = toSignal(
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
  readonly vm = toSignal(
    inject(AuthenticationService)
      .getCurrentUser()
      .pipe(
        first(),
        switchMap(user => {
          const u = user!;
          const grcs$ = u.globalVisualization ? this.grcService.list() : of(u.visualizationGrcs);
          return grcs$.pipe(map(grcs => ({ grcs, user: u })));
        }),
        tap(vm => {
          this.populateForm(vm);
          this.initializeForm(vm);
          void this.refresh();
        })
      )
  );
  readonly perimeterModifiable = computed(() => {
    const vm = this.vm();
    return !!vm && vm.grcs.length > 1;
  });
  readonly customerTypeDoughnut = computed(() => {
    const stats = this.stats();
    return stats ? this.createCustomerTypeDoughnutChart(stats.customerTypeStatistics) : undefined;
  });
  readonly orderStatusDoughnut = computed(() => {
    const stats = this.stats();
    return stats ? this.createOrderStatusDoughnutChart(stats.orderStatusStatistics) : undefined;
  });

  async refresh(): Promise<void> {
    if (this.form().invalid()) {
      return;
    }

    this.refreshed.set(false);
    this.perimeterEdited.set(false);
    const formValue = this.formValue();
    const grcIds = formValue.global === 'true' ? [] : formValue.grcs.filter(({ selected }) => selected).map(({ grc }) => grc.id);

    const statsParams: StatsParams = {
      from: formValue.from,
      to: formValue.to,
      grcIds: grcIds
    };
    const queryParams: Params = {
      from: statsParams.from,
      to: statsParams.to
    };
    if (statsParams.grcIds.length > 0) {
      queryParams['grcs'] = statsParams.grcIds;
    }

    await this.router.navigate([], {
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
    const formValue = this.formValue();
    return formValue.grcs
      .filter(({ selected }) => selected)
      .map(({ grc }) => grc.name)
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

    this.formValue.update(value => ({
      ...value,
      from: formatDate(startOfYear, 'yyyy-MM-dd', this.locale),
      to: formatDate(now, 'yyyy-MM-dd', this.locale),
      global: vm.user.globalVisualization ? 'true' : 'false',
      grcs: vm.grcs.map(grc => ({ grc, selected: false }))
    }));
  }

  private initializeForm(vm: ViewModel) {
    const newValue: {
      from?: string;
      to?: string;
      global?: GlobalSelection;
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
        newValue.global = 'false';
        newValue.grcs = vm.grcs.map(grc => ({ grc, selected: grcIds.includes(`${grc.id}`) }));
      } else {
        newValue.global = 'true';
      }
    } else {
      newValue.global = 'false';
      const grcIds = paramMap.getAll('grcs');
      if (grcIds.length > 0) {
        newValue.grcs = vm.grcs.map(grc => ({ grc, selected: grcIds.includes(`${grc.id}`) }));
      } else {
        newValue.grcs = vm.grcs.map(grc => ({ grc, selected: true }));
      }
    }

    this.formValue.update(value => ({ ...value, ...newValue }));
  }
}
