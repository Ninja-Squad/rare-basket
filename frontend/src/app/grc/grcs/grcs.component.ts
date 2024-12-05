import { Component, inject } from '@angular/core';
import { Grc } from '../../shared/user.model';
import { ConfirmationService } from '../../shared/confirmation.service';
import { switchMap, tap } from 'rxjs/operators';
import { GrcService } from '../../shared/grc.service';
import { faBuilding, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ToastService } from '../../shared/toast.service';
import { RouterLink } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'rb-grcs',
  templateUrl: './grcs.component.html',
  styleUrl: './grcs.component.scss',
  imports: [TranslateModule, RouterLink, FaIconComponent]
})
export class GrcsComponent {
  private grcService = inject(GrcService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  grcs: Array<Grc> | null = null;

  grcIcon = faBuilding;
  createGrcIcon = faPlus;
  deleteGrcIcon = faTrash;

  constructor() {
    this.grcService.list().subscribe(grcs => (this.grcs = grcs));
  }

  deleteGrc(grc: Grc) {
    this.confirmationService
      .confirm({ messageKey: 'grc.grcs.delete-confirmation' })
      .pipe(
        switchMap(() => this.grcService.delete(grc.id)),
        tap(() => this.toastService.success('grc.grcs.deleted', { name: grc.name })),
        switchMap(() => this.grcService.list())
      )
      .subscribe(grcs => (this.grcs = grcs));
  }
}
