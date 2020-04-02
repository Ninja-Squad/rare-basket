import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlValidationDirective } from './form-control-validation.directive';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { CustomerTypeEnumPipe } from './customer-type-enum.pipe';
import { AccessionComponent } from './accession/accession.component';

const EXPORTED_DECLARABLES = [FormControlValidationDirective, ConfirmationModalComponent, CustomerTypeEnumPipe, AccessionComponent];

@NgModule({
  declarations: [...EXPORTED_DECLARABLES],
  imports: [CommonModule],
  exports: [...EXPORTED_DECLARABLES]
})
export class SharedModule {}
