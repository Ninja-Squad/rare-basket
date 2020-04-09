import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { Order, OrderCommand } from '../order.model';
import { faAddressCard, faAt, faChevronLeft, faCommentDots, faEdit, faHome, faMicrophone, faUser } from '@fortawesome/free-solid-svg-icons';
import { switchMap } from 'rxjs/operators';

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
  languageIcon = faMicrophone;
  rationaleIcon = faCommentDots;
  editIcon = faEdit;
  allOrdersIcon = faChevronLeft;

  edited = false;

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    const orderId = +this.route.snapshot.paramMap.get('orderId');
    this.orderService.get(orderId).subscribe(order => (this.order = order));
  }

  edit() {
    this.edited = true;
  }

  editCancelled() {
    this.edited = false;
  }

  saved(command: OrderCommand) {
    this.orderService
      .update(this.order.id, command)
      .pipe(switchMap(() => this.orderService.get(this.order.id)))
      .subscribe(order => {
        this.edited = false;
        this.order = order;
      });
  }
}
