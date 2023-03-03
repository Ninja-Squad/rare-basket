import { Pipe, PipeTransform } from '@angular/core';
import { BaseEnumPipe } from './base-enum-pipe';
import { CustomerType } from '../basket/basket.model';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'customerTypeEnum',
  standalone: true
})
export class CustomerTypeEnumPipe extends BaseEnumPipe<CustomerType> implements PipeTransform {
  constructor(translateService: TranslateService) {
    super(translateService, 'customer-type');
  }
}
