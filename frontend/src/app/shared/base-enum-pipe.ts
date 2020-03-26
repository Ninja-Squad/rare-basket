import { PipeTransform } from '@angular/core';

export class BaseEnumPipe implements PipeTransform {

  constructor(private translations: Map<string, string>) { }

  transform(key: string): string {
    if (!key) {
      return '';
    }

    return this.translations.get(key) ?? `???${key}???`;
  }
}
