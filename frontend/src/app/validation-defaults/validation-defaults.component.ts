import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DisplayMode, ValdemortConfig, DefaultValidationErrorsDirective, ValidationErrorDirective } from 'ngx-valdemort';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-validation-defaults',
  templateUrl: './validation-defaults.component.html',
  imports: [DefaultValidationErrorsDirective, ValidationErrorDirective, TranslateModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationDefaultsComponent {
  constructor() {
    const config = inject(ValdemortConfig);
    config.errorsClasses = 'invalid-feedback';
    config.displayMode = DisplayMode.ONE;
  }
}
