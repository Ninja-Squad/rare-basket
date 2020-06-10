import { Routes } from '@angular/router';
import { AccessionHoldersComponent } from './accession-holders/accession-holders.component';
import { EditAccessionHolderComponent } from './edit-accession-holder/edit-accession-holder.component';

export const ACCESSION_HOLDER_ROUTES: Routes = [
  {
    path: '',
    component: AccessionHoldersComponent
  },
  {
    path: 'new',
    component: EditAccessionHolderComponent
  },
  {
    path: ':accessionHolderId/edit',
    component: EditAccessionHolderComponent
  }
];
