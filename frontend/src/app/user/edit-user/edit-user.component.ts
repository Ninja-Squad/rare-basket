import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccessionHolder, Grc, Permission, User, UserCommand } from '../../shared/user.model';
import { AbstractControl, FormControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { combineLatest, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';
import { PermissionEnumPipe } from '../permission-enum.pipe';
import { ValidationErrorDirective, ValidationErrorsComponent } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

interface GrcOptionGroup {
  name: string;
  accessionHolders: Array<AccessionHolder>;
}

function atLeastOneSelection(control: AbstractControl): ValidationErrors | null {
  const value: Record<string, boolean> = control.value;
  return Object.values(value).some(item => item) ? null : { required: true };
}

interface ViewModel {
  mode: 'create' | 'update';
  editedUser: User | null;
  grcs: Array<Grc>;
  accessionHolders: Array<AccessionHolder>;
}

@Component({
  selector: 'rb-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    FormControlValidationDirective,
    ValidationErrorsComponent,
    ValidationErrorDirective,
    RouterLink,
    PermissionEnumPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditUserComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);
  private toastService = inject(ToastService);

  readonly vm: Signal<ViewModel | undefined>;
  readonly form = this.fb.group({
    name: ['', Validators.required],
    orderManagement: false,
    accessionHolders: this.fb.record<FormControl<boolean>>({}, { validators: atLeastOneSelection }),
    orderVisualization: false,
    globalVisualization: false,
    visualizationGrcs: this.fb.record<FormControl<boolean>>({}, { validators: atLeastOneSelection }),
    administration: false
  });

  readonly grcOptionGroups = computed(() => {
    const vm = this.vm();
    return vm ? this.toGrcOptionGroups(vm.accessionHolders) : [];
  });
  keycloakUrl = `${environment.keycloakUrl}${environment.usersRealmPath}`;

  constructor() {
    this.form.controls.orderManagement.valueChanges.pipe(takeUntilDestroyed()).subscribe(orderManagementSelected => {
      if (orderManagementSelected) {
        this.form.controls.accessionHolders.enable();
      } else {
        this.form.controls.accessionHolders.disable();
      }
    });

    this.form.controls.orderVisualization.valueChanges.pipe(takeUntilDestroyed()).subscribe(orderVisualizationSelected => {
      const globalVisualizationControl = this.form.controls.globalVisualization;
      if (orderVisualizationSelected) {
        globalVisualizationControl.enable();
        if (!this.form.value.globalVisualization) {
          this.form.controls.visualizationGrcs.enable();
        } else {
          this.form.controls.visualizationGrcs.disable();
        }
      } else {
        globalVisualizationControl.disable();
        this.form.controls.visualizationGrcs.disable();
      }
    });

    this.form.controls.globalVisualization.valueChanges.pipe(takeUntilDestroyed()).subscribe(globalVisualizationSelected => {
      if (this.form.value.orderVisualization && !globalVisualizationSelected) {
        this.form.controls.visualizationGrcs.enable();
      } else {
        this.form.controls.visualizationGrcs.disable();
      }
    });

    const accessionHolderService = inject(AccessionHolderService);
    const accessionHolders$ = accessionHolderService.list();
    const grcService = inject(GrcService);
    const grcs$ = grcService.list();
    const route = inject(ActivatedRoute);
    const userId = route.snapshot.paramMap.get('userId');

    const user$: Observable<User | null> = userId ? this.userService.get(parseInt(userId)) : of(null);

    this.vm = toSignal(
      combineLatest([accessionHolders$, grcs$, user$]).pipe(
        map(([accessionHolders, grcs, user]) => {
          return {
            grcs,
            accessionHolders,
            editedUser: user,
            mode: user ? ('update' as const) : ('create' as const)
          };
        }),
        tap(vm => {
          vm.grcs.forEach(grc => this.form.controls.visualizationGrcs.addControl(grc.id.toString(), this.fb.control<boolean>(false)));
          vm.accessionHolders.forEach(accessionHolder =>
            this.form.controls.accessionHolders.addControl(accessionHolder.id.toString(), this.fb.control<boolean>(false))
          );
          // bizarrely, if the array is disabled when still empty, disabling it has no effect.
          // so we disable it here
          this.form.controls.accessionHolders.disable();
          this.form.controls.globalVisualization.disable();
          this.form.controls.visualizationGrcs.disable();

          const user = vm.editedUser;
          if (user) {
            const visualizationGrcsValue: Record<string, boolean> = {};
            vm.grcs.forEach(grc => (visualizationGrcsValue[grc.id.toString()] = user.visualizationGrcs.some(g => g.id === grc.id)));

            const accessionHoldersValue: Record<string, boolean> = {};
            vm.accessionHolders.forEach(
              accessionHolder =>
                (accessionHoldersValue[accessionHolder.id.toString()] = user.accessionHolders.some(ah => ah.id === accessionHolder.id))
            );

            this.form.setValue({
              name: user.name,
              orderManagement: user.permissions.includes('ORDER_MANAGEMENT'),
              accessionHolders: accessionHoldersValue,
              orderVisualization: user.permissions.includes('ORDER_VISUALIZATION'),
              globalVisualization: user.globalVisualization,
              visualizationGrcs: visualizationGrcsValue,
              administration: user.permissions.includes('ADMINISTRATION')
            });
          }
        })
      )
    );
  }

  save() {
    if (!this.form.valid) {
      return;
    }

    const formValue = this.form.value;
    const permissions: Array<Permission> = [];
    if (formValue.orderManagement) {
      permissions.push('ORDER_MANAGEMENT');
    }
    if (formValue.orderVisualization) {
      permissions.push('ORDER_VISUALIZATION');
    }
    if (formValue.administration) {
      permissions.push('ADMINISTRATION');
    }
    const globalVisualization = formValue.orderVisualization && formValue.globalVisualization;
    const visualizationGrcIds =
      formValue.orderVisualization && !formValue.globalVisualization ? this.extractSelectedIds(formValue.visualizationGrcs!) : [];
    const accessionHolderIds = formValue.orderManagement ? this.extractSelectedIds(formValue.accessionHolders!) : [];

    const command: UserCommand = {
      name: formValue.name!,
      permissions,
      accessionHolderIds,
      globalVisualization: globalVisualization!,
      visualizationGrcIds
    };

    const vm = this.vm()!;
    let obs: Observable<User | void>;
    if (vm.mode === 'update') {
      obs = this.userService.update(vm.editedUser!.id, command);
    } else {
      obs = this.userService.create(command);
    }

    obs.subscribe(() => {
      this.router.navigate(['/users']);
      this.toastService.success(`user.edit.success.${vm.mode}`, { name: command.name });
    });
  }

  private toGrcOptionGroups(accessionHolders: Array<AccessionHolder>): Array<GrcOptionGroup> {
    const map = new Map<number, GrcOptionGroup>();
    accessionHolders.forEach(accessionHolder => {
      let grcOptionGroup = map.get(accessionHolder.grc.id);
      if (!grcOptionGroup) {
        grcOptionGroup = {
          name: accessionHolder.grc.name,
          accessionHolders: []
        };
        map.set(accessionHolder.grc.id, grcOptionGroup);
      }
      grcOptionGroup.accessionHolders.push(accessionHolder);
    });
    return Array.from(map.values());
  }

  private extractSelectedIds(recordValue: Partial<Record<string, boolean>>): Array<number> {
    return Object.entries(recordValue)
      .filter(([_, selected]) => selected)
      .map(([idAsString]) => parseInt(idAsString));
  }
}
