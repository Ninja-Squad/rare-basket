import { Pipe, PipeTransform } from '@angular/core';
import { BaseEnumPipe } from './base-enum-pipe';
import { CustomerType } from '../basket/basket.model';

const customerTypeTranslations = new Map<CustomerType, string>([
  ['FARMER', 'Agriculteur'],
  ['BIOLOGIST', 'Biologiste']
]);

@Pipe({
  name: 'customerTypeEnum'
})
export class CustomerTypeEnumPipe extends BaseEnumPipe implements PipeTransform {
  constructor() {
    super(customerTypeTranslations);
  }
}
