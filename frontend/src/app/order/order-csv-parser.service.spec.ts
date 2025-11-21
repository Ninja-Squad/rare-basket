import { TestBed } from '@angular/core/testing';

import { OrderCsvParserService } from './order-csv-parser.service';

describe('OrderCsvParserService', () => {
  let service: OrderCsvParserService;

  beforeEach(() => {
    service = TestBed.inject(OrderCsvParserService);
  });

  it('should fail if parsing error', () => {
    const input = `rosa;;rosaTaxon\nvioletta;;"violetta1`;
    expect(service.parse(input)).toEqual({
      items: [],
      errors: [{ row: 1, key: 'order.order-csv-parser.MissingQuotes' }]
    });
  });

  it('should fail if only one field or two fields', () => {
    const input = `rosa;rosaNumber;rosaTaxon;10\nvioletta;violettaNumber;violettaTaxon\nfoo\nbar;baz`;
    expect(service.parse(input)).toEqual({
      items: [],
      errors: [
        { row: 2, key: 'order.order-csv-parser.name-number-and-taxon-required' },
        { row: 3, key: 'order.order-csv-parser.name-number-and-taxon-required' }
      ]
    });
  });

  it('should fail if blank name', () => {
    const input = `rosa;rosaNumber;rosaTaxon;10\n;violettaNumber;violettaTaxon`;
    expect(service.parse(input)).toEqual({
      items: [],
      errors: [{ row: 1, key: 'order.order-csv-parser.name-required' }]
    });
  });

  it('should fail if blank taxon', () => {
    const input = `rosa;;rosaTaxon10\nvioletta;; ;10`;
    expect(service.parse(input)).toEqual({
      items: [],
      errors: [{ row: 1, key: 'order.order-csv-parser.taxon-required' }]
    });
  });

  it('should fail if invalid quantity', () => {
    const input = `rosa;rosaNumber;rosaTaxon;10\nvioletta;violettaNumber;violettaTaxon;10abcd`;
    expect(service.parse(input)).toEqual({
      items: [],
      errors: [{ row: 1, key: 'order.order-csv-parser.invalid-quantity' }]
    });
  });

  it('should succeed with semi-colons', () => {
    const input = `rosa;rosaNumber;rosaTaxon\nvioletta;;violettaTaxon;10\nbolet;;boletTaxon;5;pièces;ignored`;
    expect(service.parse(input)).toEqual({
      items: [
        {
          accession: { name: 'rosa', accessionNumber: 'rosaNumber', taxon: 'rosaTaxon', identifier: null, url: null },
          quantity: null,
          unit: null
        },
        {
          accession: { name: 'violetta', accessionNumber: null, taxon: 'violettaTaxon', identifier: null, url: null },
          quantity: 10,
          unit: null
        },
        {
          accession: { name: 'bolet', accessionNumber: null, taxon: 'boletTaxon', identifier: null, url: null },
          quantity: 5,
          unit: 'pièces'
        }
      ],
      errors: []
    });
  });

  it('should succeed with commas', () => {
    const input = `rosa,rosaNumber,rosaTaxon\nvioletta,,violettaTaxon,10\nbolet,,boletTaxon,5,pièces,ignored`;
    expect(service.parse(input)).toEqual({
      items: [
        {
          accession: { name: 'rosa', accessionNumber: 'rosaNumber', taxon: 'rosaTaxon', identifier: null, url: null },
          quantity: null,
          unit: null
        },
        {
          accession: { name: 'violetta', accessionNumber: null, taxon: 'violettaTaxon', identifier: null, url: null },
          quantity: 10,
          unit: null
        },
        {
          accession: { name: 'bolet', accessionNumber: null, taxon: 'boletTaxon', identifier: null, url: null },
          quantity: 5,
          unit: 'pièces'
        }
      ],
      errors: []
    });
  });

  it('should succeed with tabs', () => {
    const input = `rosa\trosaNumber\trosaTaxon\nvioletta\t\tviolettaTaxon\t10\nbolet\t\tboletTaxon\t5\tpièces\tignored`;
    expect(service.parse(input)).toEqual({
      items: [
        {
          accession: { name: 'rosa', accessionNumber: 'rosaNumber', taxon: 'rosaTaxon', identifier: null, url: null },
          quantity: null,
          unit: null
        },
        {
          accession: { name: 'violetta', accessionNumber: null, taxon: 'violettaTaxon', identifier: null, url: null },
          quantity: 10,
          unit: null
        },
        {
          accession: { name: 'bolet', accessionNumber: null, taxon: 'boletTaxon', identifier: null, url: null },
          quantity: 5,
          unit: 'pièces'
        }
      ],
      errors: []
    });
  });

  it('should ignore empty lines', () => {
    const input = `rosa;;rosaTaxon\nvioletta;;violettaTaxon\n\n`;
    expect(service.parse(input)).toEqual({
      items: [
        {
          accession: { name: 'rosa', accessionNumber: null, taxon: 'rosaTaxon', identifier: null, url: null },
          quantity: null,
          unit: null
        },
        {
          accession: { name: 'violetta', accessionNumber: null, taxon: 'violettaTaxon', identifier: null, url: null },
          quantity: null,
          unit: null
        }
      ],
      errors: []
    });
  });
});
