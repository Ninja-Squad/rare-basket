import { Pipe, PipeTransform } from '@angular/core';
import { BaseEnumPipe } from './base-enum-pipe';
import { Language } from '../basket/basket.model';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'languageEnum',
  standalone: true
})
export class LanguageEnumPipe extends BaseEnumPipe<Language> implements PipeTransform {
  constructor(translateService: TranslateService) {
    super(translateService, 'language');
  }
}
