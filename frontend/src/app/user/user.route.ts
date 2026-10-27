import { Routes } from '@angular/router';
import { EditUserComponent } from './edit-user/edit-user.component';
import { UsersComponent } from './users/users.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: UsersComponent
  },
  {
    path: 'new',
    component: EditUserComponent
  },
  {
    path: ':userId/edit',
    component: EditUserComponent
  }
];
