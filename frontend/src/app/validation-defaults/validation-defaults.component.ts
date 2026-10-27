import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateDirective } from '@ngx-translate/core';
import { DisplayMode, ValdemortConfig, DefaultValidationErrorsDirective, ValidationErrorDirective } from 'ngx-valdemort';

@Component({
  selector: 'rb-validation-defaults',
  templateUrl: './validation-defaults.component.html',
  imports: [DefaultValidationErrorsDirective, ValidationErrorDirective, TranslateDirective, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationDefaultsComponent {
  constructor() {
    const config = inject(ValdemortConfig);
    config.errorsClasses = 'invalid-feedback';
    config.displayMode = DisplayMode.ONE;
  }
}
