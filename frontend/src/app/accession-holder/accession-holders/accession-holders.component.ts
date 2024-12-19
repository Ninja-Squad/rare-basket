import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { AccessionHolder } from '../../shared/user.model';
import { faPlus, faStoreAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { ConfirmationService } from '../../shared/confirmation.service';
import { ToastService } from '../../shared/toast.service';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';
import { startWith, Subject, switchMap, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'rb-accession-holders',
  templateUrl: './accession-holders.component.html',
  styleUrl: './accession-holders.component.scss',
  imports: [TranslateModule, FaIconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessionHoldersComponent {
  private accessionHolderService = inject(AccessionHolderService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  readonly accessionHolders: Signal<Array<AccessionHolder> | undefined>;
  readonly refresh = new Subject<void>();

  readonly accessionHolderIcon = faStoreAlt;
  readonly createAccessionHolderIcon = faPlus;
  readonly deleteAccessionHolderIcon = faTrash;

  constructor() {
    this.accessionHolders = toSignal(
      this.refresh.pipe(
        startWith(undefined),
        switchMap(() => this.accessionHolderService.list())
      )
    );
  }

  deleteAccessionHolder(accessionHolder: AccessionHolder) {
    this.confirmationService
      .confirm({ messageKey: 'accession-holder.accession-holders.delete-confirmation' })
      .pipe(
        switchMap(() => this.accessionHolderService.delete(accessionHolder.id)),
        tap(() => this.toastService.success('accession-holder.accession-holders.deleted', { name: accessionHolder.name }))
      )
      .subscribe(() => this.refresh.next());
  }
}
