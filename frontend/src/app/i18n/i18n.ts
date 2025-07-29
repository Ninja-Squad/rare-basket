import { inject, LOCALE_ID, provideEnvironmentInitializer } from '@angular/core';
import { provideTranslateLoader, provideTranslateService, TranslateService } from '@ngx-translate/core';
import { ModuleTranslateLoader } from './module-translate-loader';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

/**
 * This function gets the language of the browser,
 * and the result is used as the default language of the application.
 * As we only load the French and English locale data,
 * we use 'fr' if the locale is 'fr-FR' for example,
 * otherwise we use 'en' as fallback.
 */
function getBrowserLanguage() {
  if (navigator.language && navigator.language.startsWith('fr')) {
    return 'fr';
  }
  return 'en';
}

/**
 * Returns the necessary providers for i18n from ngx-translate.
 * Gets the locale to use from the browser language.
 */
export const provideI18n = () => {
  return [
    provideTranslateService({
      loader: provideTranslateLoader(ModuleTranslateLoader)
    }),
    { provide: LOCALE_ID, useValue: getBrowserLanguage() },
    provideEnvironmentInitializer(() => {
      const translateService = inject(TranslateService);
      // this language will be used as a fallback when a translation isn't found in the current language
      translateService.setFallbackLang('en');
      // the lang to use, if the lang isn't available, it will use the current loader to get them
      const locale = inject(LOCALE_ID);
      translateService.use(locale);
      // set the locale on the document. not only because it's the right thing to do,
      // but also because the custom file picker elements use it in CSS to display the right text
      document.documentElement.lang = locale;
    })
  ];
};
