import { LanguageEnumPipe } from './language-enum.pipe';
import { testEnumPipe } from './base-enum-pipe-test';
import { describe, test } from 'vitest';

describe('LanguageEnumPipe', () => {
  test('should translate languages', () => {
    testEnumPipe(LanguageEnumPipe, {
      fr: 'Français',
      en: 'Anglais'
    });
  });
});
