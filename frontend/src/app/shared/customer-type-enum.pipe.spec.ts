import { describe, it } from 'vitest';
import { CustomerTypeEnumPipe } from './customer-type-enum.pipe';
import { testEnumPipe } from './base-enum-pipe-test';

describe('CustomerTypeEnumPipe', () => {
  it('should translate customer types', () => {
    testEnumPipe(CustomerTypeEnumPipe, {
      INRAE_RESEARCHER: 'Chercheur INRAE',
      FARMER: 'Agriculteur'
    });
  });
});
