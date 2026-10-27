import { Pipe, PipeTransform } from '@angular/core';
import { CustomerType } from '../basket/basket.model';
import { BaseEnumPipe } from './base-enum-pipe';

@Pipe({
  name: 'customerTypeEnum'
})
export class CustomerTypeEnumPipe extends BaseEnumPipe<CustomerType> implements PipeTransform {
  constructor() {
    super('customer-type');
  }
}
