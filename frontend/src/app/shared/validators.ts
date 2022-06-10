import { AbstractControl, ValidationErrors } from '@angular/forms';

export function validDateRange(group: AbstractControl): ValidationErrors | null {
  const from = group.value.from;
  const to = group.value.to;

  return from && to && from > to ? { dateRange: true } : null;
}
