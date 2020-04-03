import { PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export class BaseEnumPipe<E> implements PipeTransform {
  constructor(private translateService: TranslateService, private enumName: string) {}

  transform(value: E) {
    return value ? this.translateService.instant(`enums.${this.enumName}.${value}`) : '';
  }
}
