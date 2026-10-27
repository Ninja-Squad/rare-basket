import { Routes } from '@angular/router';
import { EditGrcComponent } from './edit-grc/edit-grc.component';
import { GrcsComponent } from './grcs/grcs.component';

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
