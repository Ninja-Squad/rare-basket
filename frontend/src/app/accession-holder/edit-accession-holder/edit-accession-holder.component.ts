import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { AccessionHolder, AccessionHolderCommand, Grc } from '../../shared/user.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { GrcService } from '../../shared/grc.service';
import { combineLatest, map, Observable, of, tap } from 'rxjs';
import { ToastService } from '../../shared/toast.service';

import { ValidationErrorsComponent } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

interface ViewModel {
  mode: 'create' | 'update';
  editedAccessionHolder: AccessionHolder | null;
  grcs: Array<Grc>;
}

@Component({
  selector: 'rb-edit-accession-holder',
  templateUrl: './edit-accession-holder.component.html',
  styleUrl: './edit-accession-holder.component.scss',
  imports: [TranslateModule, ReactiveFormsModule, FormControlValidationDirective, ValidationErrorsComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAccessionHolderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly accessionHolderService = inject(AccessionHolderService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly vm: Signal<ViewModel | undefined>;
  readonly form = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    grcId: [null as number | null, Validators.required]
  });

  constructor() {
    const accessionHolderId = this.route.snapshot.paramMap.get('accessionHolderId');
    const grcService = inject(GrcService);

    this.vm = toSignal(
      combineLatest({
        grcs: grcService.list(),
        editedAccessionHolder: accessionHolderId ? this.accessionHolderService.get(parseInt(accessionHolderId)) : of(null)
      }).pipe(
        map(
          ({ grcs, editedAccessionHolder }): ViewModel => ({
            grcs,
            editedAccessionHolder,
            mode: editedAccessionHolder ? 'update' : 'create'
          })
        ),
        tap(vm => {
          this.form.setValue({
            name: vm.editedAccessionHolder?.name ?? '',
            email: vm.editedAccessionHolder?.email ?? '',
            phone: vm.editedAccessionHolder?.phone ?? '',
            grcId: vm.editedAccessionHolder?.grc.id ?? null
          });
        })
      )
    );
  }

  save() {
    if (!this.form.valid) {
      return;
    }

    const formValue = this.form.getRawValue();
    const command: AccessionHolderCommand = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      grcId: formValue.grcId!
    };

    const vm = this.vm()!;
    let obs: Observable<AccessionHolder | void>;
    if (vm.mode === 'update') {
      obs = this.accessionHolderService.update(vm.editedAccessionHolder!.id, command);
    } else {
      obs = this.accessionHolderService.create(command);
    }

    obs.subscribe(() => {
      this.router.navigate(['/accession-holders']);
      this.toastService.success(`accession-holder.edit.success.${vm.mode}`, { name: command.name });
    });
  }
}
