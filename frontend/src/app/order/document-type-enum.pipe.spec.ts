import { DocumentTypeEnumPipe } from './document-type-enum.pipe';
import { testEnumPipe } from '../shared/base-enum-pipe-test';
import { describe, test } from 'vitest';

describe('DocumentTypeEnumPipe', () => {
  test('should translate document types', () => {
    testEnumPipe(DocumentTypeEnumPipe, {
      INVOICE: 'Facture',
      OTHER: 'Autre'
    });
  });
});
