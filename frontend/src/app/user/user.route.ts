import { Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { EditUserComponent } from './edit-user/edit-user.component';

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
