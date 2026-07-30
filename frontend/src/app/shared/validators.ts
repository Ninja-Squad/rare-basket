import { type AbstractControl, type ValidationErrors } from '@angular/forms';
import { type SchemaPath, validate } from '@angular/forms/signals';

interface DateRangeValue {
  from: string;
  to: string;
}

export function validDateRange(group: AbstractControl): ValidationErrors | null {
  const { from, to } = group.value;
  return from && to && from > to ? { dateRange: true } : null;
}

export function validSignalDateRange<T extends DateRangeValue>(path: SchemaPath<T>): void {
  validate(path, ({ value }) => {
    const { from, to } = value();
    return from && to && from > to ? { kind: 'dateRange' } : undefined;
  });
}
