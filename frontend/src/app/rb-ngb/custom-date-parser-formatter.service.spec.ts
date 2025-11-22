import { beforeEach, describe, expect, it } from 'vitest';
import { CustomDateParserFormatterService } from './custom-date-parser-formatter.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

describe('FrenchDateParserFormatterService', () => {
  let pf: CustomDateParserFormatterService;

  beforeEach(() => {
    pf = new CustomDateParserFormatterService();
  });

  describe('parsing', () => {
    it('should parse null undefined and empty string as null', () => {
      expect(pf.parse(null as unknown as string)).toBeNull();
      expect(pf.parse(undefined as unknown as string)).toBeNull();
      expect(pf.parse('')).toBeNull();
      expect(pf.parse('   ')).toBeNull();
    });

    it('should parse valid date', () => {
      expect(pf.parse('12/05/2016')).toEqual({ year: 2016, month: 5, day: 12 });
    });

    it('should parse non-date as null', () => {
      expect(pf.parse('foo/bar/baz')).toBeNull();
      expect(pf.parse('bar/2014')).toBeNull();
      expect(pf.parse('11/12/15/2014')).toBeNull();
      expect(pf.parse('11/12/200')).toBeNull();
      expect(pf.parse('11/12/10000')).toBeNull();
    });

    it('should do its best parsing incomplete dates', () => {
      expect(pf.parse('5/2011')).toEqual({ year: 2011, month: 5, day: null as unknown as number });
    });
  });

  describe('formatting', () => {
    it('should format null and undefined as an empty string', () => {
      expect(pf.format(null as unknown as NgbDateStruct)).toBe('');
      expect(pf.format(undefined as unknown as NgbDateStruct)).toBe('');
    });

    it('should format a valid date', () => {
      expect(pf.format({ year: 2016, month: 10, day: 15 })).toBe('15/10/2016');
    });

    it('should format a valid date with padding', () => {
      expect(pf.format({ year: 2016, month: 2, day: 5 })).toBe('05/02/2016');
    });

    it('should try its best with invalid dates', () => {
      expect(pf.format({ year: 2016, month: NaN, day: undefined as unknown as number })).toBe('//2016');
      expect(pf.format({ year: 2016, month: null as unknown as number, day: 0 })).toBe('00//2016');
    });
  });
});
