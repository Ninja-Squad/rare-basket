import { LOCALE_ID, NgModule } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateModule, TranslateService } from '@ngx-translate/core';
import FR_TRANSLATIONS from './fr.json';

export class CustomMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    throw new Error(`Missing translation for key ${params.key}`);
  }
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      useDefaultLang: false,
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: CustomMissingTranslationHandler }
    })
  ],
  exports: [TranslateModule],
  providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
})
export class I18nTestingModule {
  constructor(translateService: TranslateService) {
    translateService.setTranslation('fr', FR_TRANSLATIONS);
    translateService.use('fr');
  }
}
