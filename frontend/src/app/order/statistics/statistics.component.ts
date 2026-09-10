import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, LOCALE_ID, signal } from '@angular/core';
import { OrderService } from '../order.service';
import { CustomerTypeStatistics, OrderStatusStatistics } from '../order.model';
import { ArcElement, Chart, ChartConfiguration, DoughnutController, Legend, Tooltip } from 'chart.js';
import { COLORS } from '../../chart/colors';
import { TranslateDirective, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DecimalPipe, formatDate, formatNumber, formatPercent, PercentPipe } from '@angular/common';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import { Params, Router } from '@angular/router';
import { Grc } from '../../shared/user.model';
import { AuthenticationService } from '../../shared/authentication.service';
import { GrcService } from '../../shared/grc.service';
import { catchError, first, map, of, tap } from 'rxjs';
import { OrderStatusEnumPipe } from '../order-status-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { ChartComponent } from '../../chart/chart/chart.component';
import { ValidationErrorDirective, ValidationSignalErrorsComponent } from 'ngx-valdemort';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { DatepickerContainerComponent } from '../../rb-ngb/datepicker-container.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { validSignalDateRange } from '../../shared/validators';

interface StatsParams {
  from: string;
  to: string;
  grcIds: Array<number>;
}

// Native radio values are strings; convert this back to a boolean when building stats params.
type GlobalSelection = 'true' | 'false';

interface StatisticsFormValue {
  from: string;
  to: string;
  global: GlobalSelection;
  grcs: Array<{ grc: Grc; selected: boolean }>;
}

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
  private readonly orderService = inject(OrderService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly grcService = inject(GrcService);
  private readonly translateService = inject(TranslateService);
  private readonly locale = inject(LOCALE_ID);

  readonly from = input<string>();
  readonly to = input<string>();
  readonly grcs = input<Array<string>, string | Array<string> | undefined>([], {
    transform: (value: string | Array<string> | undefined) => (!value ? [] : Array.isArray(value) ? value : [value])
  });

  readonly colors = COLORS;
  readonly perimeterEdited = signal(false);
  readonly refreshed = signal(false);

  readonly user = rxResource({
    stream: () =>
      this.authenticationService.getCurrentUser().pipe(
        first(),
        map(user => user!)
      )
  });
  readonly availableGrcs = rxResource({
    params: ({ chain }) => chain(this.user),
    stream: ({ params: user }) => (user.globalVisualization ? this.grcService.list() : of(user.visualizationGrcs))
  });
  private readonly formValue = linkedSignal(() => this.createFormValue());
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
  readonly statsParams = computed(() => {
    if (!this.user.hasValue() || !this.availableGrcs.hasValue()) {
      return undefined;
    }

    return this.createStatsParams(this.createFormValue());
  });
  readonly stats = rxResource({
    params: this.statsParams,
    stream: ({ params }) =>
      this.orderService.getStatistics(params.from, params.to, params.grcIds).pipe(
        tap(() => this.refreshed.set(true)),
        tap(stats => stats.customerTypeStatistics.sort((s1, s2) => s2.finalizedOrderCount - s1.finalizedOrderCount)),
        catchError(() => of(undefined))
      )
  });
  readonly perimeterModifiable = computed(() => {
    const grcs = this.availableGrcs.value();
    return !!grcs && grcs.length > 1;
  });
  readonly customerTypeDoughnut = computed(() => {
    const stats = this.stats.value();
    return stats ? this.createCustomerTypeDoughnutChart(stats.customerTypeStatistics) : undefined;
  });
  readonly orderStatusDoughnut = computed(() => {
    const stats = this.stats.value();
    return stats ? this.createOrderStatusDoughnutChart(stats.orderStatusStatistics) : undefined;
  });

  async refresh(): Promise<void> {
    if (this.form().invalid()) {
      return;
    }

    const formValue = this.formValue();
    const statsParams = this.createStatsParams(formValue);
    this.refreshed.set(false);
    this.perimeterEdited.set(false);
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
  }

  createdOrderCountRatio(stat: OrderStatusStatistics) {
    return stat.createdOrderCount / this.stats.value()!.createdOrderCount;
  }

  finalizedOrderCountRatio(stat: CustomerTypeStatistics) {
    return stat.finalizedOrderCount / this.stats.value()!.finalizedOrderCount;
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

  private createFormValue(): StatisticsFormValue {
    const user = this.user.value();
    const grcs = this.availableGrcs.value();
    if (!user || !grcs) {
      return { from: '', to: '', global: 'false', grcs: [] };
    }

    const now = new Date();
    const startOfYear = new Date();
    startOfYear.setDate(1);
    startOfYear.setMonth(0);
    const from = this.from() ?? formatDate(startOfYear, 'yyyy-MM-dd', this.locale);
    const to = this.to() ?? formatDate(now, 'yyyy-MM-dd', this.locale);
    const grcIds = this.grcs();
    const global: GlobalSelection = user.globalVisualization && grcIds.length === 0 ? 'true' : 'false';
    const formGrcs = grcs.map(grc => ({
      grc,
      selected: grcIds.length > 0 ? grcIds.includes(`${grc.id}`) : !user.globalVisualization
    }));

    return {
      from,
      to,
      global,
      grcs: formGrcs
    };
  }

  private createStatsParams(formValue: StatisticsFormValue): StatsParams {
    const grcIds = formValue.global === 'true' ? [] : formValue.grcs.filter(({ selected }) => selected).map(({ grc }) => grc.id);

    return {
      from: formValue.from,
      to: formValue.to,
      grcIds
    };
  }
}
