import { Component } from '@angular/core';
import { DisplayMode, ValdemortConfig } from 'ngx-valdemort';

@Component({
  selector: 'rb-validation-defaults',
  templateUrl: './validation-defaults.component.html'
})
export class ValidationDefaultsComponent {
  constructor(config: ValdemortConfig) {
    config.errorsClasses = 'invalid-feedback';
    config.displayMode = DisplayMode.ONE;
  }
}
