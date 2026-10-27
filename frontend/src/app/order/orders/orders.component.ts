import { DatePipe, DecimalPipe, NgPlural, NgPluralCase } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@ngx-translate/core';
import { PaginationComponent } from '../../rb-ngb/pagination/pagination.component';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { Page } from '../../shared/page.model';
import { OrderStatusEnumPipe } from '../order-status-enum.pipe';
import { Order } from '../order.model';

@Component({
  selector: 'rb-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  imports: [
    RouterLink,
    NgPlural,
    NgPluralCase,
    TranslateDirective,
    PaginationComponent,
    DecimalPipe,
    DatePipe,
    CustomerTypeEnumPipe,
    OrderStatusEnumPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent {
  readonly orders = input.required<Page<Order>>();
}
