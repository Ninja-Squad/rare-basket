import FR_TRANSLATIONS from './fr.json';
import EN_TRANSLATIONS from './en.json';

describe('i18n', () => {
  function checkObject(reference: any, other: any, prefix: string, otherLanguage: string) {
    const referenceKeys = Object.keys(reference);
    const otherKeys = Object.keys(other);

    referenceKeys.forEach(key => {
      expect(otherKeys.includes(key))
        .withContext(`key ${prefix + key} is present in fr.json but not in ${otherLanguage}.json`)
        .toBeTrue();
    });
    otherKeys.forEach(key => {
      expect(referenceKeys.includes(key))
        .withContext(`key ${prefix + key} should not be in ${otherLanguage}.json`)
        .toBeTrue();
    });

    referenceKeys.forEach(key => {
      if (typeof reference[key] === 'object') {
        const nextPrefix = `${prefix}${key}.`;
        if (otherKeys.includes(key)) {
          checkObject(reference[key], other[key], nextPrefix, otherLanguage);
        }
      }
    });
  }

  it('should have the same keys in all languages', () => {
    checkObject(FR_TRANSLATIONS, EN_TRANSLATIONS, '', 'en');
  });
});
