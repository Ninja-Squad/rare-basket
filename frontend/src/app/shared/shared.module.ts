import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlValidationDirective } from './form-control-validation.directive';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';

const EXPORTED_DECLARABLES = [FormControlValidationDirective, ConfirmationModalComponent];

@NgModule({
  declarations: [...EXPORTED_DECLARABLES],
  imports: [CommonModule],
  exports: [...EXPORTED_DECLARABLES]
})
export class SharedModule {}
