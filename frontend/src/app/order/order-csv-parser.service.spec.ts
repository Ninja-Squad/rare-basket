import { TestBed } from '@angular/core/testing';

import { OrderCsvParserService } from './order-csv-parser.service';

describe('OrderCsvParserService', () => {
  let service: OrderCsvParserService;

  beforeEach(() => {
    service = TestBed.inject(OrderCsvParserService);
  });

  it('should fail if parsing error', () => {
    const input = `rosa;rosa1\nvioletta;"violetta1`;
    expect(service.parse(input)).toEqual({
      items: [],
      errors: [{ row: 1, key: 'order.order-csv-parser.MissingQuotes' }]
    });
  });

  it('should fail if only one field', () => {
    const input = `rosa;rosa1;10\nvioletta;violetta1\nfoo`;
    expect(service.parse(input)).toEqual({
      items: [],
      errors: [{ row: 2, key: 'order.order-csv-parser.name-and-identifier-required' }]
    });
  });

  it('should fail if blank name', () => {
    const input = `rosa;rosa1;10\n;violetta1`;
    expect(service.parse(input)).toEqual({
      items: [],
      errors: [{ row: 1, key: 'order.order-csv-parser.name-required' }]
    });
  });

  it('should fail if blank identifier', () => {
    const input = `rosa;rosa1;10\nvioletta; ;10`;
    expect(service.parse(input)).toEqual({
      items: [],
      errors: [{ row: 1, key: 'order.order-csv-parser.identifier-required' }]
    });
  });

  it('should fail if invalid quantity', () => {
    const input = `rosa;rosa1;10\nvioletta;violetta1;10abcd`;
    expect(service.parse(input)).toEqual({
      items: [],
      errors: [{ row: 1, key: 'order.order-csv-parser.invalid-quantity' }]
    });
  });

  it('should succeed with semi-colons', () => {
    const input = `rosa;rosa1\nvioletta;violetta1;10\nbolet;bolet1;5;pièces;ignored`;
    expect(service.parse(input)).toEqual({
      items: [
        {
          accession: { name: 'rosa', identifier: 'rosa1' },
          quantity: null,
          unit: null
        },
        {
          accession: { name: 'violetta', identifier: 'violetta1' },
          quantity: 10,
          unit: null
        },
        {
          accession: { name: 'bolet', identifier: 'bolet1' },
          quantity: 5,
          unit: 'pièces'
        }
      ],
      errors: []
    });
  });

  it('should succeed with commas', () => {
    const input = `rosa,rosa1\nvioletta,violetta1,10\nbolet,bolet1,5,pièces,ignored`;
    expect(service.parse(input)).toEqual({
      items: [
        {
          accession: { name: 'rosa', identifier: 'rosa1' },
          quantity: null,
          unit: null
        },
        {
          accession: { name: 'violetta', identifier: 'violetta1' },
          quantity: 10,
          unit: null
        },
        {
          accession: { name: 'bolet', identifier: 'bolet1' },
          quantity: 5,
          unit: 'pièces'
        }
      ],
      errors: []
    });
  });

  it('should succeed with tabs', () => {
    const input = `rosa\trosa1\nvioletta\tvioletta1\t10\nbolet\tbolet1\t5\tpièces\tignored`;
    expect(service.parse(input)).toEqual({
      items: [
        {
          accession: { name: 'rosa', identifier: 'rosa1' },
          quantity: null,
          unit: null
        },
        {
          accession: { name: 'violetta', identifier: 'violetta1' },
          quantity: 10,
          unit: null
        },
        {
          accession: { name: 'bolet', identifier: 'bolet1' },
          quantity: 5,
          unit: 'pièces'
        }
      ],
      errors: []
    });
  });

  it('should ignore empty lines', () => {
    const input = `rosa;rosa1\nvioletta;violetta1\n\n`;
    expect(service.parse(input)).toEqual({
      items: [
        {
          accession: { name: 'rosa', identifier: 'rosa1' },
          quantity: null,
          unit: null
        },
        {
          accession: { name: 'violetta', identifier: 'violetta1' },
          quantity: null,
          unit: null
        }
      ],
      errors: []
    });
  });
});
