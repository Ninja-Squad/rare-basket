import { Component } from '@angular/core';
import { CustomerInformationCommand } from '../order.model';
import { OrderService } from '../order.service';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'rb-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent {
  constructor(private orderService: OrderService, private router: Router, private toastService: ToastService) {}

  save(command: CustomerInformationCommand) {
    this.orderService.createOrder(command).subscribe(order => {
      this.router.navigate(['/orders', order.id], { replaceUrl: true });
      this.toastService.success('order.create-order.created');
    });
  }

  cancel() {
    this.router.navigate(['/orders', 'in-progress']);
  }
}
