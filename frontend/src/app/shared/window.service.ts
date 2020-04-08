import { InjectionToken } from '@angular/core';

export const WINDOW = new InjectionToken<Window>('The global window object', {
  providedIn: 'root',
  factory: () => window
});
