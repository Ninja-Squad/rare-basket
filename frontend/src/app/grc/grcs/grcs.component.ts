import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { Grc } from '../../shared/user.model';
import { ConfirmationService } from '../../shared/confirmation.service';
import { GrcService } from '../../shared/grc.service';
import { faBuilding, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ToastService } from '../../shared/toast.service';
import { RouterLink } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { startWith, Subject, switchMap, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'rb-grcs',
  templateUrl: './grcs.component.html',
  styleUrl: './grcs.component.scss',
  imports: [TranslateModule, RouterLink, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GrcsComponent {
  private grcService = inject(GrcService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  readonly refresh = new Subject<void>();
  readonly grcs: Signal<Array<Grc> | undefined>;

  readonly grcIcon = faBuilding;
  readonly createGrcIcon = faPlus;
  readonly deleteGrcIcon = faTrash;

  constructor() {
    this.grcs = toSignal(
      this.refresh.pipe(
        startWith(undefined),
        switchMap(() => this.grcService.list())
      )
    );
  }

  deleteGrc(grc: Grc) {
    this.confirmationService
      .confirm({ messageKey: 'grc.grcs.delete-confirmation' })
      .pipe(
        switchMap(() => this.grcService.delete(grc.id)),
        tap(() => this.toastService.success('grc.grcs.deleted', { name: grc.name }))
      )
      .subscribe(() => this.refresh.next());
  }
}
