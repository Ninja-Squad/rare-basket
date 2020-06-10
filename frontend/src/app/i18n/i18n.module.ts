import { Inject, LOCALE_ID, NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { WebpackTranslateLoader } from './webpack-translate-loader';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

/**
 * This function gets the language of the browser,
 * and the result is used as the default language of the application.
 * As we only load the French and English locale date,
 * we use 'fr' if the locale is 'fr-FR' for example,
 * otherwise we use 'en'.
 */
function getBrowserLanguage() {
  if (navigator.language && navigator.language.startsWith('fr')) {
    return 'fr';
  }
  return 'en';
}

@NgModule({
  declarations: [],
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: WebpackTranslateLoader
      }
    })
  ],
  providers: [{ provide: LOCALE_ID, useValue: getBrowserLanguage() }],
  exports: [TranslateModule]
})
export class I18nModule {
  constructor(translate: TranslateService, @Inject(LOCALE_ID) locale: string) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use(locale);
    // set the locale on the document. not only because it's the right thing to do,
    // but also because the custom filechooser elements use it in CSS to display the right text
    document.documentElement.lang = locale;
  }
}
