import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlValidationDirective } from './form-control-validation.directive';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { CustomerTypeEnumPipe } from './customer-type-enum.pipe';

const EXPORTED_DECLARABLES = [FormControlValidationDirective, ConfirmationModalComponent, CustomerTypeEnumPipe];

@NgModule({
  declarations: [...EXPORTED_DECLARABLES],
  imports: [CommonModule],
  exports: [...EXPORTED_DECLARABLES]
})
export class SharedModule {}
