import { DocumentTypeEnumPipe } from './document-type-enum.pipe';
import { testEnumPipe } from '../shared/base-enum-pipe.spec';

describe('DocumentTypeEnumPipe', () => {
  it('should translate document types', () => {
    testEnumPipe(ts => new DocumentTypeEnumPipe(ts), {
      INVOICE: 'Facture',
      OTHER: 'Autre'
    });
  });
});
