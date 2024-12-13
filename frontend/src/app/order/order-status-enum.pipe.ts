import { Pipe, PipeTransform } from '@angular/core';
import { BaseEnumPipe } from '../shared/base-enum-pipe';
import { OrderStatus } from './order.model';

@Pipe({
  name: 'orderStatusEnum'
})
export class OrderStatusEnumPipe extends BaseEnumPipe<OrderStatus> implements PipeTransform {
  constructor() {
    super('order-status');
  }
}
