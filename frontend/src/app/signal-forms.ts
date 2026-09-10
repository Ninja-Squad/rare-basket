import { provideSignalFormsConfig } from '@angular/forms/signals';

export const provideRbSignalFormsConfig = () =>
  provideSignalFormsConfig({
    classes: {
      'is-invalid': binding => binding.state().touched() && binding.state().invalid()
    }
  });
