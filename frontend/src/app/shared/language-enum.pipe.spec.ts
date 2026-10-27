import { describe, expect, test } from 'vitest';
import { testEnumPipe } from './base-enum-pipe-test';
import { LanguageEnumPipe } from './language-enum.pipe';

describe('LanguageEnumPipe', () => {
  test('should translate languages', () => {
    expect.hasAssertions();
    testEnumPipe(LanguageEnumPipe, {
      fr: 'Français',
      en: 'Anglais'
    });
  });
});
