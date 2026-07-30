import { ChangeDetectionStrategy, Component, inject, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { faPlus, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { OrdersComponent } from '../orders/orders.component';
import { TranslateDirective } from '@ngx-translate/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { OrderListService, OrderListViewModel } from '../order-list.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'rb-in-progress-orders',
  templateUrl: './in-progress-orders.component.html',
  styleUrl: './in-progress-orders.component.scss',
  imports: [TranslateDirective, OrdersComponent, FaIconComponent, RouterLink, DecimalPipe, FormRoot, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InProgressOrdersComponent {
  private readonly router = inject(Router);

  readonly vm: Signal<OrderListViewModel | undefined>;

  readonly noOrderIcon = faThumbsUp;
  readonly createOrderIcon = faPlus;

  readonly accessionHolderId = signal('');
  readonly form = form(this.accessionHolderId);

  constructor() {
    const route = inject(ActivatedRoute);
    const orderListService = inject(OrderListService);
    this.vm = toSignal(orderListService.setupInProgress(route, this.accessionHolderId));
  }

  filterByAccessionHolder() {
    const selectedAccessionHolderId = this.accessionHolderId();
    const parsedAccessionHolderId = selectedAccessionHolderId ? parseInt(selectedAccessionHolderId) : null;
    this.router.navigate([], { queryParams: { page: 0, h: parsedAccessionHolderId ?? undefined } });
  }
}
