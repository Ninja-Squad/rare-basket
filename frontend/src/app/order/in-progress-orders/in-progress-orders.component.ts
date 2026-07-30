import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { faPlus, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { OrdersComponent } from '../orders/orders.component';
import { TranslateDirective } from '@ngx-translate/core';
import { form, FormField } from '@angular/forms/signals';
import { OrderListService } from '../order-list.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'rb-in-progress-orders',
  templateUrl: './in-progress-orders.component.html',
  styleUrl: './in-progress-orders.component.scss',
  imports: [TranslateDirective, OrdersComponent, FaIconComponent, RouterLink, DecimalPipe, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InProgressOrdersComponent {
  private readonly orderListService = inject(OrderListService);

  readonly noOrderIcon = faThumbsUp;
  readonly createOrderIcon = faPlus;

  readonly accessionHolderId = signal('');
  readonly form = form(this.accessionHolderId);
  readonly vm = toSignal(this.orderListService.setupInProgress(this.accessionHolderId));

  filterByAccessionHolder() {
    this.orderListService.filterByAccessionHolder(this.accessionHolderId);
  }
}
