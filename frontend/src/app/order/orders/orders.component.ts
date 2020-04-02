import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';

@Component({
  selector: 'rb-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent {
  @Input()
  orders: Page<Order>;
}
