import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { OrderStatusEnumPipe } from '../order-status-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { PaginationComponent } from '../../rb-ngb/pagination/pagination.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgPlural, NgPluralCase } from '@angular/common';

@Component({
  selector: 'rb-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  imports: [
    RouterLink,
    NgPlural,
    NgPluralCase,
    TranslateModule,
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
