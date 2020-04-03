import { Pipe, PipeTransform } from '@angular/core';
import { BaseEnumPipe } from '../shared/base-enum-pipe';
import { Language } from '../basket/basket.model';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'languageEnum'
})
export class LanguageEnumPipe extends BaseEnumPipe<Language> implements PipeTransform {
  constructor(translateService: TranslateService) {
    super(translateService, 'language');
  }
}
