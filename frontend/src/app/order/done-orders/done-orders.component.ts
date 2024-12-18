import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrdersComponent } from '../orders/orders.component';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OrderListService, OrderListViewModel } from '../order-list.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-done-orders',
  templateUrl: './done-orders.component.html',
  styleUrl: './done-orders.component.scss',
  imports: [OrdersComponent, ReactiveFormsModule, TranslateModule, AsyncPipe]
})
export class DoneOrdersComponent {
  vm$: Observable<OrderListViewModel>;

  accessionHolderIdCtrl = new FormControl<number | null>(null);

  constructor() {
    const route = inject(ActivatedRoute);
    const orderListService = inject(OrderListService);
    this.vm$ = orderListService.setupDone(route, this.accessionHolderIdCtrl);
  }
}
