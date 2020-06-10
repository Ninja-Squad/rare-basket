import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { map, switchMap } from 'rxjs/operators';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { faPlus, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'rb-in-progress-orders',
  templateUrl: './in-progress-orders.component.html',
  styleUrls: ['./in-progress-orders.component.scss']
})
export class InProgressOrdersComponent implements OnInit {
  orders: Page<Order>;

  noOrderIcon = faThumbsUp;
  createOrderIcon = faPlus;

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit() {
    this.route.queryParamMap
      .pipe(
        map(params => +(params.get('page') || 0)),
        switchMap(page => this.orderService.listInProgress(page))
      )
      .subscribe(orders => (this.orders = orders));
  }
}
