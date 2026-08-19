import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccessionHolder, Grc, Permission, UserCommand } from '../../shared/user.model';
import { form, FormField, FormRoot, required, validate } from '@angular/forms/signals';
import { UserService } from '../user.service';
import { combineLatest, firstValueFrom, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';
import { PermissionEnumPipe } from '../permission-enum.pipe';
import { ValidationErrorDirective, ValidationSignalErrorsComponent } from 'ngx-valdemort';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

interface SelectableAccessionHolder extends AccessionHolder {
  selected: boolean;
}

interface SelectableGrc extends Grc {
  selected: boolean;
}

interface GrcOptionGroup {
  name: string;
  accessionHolders: Array<SelectableAccessionHolder>;
}

@Component({
  selector: 'rb-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
  imports: [
    TranslateDirective,
    TranslatePipe,
    FormRoot,
    FormField,
    ValidationSignalErrorsComponent,
    ValidationErrorDirective,
    RouterLink,
    PermissionEnumPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditUserComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly userId = this.route.snapshot.paramMap.get('userId');

  private readonly formValue = signal({
    name: '',
    orderManagement: false,
    accessionHolders: [] as Array<SelectableAccessionHolder>,
    orderVisualization: false,
    globalVisualization: false,
    visualizationGrcs: [] as Array<SelectableGrc>,
    administration: false
  });
  readonly form = form(
    this.formValue,
    f => {
      required(f.name);
      validate(f.accessionHolders, ({ value }) =>
        !this.formValue().orderManagement || value().some(item => item.selected) ? undefined : { kind: 'required' }
      );
      validate(f.visualizationGrcs, ({ value }) =>
        !this.formValue().orderVisualization || this.formValue().globalVisualization || value().some(item => item.selected)
          ? undefined
          : { kind: 'required' }
      );
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

  readonly grcOptionGroups = computed(() => {
    return this.toGrcOptionGroups(this.formValue().accessionHolders);
  });
  readonly keycloakUrl = `${environment.keycloakUrl}${environment.usersRealmPath}`;
  readonly vm = toSignal(
    combineLatest([
      inject(AccessionHolderService).list(),
      inject(GrcService).list(),
      this.userId ? this.userService.get(parseInt(this.userId)) : of(null)
    ]).pipe(
      map(([accessionHolders, grcs, user]) => {
        return {
          grcs,
          accessionHolders,
          editedUser: user,
          mode: user ? ('update' as const) : ('create' as const)
        };
      }),
      tap(vm => {
        const user = vm.editedUser;
        this.formValue.set({
          name: user?.name ?? '',
          orderManagement: user?.permissions.includes('ORDER_MANAGEMENT') ?? false,
          accessionHolders: vm.accessionHolders.map(accessionHolder => ({
            ...accessionHolder,
            selected: user?.accessionHolders.some(ah => ah.id === accessionHolder.id) ?? false
          })),
          orderVisualization: user?.permissions.includes('ORDER_VISUALIZATION') ?? false,
          globalVisualization: user?.globalVisualization ?? false,
          visualizationGrcs: vm.grcs.map(grc => ({
            ...grc,
            selected: user?.visualizationGrcs.some(visualizationGrc => visualizationGrc.id === grc.id) ?? false
          })),
          administration: user?.permissions.includes('ADMINISTRATION') ?? false
        });
      })
    )
  );

  async save(): Promise<void> {
    const formValue = this.formValue();
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
      formValue.orderVisualization && !formValue.globalVisualization
        ? formValue.visualizationGrcs.filter(grc => grc.selected).map(grc => grc.id)
        : [];
    const accessionHolderIds = formValue.orderManagement
      ? formValue.accessionHolders.filter(accessionHolder => accessionHolder.selected).map(accessionHolder => accessionHolder.id)
      : [];

    const command: UserCommand = {
      name: formValue.name,
      permissions,
      accessionHolderIds,
      globalVisualization,
      visualizationGrcIds
    };

    const vm = this.vm()!;
    if (vm.mode === 'update') {
      await firstValueFrom(this.userService.update(vm.editedUser!.id, command));
    } else {
      await firstValueFrom(this.userService.create(command));
    }

    await this.router.navigate(['/users']);
    this.toastService.success(`user.edit.success.${vm.mode}`, { name: command.name });
  }

  setGlobalVisualization(globalVisualization: boolean) {
    this.formValue.update(value => ({ ...value, globalVisualization }));
  }

  accessionHolderIndex(accessionHolderId: number): number {
    return this.formValue().accessionHolders.findIndex(accessionHolder => accessionHolder.id === accessionHolderId);
  }

  private toGrcOptionGroups(accessionHolders: Array<SelectableAccessionHolder>): Array<GrcOptionGroup> {
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
}
