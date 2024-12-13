import { Pipe, PipeTransform } from '@angular/core';
import { BaseEnumPipe } from './base-enum-pipe';
import { CustomerType } from '../basket/basket.model';

@Pipe({
  name: 'customerTypeEnum'
})
export class CustomerTypeEnumPipe extends BaseEnumPipe<CustomerType> implements PipeTransform {
  constructor() {
    super('customer-type');
  }
}
