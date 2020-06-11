import { Component, OnInit } from '@angular/core';
import { AccessionHolder } from '../../shared/user.model';
import { faPlus, faStoreAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { switchMap, tap } from 'rxjs/operators';
import { ConfirmationService } from '../../shared/confirmation.service';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'rb-accession-holders',
  templateUrl: './accession-holders.component.html',
  styleUrls: ['./accession-holders.component.scss']
})
export class AccessionHoldersComponent implements OnInit {
  accessionHolders: Array<AccessionHolder>;

  accessionHolderIcon = faStoreAlt;
  createAccessionHolderIcon = faPlus;
  deleteAccessionHolderIcon = faTrash;

  constructor(
    private accessionHolderService: AccessionHolderService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
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
