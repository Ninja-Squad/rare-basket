import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { OrdersComponent } from '../orders/orders.component';
import { form, FormField } from '@angular/forms/signals';
import { OrderListService } from '../order-list.service';
import { TranslateDirective } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'rb-done-orders',
  templateUrl: './done-orders.component.html',
  styleUrl: './done-orders.component.scss',
  imports: [OrdersComponent, FormField, TranslateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoneOrdersComponent {
  private readonly orderListService = inject(OrderListService);

  readonly accessionHolderId = signal('');
  readonly form = form(this.accessionHolderId);
  readonly vm = toSignal(this.orderListService.setupDone(this.accessionHolderId));

  filterByAccessionHolder() {
    this.orderListService.filterByAccessionHolder(this.accessionHolderId);
  }
}
