import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../order.service';
import { map, switchMap } from 'rxjs/operators';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { faPlus, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrdersComponent } from '../orders/orders.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, DecimalPipe } from '@angular/common';

@Component({
  selector: 'rb-in-progress-orders',
  templateUrl: './in-progress-orders.component.html',
  styleUrls: ['./in-progress-orders.component.scss'],
  standalone: true,
  imports: [NgIf, TranslateModule, OrdersComponent, FontAwesomeModule, RouterLink, DecimalPipe]
})
export class InProgressOrdersComponent implements OnInit {
  orders: Page<Order>;

  noOrderIcon = faThumbsUp;
  createOrderIcon = faPlus;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.route.queryParamMap
      .pipe(
        map(params => +(params.get('page') || 0)),
        switchMap(page => this.orderService.listInProgress(page))
      )
      .subscribe(orders => (this.orders = orders));
  }
}
