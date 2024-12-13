import { Pipe, PipeTransform } from '@angular/core';
import { BaseEnumPipe } from './base-enum-pipe';
import { Language } from '../basket/basket.model';

@Pipe({
  name: 'languageEnum'
})
export class LanguageEnumPipe extends BaseEnumPipe<Language> implements PipeTransform {
  constructor() {
    super('language');
  }
}
