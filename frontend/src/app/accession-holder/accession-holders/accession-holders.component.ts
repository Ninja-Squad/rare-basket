import { Component, inject } from '@angular/core';
import { AccessionHolder } from '../../shared/user.model';
import { faPlus, faStoreAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { switchMap, tap } from 'rxjs/operators';
import { ConfirmationService } from '../../shared/confirmation.service';
import { ToastService } from '../../shared/toast.service';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-accession-holders',
  templateUrl: './accession-holders.component.html',
  styleUrl: './accession-holders.component.scss',
  imports: [TranslateModule, FaIconComponent, RouterLink]
})
export class AccessionHoldersComponent {
  private accessionHolderService = inject(AccessionHolderService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  accessionHolders: Array<AccessionHolder> | null = null;

  accessionHolderIcon = faStoreAlt;
  createAccessionHolderIcon = faPlus;
  deleteAccessionHolderIcon = faTrash;

  constructor() {
    this.accessionHolderService.list().subscribe(accessionHolders => (this.accessionHolders = accessionHolders));
  }

  deleteAccessionHolder(accessionHolder: AccessionHolder) {
    this.confirmationService
      .confirm({ messageKey: 'accession-holder.accession-holders.delete-confirmation' })
      .pipe(
        switchMap(() => this.accessionHolderService.delete(accessionHolder.id)),
        tap(() => this.toastService.success('accession-holder.accession-holders.deleted', { name: accessionHolder.name })),
        switchMap(() => this.accessionHolderService.list())
      )
      .subscribe(accessionHolders => (this.accessionHolders = accessionHolders));
  }
}
