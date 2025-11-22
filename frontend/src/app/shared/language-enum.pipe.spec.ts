import { describe, it } from 'vitest';
import { LanguageEnumPipe } from './language-enum.pipe';
import { testEnumPipe } from './base-enum-pipe-test';

describe('LanguageEnumPipe', () => {
  it('should translate languages', () => {
    testEnumPipe(LanguageEnumPipe, {
      fr: 'Français',
      en: 'Anglais'
    });
  });
});
