import { Routes } from '@angular/router';
import { GrcsComponent } from './grcs/grcs.component';
import { EditGrcComponent } from './edit-grc/edit-grc.component';

export const GRC_ROUTES: Routes = [
  {
    path: '',
    component: GrcsComponent
  },
  {
    path: 'new',
    component: EditGrcComponent
  },
  {
    path: ':grcId/edit',
    component: EditGrcComponent
  }
];
