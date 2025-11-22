import { describe, it } from 'vitest';
import { DocumentTypeEnumPipe } from './document-type-enum.pipe';
import { testEnumPipe } from '../shared/base-enum-pipe-test';

describe('DocumentTypeEnumPipe', () => {
  it('should translate document types', () => {
    testEnumPipe(DocumentTypeEnumPipe, {
      INVOICE: 'Facture',
      OTHER: 'Autre'
    });
  });
});
