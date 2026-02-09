import { CustomerTypeEnumPipe } from './customer-type-enum.pipe';
import { testEnumPipe } from './base-enum-pipe-test';
import { describe, test } from 'vitest';

describe('CustomerTypeEnumPipe', () => {
  test('should translate customer types', () => {
    testEnumPipe(CustomerTypeEnumPipe, {
      INRAE_RESEARCHER: 'Chercheur INRAE',
      FARMER: 'Agriculteur'
    });
  });
});
