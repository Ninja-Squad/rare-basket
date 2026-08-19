import { ChangeDetectionStrategy, Component, inject, Signal, signal } from '@angular/core';
import { Grc, GrcCommand } from '../../shared/user.model';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GrcService } from '../../shared/grc.service';
import { firstValueFrom, map, Observable, of, tap } from 'rxjs';
import { ToastService } from '../../shared/toast.service';
import { ValidationSignalErrorsComponent } from 'ngx-valdemort';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

interface ViewModel {
  mode: 'create' | 'update';
  editedGrc: Grc | null;
}

@Component({
  selector: 'rb-edit-grc',
  templateUrl: './edit-grc.component.html',
  styleUrl: './edit-grc.component.scss',
  imports: [TranslateDirective, TranslatePipe, FormRoot, FormField, ValidationSignalErrorsComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditGrcComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly grcService = inject(GrcService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly vm: Signal<ViewModel | undefined>;
  private readonly formValue = signal({
    name: '',
    institution: '',
    address: ''
  });
  readonly form = form(
    this.formValue,
    f => {
      required(f.name);
      required(f.institution);
      required(f.address);
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
    const grcId = this.route.snapshot.paramMap.get('grcId');
    const grc$: Observable<Grc | null> = grcId ? this.grcService.get(parseInt(grcId)) : of(null);
    const vm$: Observable<ViewModel> = grc$.pipe(
      map(grc => ({
        editedGrc: grc,
        mode: grc ? ('update' as const) : ('create' as const)
      })),
      tap(vm => {
        this.formValue.set({
          name: vm.editedGrc?.name ?? '',
          institution: vm.editedGrc?.institution ?? '',
          address: vm.editedGrc?.address ?? ''
        });
      })
    );
    this.vm = toSignal(vm$);
  }

  async save(): Promise<void> {
    const vm = this.vm()!;
    const formValue = this.formValue();
    const command: GrcCommand = {
      name: formValue.name,
      institution: formValue.institution,
      address: formValue.address
    };

    const obs: Observable<Grc | void> =
      vm.mode === 'update' ? this.grcService.update(vm.editedGrc!.id, command) : this.grcService.create(command);

    await firstValueFrom(obs);
    await this.router.navigate(['/grcs']);
    this.toastService.success(`grc.edit.success.${vm.mode}`, { name: command.name });
  }
}
