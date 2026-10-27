import { Pipe, PipeTransform } from '@angular/core';
import { Language } from '../basket/basket.model';
import { BaseEnumPipe } from './base-enum-pipe';

@Pipe({
  name: 'languageEnum'
})
export class LanguageEnumPipe extends BaseEnumPipe<Language> implements PipeTransform {
  constructor() {
    super('language');
  }
}
