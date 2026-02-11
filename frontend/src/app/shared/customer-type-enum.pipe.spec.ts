import { CustomerTypeEnumPipe } from './customer-type-enum.pipe';
import { testEnumPipe } from './base-enum-pipe-test';
import { describe, expect, test } from 'vitest';

describe('CustomerTypeEnumPipe', () => {
  test('should translate customer types', () => {
    expect.hasAssertions();
    testEnumPipe(CustomerTypeEnumPipe, {
      INRAE_RESEARCHER: 'Chercheur INRAE',
      FARMER: 'Agriculteur'
    });
  });
});
