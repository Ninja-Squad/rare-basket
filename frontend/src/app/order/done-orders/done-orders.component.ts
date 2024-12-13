import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrdersComponent } from '../orders/orders.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OrderListService, OrderListViewModel } from '../order-list.service';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'rb-done-orders',
  templateUrl: './done-orders.component.html',
  styleUrl: './done-orders.component.scss',
  imports: [OrdersComponent, ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoneOrdersComponent {
  readonly vm: Signal<OrderListViewModel | undefined>;

  readonly accessionHolderIdCtrl = new FormControl<number | null>(null);

  constructor() {
    const route = inject(ActivatedRoute);
    const orderListService = inject(OrderListService);
    this.vm = toSignal(orderListService.setupDone(route, this.accessionHolderIdCtrl));
  }
}
