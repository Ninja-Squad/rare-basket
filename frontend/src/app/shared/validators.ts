import { type SchemaPath, validate } from '@angular/forms/signals';

interface DateRangeValue {
  from: string;
  to: string;
}

export function validSignalDateRange<T extends DateRangeValue>(path: SchemaPath<T>): void {
  validate(path, ({ value }) => {
    const { from, to } = value();
    return from && to && from > to ? { kind: 'dateRange' } : undefined;
  });
}
