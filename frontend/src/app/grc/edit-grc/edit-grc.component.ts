import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { Grc, GrcCommand } from '../../shared/user.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GrcService } from '../../shared/grc.service';
import { map, Observable, of, tap } from 'rxjs';
import { ToastService } from '../../shared/toast.service';
import { ValidationErrorsComponent } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

interface ViewModel {
  mode: 'create' | 'update';
  editedGrc: Grc | null;
}

@Component({
  selector: 'rb-edit-grc',
  templateUrl: './edit-grc.component.html',
  styleUrl: './edit-grc.component.scss',
  imports: [TranslateModule, ReactiveFormsModule, FormControlValidationDirective, ValidationErrorsComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditGrcComponent {
  private route = inject(ActivatedRoute);
  private grcService = inject(GrcService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  readonly vm: Signal<ViewModel | undefined>;
  form = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    institution: ['', Validators.required],
    address: ['', Validators.required]
  });

  constructor() {
    const grcId = this.route.snapshot.paramMap.get('grcId');
    const grc$: Observable<Grc | null> = grcId ? this.grcService.get(parseInt(grcId)) : of(null);
    const vm$: Observable<ViewModel> = grc$.pipe(
      map(grc => ({
        editedGrc: grc,
        mode: grc ? ('update' as const) : ('create' as const)
      })),
      tap(vm => {
        this.form.setValue({
          name: vm.editedGrc?.name ?? '',
          institution: vm.editedGrc?.institution ?? '',
          address: vm.editedGrc?.address ?? ''
        });
      })
    );
    this.vm = toSignal(vm$);
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    const vm = this.vm()!;
    const formValue = this.form.getRawValue();
    const command: GrcCommand = {
      name: formValue.name,
      institution: formValue.institution,
      address: formValue.address
    };

    let obs: Observable<Grc | void>;
    if (vm.mode === 'update') {
      obs = this.grcService.update(vm.editedGrc!.id, command);
    } else {
      obs = this.grcService.create(command);
    }

    obs.subscribe(() => {
      this.router.navigate(['/grcs']);
      this.toastService.success(`grc.edit.success.${vm.mode}`, { name: command.name });
    });
  }
}
