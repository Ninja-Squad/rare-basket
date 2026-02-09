import { inject, LOCALE_ID, provideEnvironmentInitializer } from '@angular/core';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  provideMissingTranslationHandler,
  provideTranslateService,
  TranslateService
} from '@ngx-translate/core';
import FR_TRANSLATIONS from './fr.json';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeFr);

class CustomMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    throw new Error(`Missing translation for key ${params.key}`);
  }
}

/**
 * Returns the necessary providers for i18n from ngx-translate to use in a test.
 * Uses the FR locale and a custom missing translation handler that throws an error.
 */
export const provideI18nTesting = () => {
  return [
    provideTranslateService({
      missingTranslationHandler: provideMissingTranslationHandler(CustomMissingTranslationHandler)
    }),
    { provide: LOCALE_ID, useValue: 'fr' },
    provideEnvironmentInitializer(() => {
      const translateService = inject(TranslateService);
      translateService.setTranslation('fr', FR_TRANSLATIONS);
      translateService.use('fr');
    })
  ];
};
