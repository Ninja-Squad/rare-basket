import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { isNumber, padNumber, toInteger } from './utils';

@Injectable({
  providedIn: 'root'
})
export class CustomDateParserFormatterService extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (value) {
      const dateParts = value.trim().split('/');
      if (dateParts.length === 1 && isNumber(dateParts[0])) {
        return { year: toInteger(dateParts[0]), month: null as unknown as number, day: null as unknown as number };
      } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
        return { year: toInteger(dateParts[1]), month: toInteger(dateParts[0]), day: null as unknown as number };
      } else if (
        dateParts.length === 3 &&
        isNumber(dateParts[0]) &&
        isNumber(dateParts[1]) &&
        isNumber(dateParts[2]) &&
        toInteger(dateParts[2]) >= 999 &&
        toInteger(dateParts[2]) < 10000
      ) {
        return {
          year: toInteger(dateParts[2]),
          month: toInteger(dateParts[1]),
          day: toInteger(dateParts[0])
        };
      }
    }
    return null;
  }

  format(date: NgbDateStruct): string {
    return date ? `${isNumber(date.day) ? padNumber(date.day) : ''}/${isNumber(date.month) ? padNumber(date.month) : ''}/${date.year}` : '';
  }
}
