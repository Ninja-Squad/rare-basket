import { LanguageEnumPipe } from './language-enum.pipe';
import { testEnumPipe } from './base-enum-pipe-test';
import { describe, expect, test } from 'vitest';

describe('LanguageEnumPipe', () => {
  test('should translate languages', () => {
    expect.hasAssertions();
    testEnumPipe(LanguageEnumPipe, {
      fr: 'Français',
      en: 'Anglais'
    });
  });
});
