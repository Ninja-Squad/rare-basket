import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { faPlus, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrdersComponent } from '../orders/orders.component';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OrderListService, OrderListViewModel } from '../order-list.service';

@Component({
  selector: 'rb-in-progress-orders',
  templateUrl: './in-progress-orders.component.html',
  styleUrls: ['./in-progress-orders.component.scss'],
  standalone: true,
  imports: [NgIf, TranslateModule, OrdersComponent, FontAwesomeModule, RouterLink, DecimalPipe, AsyncPipe, ReactiveFormsModule, NgFor]
})
export class InProgressOrdersComponent {
  vm$: Observable<OrderListViewModel>;

  noOrderIcon = faThumbsUp;
  createOrderIcon = faPlus;

  accessionHolderIdCtrl = new FormControl<number | null>(null);

  constructor(route: ActivatedRoute, orderListService: OrderListService) {
    this.vm$ = orderListService.setupInProgress(route, this.accessionHolderIdCtrl);
  }
}
