import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessionHolder, Grc, Permission, User, UserCommand } from '../../shared/user.model';
import { AbstractControl, FormArray, FormControl, FormGroup, NonNullableFormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { combineLatest, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { GrcService } from '../../shared/grc.service';
import { ToastService } from '../../shared/toast.service';

interface GrcOptionGroup {
  name: string;
  accessionHolders: Array<AccessionHolder>;
}

function atLeastOneSelection(control: AbstractControl): ValidationErrors | null {
  const value: Array<{ grc: Grc; selected: boolean }> = control.value;
  return value.some(item => item.selected) ? null : { required: true };
}

@Component({
  selector: 'rb-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  mode: 'create' | 'update' | null = null;
  editedUser: User;
  form = this.fb.group({
    name: ['', Validators.required],
    orderManagement: false,
    accessionHolderId: [null as number, Validators.required],
    orderVisualization: false,
    globalVisualization: false,
    visualizationGrcs: this.fb.array<FormGroup<{ grc: FormControl<Grc>; selected: FormControl<boolean> }>>([], atLeastOneSelection),
    administration: false
  });

  grcOptionGroups: Array<GrcOptionGroup>;
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
    this.form.get('orderManagement').valueChanges.subscribe(orderManagementSelected => {
      const accessionHolderControl = this.form.get('accessionHolderId');
      if (orderManagementSelected) {
        accessionHolderControl.enable();
      } else {
        accessionHolderControl.disable();
      }
    });

    this.form.get('orderVisualization').valueChanges.subscribe(orderVisualizationSelected => {
      const globalVisualizationControl = this.form.get('globalVisualization');
      if (orderVisualizationSelected) {
        globalVisualizationControl.enable();
        if (!this.form.value.globalVisualization) {
          this.visualizationGrcs.enable();
        } else {
          this.visualizationGrcs.disable();
        }
      } else {
        globalVisualizationControl.disable();
        this.visualizationGrcs.disable();
      }
    });

    this.form.get('globalVisualization').valueChanges.subscribe(globalVisualizationSelected => {
      if (this.form.value.orderVisualization && !globalVisualizationSelected) {
        this.visualizationGrcs.enable();
      } else {
        this.visualizationGrcs.disable();
      }
    });
  }

  get visualizationGrcs() {
    return this.form.get('visualizationGrcs') as FormArray<FormGroup<{ grc: FormControl<Grc>; selected: FormControl<boolean> }>>;
  }

  ngOnInit() {
    const accessionHolders$ = this.accessionHolderService.list();
    const grcs$ = this.grcService.list();
    const userId = this.route.snapshot.paramMap.get('userId');

    const user$: Observable<User | null> = userId ? this.userService.get(+userId) : of(null);

    combineLatest([accessionHolders$, grcs$, user$]).subscribe(([accessionHolders, grcs, user]) => {
      grcs.forEach(grc => {
        this.visualizationGrcs.push(
          this.fb.group({
            grc,
            selected: false as boolean
          })
        );
      });

      // bizarrely, if the array is disabled when still empty, disabling it has no effect.
      // so we disable it here
      this.form.get('accessionHolderId').disable();
      this.form.get('globalVisualization').disable();
      this.visualizationGrcs.disable();

      this.grcOptionGroups = this.toGrcOptionGroups(accessionHolders);

      this.editedUser = user;
      if (user) {
        this.mode = 'update';
        this.form.setValue({
          name: user.name,
          orderManagement: user.permissions.includes('ORDER_MANAGEMENT'),
          accessionHolderId: user.accessionHolder?.id ?? null,
          orderVisualization: user.permissions.includes('ORDER_VISUALIZATION'),
          globalVisualization: user.globalVisualization,
          visualizationGrcs: grcs.map(grc => ({
            grc,
            selected: user.visualizationGrcs.some(g => g.id === grc.id)
          })),
          administration: user.permissions.includes('ADMINISTRATION')
        });
      } else {
        this.mode = 'create';
      }
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
      formValue.orderVisualization && !formValue.globalVisualization
        ? formValue.visualizationGrcs.filter(item => item.selected).map(item => item.grc.id)
        : [];

    const command: UserCommand = {
      name: formValue.name,
      permissions,
      accessionHolderId: formValue.accessionHolderId || null,
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
}
