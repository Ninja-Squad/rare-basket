import { TranslateLoader } from '@ngx-translate/core';
import { from } from 'rxjs';

export class ModuleTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return from(import(`./${lang}.json`).then(m => m.default));
  }
}
