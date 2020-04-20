import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users/users.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RbNgbModule } from '../rb-ngb/rb-ngb.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ValdemortModule } from 'ngx-valdemort';
import { USER_ROUTES } from './user.route';
import { EditUserComponent } from './edit-user/edit-user.component';
import { PermissionEnumPipe } from './permission-enum.pipe';

@NgModule({
  declarations: [UsersComponent, EditUserComponent, PermissionEnumPipe],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(USER_ROUTES),
    SharedModule,
    FontAwesomeModule,
    RbNgbModule,
    ReactiveFormsModule,
    ValdemortModule
  ]
})
export class UserModule {}
