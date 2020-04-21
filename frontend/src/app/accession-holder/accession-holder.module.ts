import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RbNgbModule } from '../rb-ngb/rb-ngb.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ValdemortModule } from 'ngx-valdemort';
import { AccessionHoldersComponent } from './accession-holders/accession-holders.component';
import { ACCESSION_HOLDER_ROUTES } from './accession-holder.route';

@NgModule({
  declarations: [AccessionHoldersComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(ACCESSION_HOLDER_ROUTES),
    SharedModule,
    FontAwesomeModule,
    RbNgbModule,
    ReactiveFormsModule,
    ValdemortModule
  ]
})
export class AccessionHolderModule {}
