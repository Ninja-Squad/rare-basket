import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlValidationDirective } from './form-control-validation.directive';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { CustomerTypeEnumPipe } from './customer-type-enum.pipe';
import { AccessionComponent } from './accession/accession.component';
import { TranslateModule } from '@ngx-translate/core';
import { CustomerInformationComponent } from './customer-information/customer-information.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LanguageEnumPipe } from './language-enum.pipe';

const EXPORTED_DECLARABLES = [
  FormControlValidationDirective,
  ConfirmationModalComponent,
  CustomerTypeEnumPipe,
  LanguageEnumPipe,
  AccessionComponent,
  CustomerInformationComponent
];

@NgModule({
  declarations: [...EXPORTED_DECLARABLES],
  imports: [CommonModule, TranslateModule, FontAwesomeModule],
  exports: [...EXPORTED_DECLARABLES]
})
export class SharedModule {}
