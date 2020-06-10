import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrcsComponent } from './grcs/grcs.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RbNgbModule } from '../rb-ngb/rb-ngb.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ValdemortModule } from 'ngx-valdemort';
import { GRC_ROUTES } from './grc.routes';
import { EditGrcComponent } from './edit-grc/edit-grc.component';

@NgModule({
  declarations: [GrcsComponent, EditGrcComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(GRC_ROUTES),
    SharedModule,
    FontAwesomeModule,
    RbNgbModule,
    ReactiveFormsModule,
    ValdemortModule
  ]
})
export class GrcModule {}
