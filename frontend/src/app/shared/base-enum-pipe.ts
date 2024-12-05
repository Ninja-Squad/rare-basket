import { inject, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export class BaseEnumPipe<E> implements PipeTransform {
  private translateService = inject(TranslateService);

  constructor(private enumName: string) {}

  transform(value: E | null) {
    return value ? this.translateService.instant(`enums.${this.enumName}.${value}`) : '';
  }
}
