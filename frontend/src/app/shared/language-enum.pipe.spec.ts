import { LanguageEnumPipe } from './language-enum.pipe';
import { testEnumPipe } from './base-enum-pipe.spec';

describe('LanguageEnumPipe', () => {
  it('should translate languages', () => {
    testEnumPipe(ts => new LanguageEnumPipe(ts), {
      fr: 'Français',
      en: 'Anglais'
    });
  });
});
