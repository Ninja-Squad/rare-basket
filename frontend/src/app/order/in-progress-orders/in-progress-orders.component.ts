import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { faPlus, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { OrdersComponent } from '../orders/orders.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OrderListService, OrderListViewModel } from '../order-list.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'rb-in-progress-orders',
  templateUrl: './in-progress-orders.component.html',
  styleUrl: './in-progress-orders.component.scss',
  imports: [TranslateModule, OrdersComponent, FaIconComponent, RouterLink, DecimalPipe, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InProgressOrdersComponent {
  readonly vm: Signal<OrderListViewModel | undefined>;

  readonly noOrderIcon = faThumbsUp;
  readonly createOrderIcon = faPlus;

  readonly accessionHolderIdCtrl = new FormControl<number | null>(null);

  constructor() {
    const route = inject(ActivatedRoute);
    const orderListService = inject(OrderListService);
    this.vm = toSignal(orderListService.setupInProgress(route, this.accessionHolderIdCtrl));
  }
}
