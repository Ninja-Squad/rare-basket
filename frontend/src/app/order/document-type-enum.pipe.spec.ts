import { describe, expect, test } from 'vitest';
import { testEnumPipe } from '../shared/base-enum-pipe-test';
import { DocumentTypeEnumPipe } from './document-type-enum.pipe';

describe('DocumentTypeEnumPipe', () => {
  test('should translate document types', () => {
    expect.hasAssertions();
    testEnumPipe(DocumentTypeEnumPipe, {
      INVOICE: 'Facture',
      OTHER: 'Autre'
    });
  });
});
