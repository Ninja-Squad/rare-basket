import { Pipe, PipeTransform } from '@angular/core';
import { BaseEnumPipe } from '../shared/base-enum-pipe';
import { OrderStatus } from './order.model';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'orderStatusEnum',
  standalone: true
})
export class OrderStatusEnumPipe extends BaseEnumPipe<OrderStatus> implements PipeTransform {
  constructor(translateService: TranslateService) {
    super(translateService, 'order-status');
  }
}
