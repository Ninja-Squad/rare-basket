import { Injectable } from '@angular/core';
import { OrderItemCommand } from './order.model';
import * as Papa from 'papaparse';
import { Accession } from '../basket/basket.model';

@Injectable({
  providedIn: 'root'
})
export class OrderCsvParserService {
  parse(input: string): CsvResult {
    const parseResult = Papa.parse(input, {
      skipEmptyLines: true
    });

    if (parseResult.errors.length) {
      return {
        items: [],
        errors: parseResult.errors.map(e => ({
          row: e.row,
          key: `order.order-csv-parser.${e.code}`
        }))
      };
    }

    const errors: Array<CsvError> = [];
    const items: Array<OrderItemCommand> = [];

    (parseResult.data as Array<Array<string>>).forEach((row, index) => {
      const rowAnalysis = this.analyzeRow(row, index);
      if (rowAnalysis.errors.length) {
        errors.push(...rowAnalysis.errors);
      }
      if (rowAnalysis.item) {
        items.push(rowAnalysis.item);
      }
    });

    return {
      items: errors.length ? [] : items,
      errors
    };
  }

  private analyzeRow(row: Array<string>, index: number): { item: OrderItemCommand | null; errors: Array<CsvError> } {
    const errors: Array<CsvError> = [];
    let accession: Accession | null = null;
    let quantity: number | null = null;
    let unit: string | null = null;

    if (row.length < 2) {
      errors.push(this.error('name-and-identifier-required', index));
    } else {
      accession = { name: row[0].trim(), identifier: row[1].trim() };
      if (!accession.name) {
        errors.push(this.error('name-required', index));
      }
      if (!accession.identifier) {
        errors.push(this.error('identifier-required', index));
      }
      if (row.length > 2 && row[2].trim()) {
        const q = Number(row[2].trim().replace(',', '.'));
        if (isNaN(q) || q <= 0) {
          errors.push(this.error('invalid-quantity', index));
        } else {
          quantity = q;
        }
        unit = row.length > 3 ? row[3] : null;
      }
    }

    if (errors.length === 0) {
      return {
        item: { accession: accession!, quantity, unit },
        errors
      };
    } else {
      return {
        item: null,
        errors
      };
    }
  }

  private error(keySuffix: string, row: number): CsvError {
    return {
      row,
      key: `order.order-csv-parser.${keySuffix}`
    };
  }
}

export interface CsvResult {
  items: Array<OrderItemCommand>;
  errors: Array<CsvError>;
}

interface CsvError {
  row?: number;
  key: string;
}
