import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { map, switchMap } from 'rxjs/operators';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { OrdersComponent } from '../orders/orders.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'rb-done-orders',
  templateUrl: './done-orders.component.html',
  styleUrls: ['./done-orders.component.scss'],
  standalone: true,
  imports: [NgIf, OrdersComponent]
})
export class DoneOrdersComponent implements OnInit {
  orders: Page<Order>;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.route.queryParamMap
      .pipe(
        map(params => +(params.get('page') || 0)),
        switchMap(page => this.orderService.listDone(page))
      )
      .subscribe(orders => (this.orders = orders));
  }
}
