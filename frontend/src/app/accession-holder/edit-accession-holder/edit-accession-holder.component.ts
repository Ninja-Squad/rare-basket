import { ChangeDetectionStrategy, Component, inject, Signal, signal } from '@angular/core';
import { AccessionHolder, AccessionHolderCommand, Grc } from '../../shared/user.model';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { GrcService } from '../../shared/grc.service';
import { combineLatest, firstValueFrom, map, Observable, of, tap } from 'rxjs';
import { ToastService } from '../../shared/toast.service';

import { ValidationSignalErrorsComponent } from 'ngx-valdemort';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
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
  imports: [TranslateDirective, TranslatePipe, FormRoot, FormField, ValidationSignalErrorsComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAccessionHolderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly accessionHolderService = inject(AccessionHolderService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly vm: Signal<ViewModel | undefined>;
  private readonly formValue = signal({
    name: '',
    email: '',
    phone: '',
    // Native select values are strings; parse back to a number on submit.
    grcId: ''
  });
  readonly form = form(
    this.formValue,
    f => {
      required(f.name);
      required(f.email);
      email(f.email);
      required(f.phone);
      required(f.grcId);
    },
    {
      submission: {
        action: async () => {
          await this.save();
          return undefined;
        }
      }
    }
  );

  constructor() {
    const accessionHolderId = this.route.snapshot.paramMap.get('accessionHolderId');
    const grcService = inject(GrcService);

    this.vm = toSignal(
      combineLatest({
        grcs: grcService.list(),
        editedAccessionHolder: accessionHolderId ? this.accessionHolderService.get(parseInt(accessionHolderId)) : of(null)
      }).pipe(
        map(({ grcs, editedAccessionHolder }): ViewModel => ({
          grcs,
          editedAccessionHolder,
          mode: editedAccessionHolder ? 'update' : 'create'
        })),
        tap(vm => {
          this.formValue.set({
            name: vm.editedAccessionHolder?.name ?? '',
            email: vm.editedAccessionHolder?.email ?? '',
            phone: vm.editedAccessionHolder?.phone ?? '',
            grcId: vm.editedAccessionHolder?.grc.id.toString() ?? ''
          });
        })
      )
    );
  }

  async save(): Promise<void> {
    const formValue = this.formValue();
    const command: AccessionHolderCommand = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      grcId: parseInt(formValue.grcId)
    };

    const vm = this.vm()!;
    const obs: Observable<AccessionHolder | void> =
      vm.mode === 'update'
        ? this.accessionHolderService.update(vm.editedAccessionHolder!.id, command)
        : this.accessionHolderService.create(command);

    await firstValueFrom(obs);
    await this.router.navigate(['/accession-holders']);
    this.toastService.success(`accession-holder.edit.success.${vm.mode}`, { name: command.name });
  }
}
