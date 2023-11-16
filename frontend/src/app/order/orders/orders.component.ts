import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { OrderStatusEnumPipe } from '../order-status-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { PaginationComponent } from '../../rb-ngb/pagination/pagination.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgFor, NgIf, NgPlural, NgPluralCase } from '@angular/common';

@Component({
  selector: 'rb-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgFor,
    RouterLink,
    NgPlural,
    NgPluralCase,
    TranslateModule,
    NgIf,
    PaginationComponent,
    DecimalPipe,
    DatePipe,
    CustomerTypeEnumPipe,
    OrderStatusEnumPipe
  ]
})
export class OrdersComponent {
  @Input()
  orders: Page<Order>;
}
