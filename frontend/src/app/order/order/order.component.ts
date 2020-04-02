import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { Order } from '../order.model';
import { faAddressCard, faAt, faChevronLeft, faCommentDots, faHome, faUser } from '@fortawesome/free-solid-svg-icons';

/**
 * Component displaying the details of an order to a GRC user
 */
@Component({
  selector: 'rb-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  order: Order;

  nameIcon = faUser;
  emailIcon = faAt;
  addressIcon = faHome;
  customerTypeIcon = faAddressCard;
  rationaleIcon = faCommentDots;
  allOrdersIcon = faChevronLeft;

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    const orderId = +this.route.snapshot.paramMap.get('orderId');
    this.orderService.get(orderId).subscribe(order => (this.order = order));
  }
}
