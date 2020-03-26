import { CustomerTypeEnumPipe } from './customer-type-enum.pipe';

describe('CustomerTypeEnumPipe', () => {
  it('should translate customer types', () => {
    const pipe = new CustomerTypeEnumPipe();
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform('FARMER')).toBe('Agriculteur');
    expect(pipe.transform('WTF')).toBe('???WTF???');
  });
});
