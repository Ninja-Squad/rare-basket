import { BaseEnumPipe } from './base-enum-pipe';
import { TranslateService } from '@ngx-translate/core';
import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '../i18n/mock-18n.spec';

export function testEnumPipe<T extends string>(
  factory: (translateService: TranslateService) => BaseEnumPipe<T>,
  expectedTranslations: Partial<Record<T, string>>
) {
  TestBed.configureTestingModule({
    providers: [provideI18nTesting()]
  });

  const pipe = factory(TestBed.inject(TranslateService));
  expect(pipe.transform(null)).toBe('');
  Object.entries(expectedTranslations).forEach(entry => {
    expect(pipe.transform(entry[0] as T)).toBe(entry[1]);
  });
}
