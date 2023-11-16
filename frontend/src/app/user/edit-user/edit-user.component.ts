import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccessionHolder, Grc, Permission, User, UserCommand } from '../../shared/user.model';
import { AbstractControl, FormControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { combineLatest, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';
import { PermissionEnumPipe } from '../permission-enum.pipe';
import { ValidationErrorDirective, ValidationErrorsComponent } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';
import { NgFor, NgIf } from '@angular/common';

interface GrcOptionGroup {
  name: string;
  accessionHolders: Array<AccessionHolder>;
}

function atLeastOneSelection(control: AbstractControl): ValidationErrors | null {
  const value: Record<string, boolean> = control.value;
  return Object.values(value).some(item => item) ? null : { required: true };
}

@Component({
  selector: 'rb-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    ReactiveFormsModule,
    FormControlValidationDirective,
    ValidationErrorsComponent,
    NgFor,
    ValidationErrorDirective,
    RouterLink,
    PermissionEnumPipe
  ]
})
export class EditUserComponent implements OnInit {
  mode: 'create' | 'update' | null = null;
  editedUser: User;
  form = this.fb.group({
    name: ['', Validators.required],
    orderManagement: false,
    accessionHolders: this.fb.record<FormControl<boolean>>({}, { validators: atLeastOneSelection }),
    orderVisualization: false,
    globalVisualization: false,
    visualizationGrcs: this.fb.record<FormControl<boolean>>({}, { validators: atLeastOneSelection }),
    administration: false
  });

  grcOptionGroups: Array<GrcOptionGroup>;
  grcs: Array<Grc> = [];
  keycloakUrl = `${environment.keycloakUrl}${environment.usersRealmPath}`;

  constructor(
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private userService: UserService,
    private accessionHolderService: AccessionHolderService,
    private grcService: GrcService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.form.controls.orderManagement.valueChanges.subscribe(orderManagementSelected => {
      if (orderManagementSelected) {
        this.form.controls.accessionHolders.enable();
      } else {
        this.form.controls.accessionHolders.disable();
      }
    });

    this.form.controls.orderVisualization.valueChanges.subscribe(orderVisualizationSelected => {
      const globalVisualizationControl = this.form.get('globalVisualization');
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

    this.form.get('globalVisualization').valueChanges.subscribe(globalVisualizationSelected => {
      if (this.form.value.orderVisualization && !globalVisualizationSelected) {
        this.form.controls.visualizationGrcs.enable();
      } else {
        this.form.controls.visualizationGrcs.disable();
      }
    });
  }

  ngOnInit() {
    const accessionHolders$ = this.accessionHolderService.list();
    const grcs$ = this.grcService.list();
    const userId = this.route.snapshot.paramMap.get('userId');

    const user$: Observable<User | null> = userId ? this.userService.get(+userId) : of(null);

    combineLatest([accessionHolders$, grcs$, user$]).subscribe(([accessionHolders, grcs, user]) => {
      grcs.forEach(grc => this.form.controls.visualizationGrcs.addControl(grc.id.toString(), this.fb.control<boolean>(false)));
      accessionHolders.forEach(accessionHolder =>
        this.form.controls.accessionHolders.addControl(accessionHolder.id.toString(), this.fb.control<boolean>(false))
      );

      // bizarrely, if the array is disabled when still empty, disabling it has no effect.
      // so we disable it here
      this.form.controls.accessionHolders.disable();
      this.form.controls.globalVisualization.disable();
      this.form.controls.visualizationGrcs.disable();

      this.grcOptionGroups = this.toGrcOptionGroups(accessionHolders);

      this.editedUser = user;
      if (user) {
        this.mode = 'update';

        const visualizationGrcsValue: Record<string, boolean> = {};
        grcs.forEach(grc => (visualizationGrcsValue[grc.id.toString()] = user.visualizationGrcs.some(g => g.id === grc.id)));

        const accessionHoldersValue: Record<string, boolean> = {};
        accessionHolders.forEach(
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
      } else {
        this.mode = 'create';
      }

      this.grcs = grcs;
    });
  }

  save() {
    if (this.form.invalid) {
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
      formValue.orderVisualization && !formValue.globalVisualization ? this.extractSelectedIds(formValue.visualizationGrcs) : [];
    const accessionHolderIds = formValue.orderManagement ? this.extractSelectedIds(formValue.accessionHolders) : [];

    const command: UserCommand = {
      name: formValue.name,
      permissions,
      accessionHolderIds,
      globalVisualization,
      visualizationGrcIds
    };

    let obs: Observable<User | void>;
    if (this.mode === 'update') {
      obs = this.userService.update(this.editedUser.id, command);
    } else {
      obs = this.userService.create(command);
    }

    obs.subscribe(() => {
      this.router.navigate(['/users']);
      this.toastService.success(`user.edit.success.${this.mode}`, { name: command.name });
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

  private extractSelectedIds(recordValue: Record<string, boolean>): Array<number> {
    return (
      Object.entries(recordValue)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, selected]) => selected)
        .map(([idAsString]) => parseInt(idAsString))
    );
  }
}
