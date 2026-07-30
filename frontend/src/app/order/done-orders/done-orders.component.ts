import { ChangeDetectionStrategy, Component, inject, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersComponent } from '../orders/orders.component';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { OrderListService, OrderListViewModel } from '../order-list.service';
import { TranslateDirective } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'rb-done-orders',
  templateUrl: './done-orders.component.html',
  styleUrl: './done-orders.component.scss',
  imports: [OrdersComponent, FormRoot, FormField, TranslateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoneOrdersComponent {
  private readonly router = inject(Router);

  readonly vm: Signal<OrderListViewModel | undefined>;

  readonly accessionHolderId = signal('');
  readonly form = form(this.accessionHolderId);

  constructor() {
    const route = inject(ActivatedRoute);
    const orderListService = inject(OrderListService);
    this.vm = toSignal(orderListService.setupDone(route, this.accessionHolderId));
  }

  filterByAccessionHolder() {
    const selectedAccessionHolderId = this.accessionHolderId();
    const parsedAccessionHolderId = selectedAccessionHolderId ? parseInt(selectedAccessionHolderId) : null;
    this.router.navigate([], { queryParams: { page: 0, h: parsedAccessionHolderId ?? undefined } });
  }
}
