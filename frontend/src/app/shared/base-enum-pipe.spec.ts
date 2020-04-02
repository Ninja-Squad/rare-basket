import { BaseEnumPipe } from './base-enum-pipe';
import { TranslateService } from '@ngx-translate/core';
import { TestBed } from '@angular/core/testing';
import { I18nTestingModule } from '../i18n/i18n-testing.module.spec';

export function testEnumPipe<T extends string>(
  factory: (translateService: TranslateService) => BaseEnumPipe<T>,
  expectedTranslations: Partial<Record<T, string>>
) {
  TestBed.configureTestingModule({
    imports: [I18nTestingModule]
  });

  const pipe = factory(TestBed.inject(TranslateService));
  expect(pipe.transform(null)).toBe('');
  Object.entries(expectedTranslations).forEach(entry => {
    expect(pipe.transform(entry[0] as T)).toBe(entry[1]);
  });
}
