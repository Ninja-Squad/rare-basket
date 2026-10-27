import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBuilding, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateDirective } from '@ngx-translate/core';
import { startWith, Subject, switchMap, tap } from 'rxjs';
import { ConfirmationService } from '../../shared/confirmation.service';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';
import { Grc } from '../../shared/user.model';

@Component({
  selector: 'rb-grcs',
  templateUrl: './grcs.component.html',
  styleUrl: './grcs.component.scss',
  imports: [TranslateDirective, RouterLink, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GrcsComponent {
  private readonly grcService = inject(GrcService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toastService = inject(ToastService);

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
