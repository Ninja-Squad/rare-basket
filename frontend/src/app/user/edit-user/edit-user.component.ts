import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessionHolder, ALL_PERMISSIONS, Permission, User, UserCommand } from '../../shared/user.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccessionHolderService } from '../../shared/accession-holder.service';

interface FormValue {
  name: string;
  permissions: Array<{ permission: Permission; selected: boolean }>;
  accessionHolderId: number;
}

interface GrcOptionGroup {
  name: string;
  accessionHolders: Array<AccessionHolder>;
}

@Component({
  selector: 'rb-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  mode: 'create' | 'update' = 'create';
  editedUser: User;
  form: FormGroup;

  allPermissions = ALL_PERMISSIONS;
  grcOptionGroups: Array<GrcOptionGroup>;
  keycloakUrl = `${environment.keycloakUrl}/auth/admin/master/console/#/realms/rare-basket/users`;

  constructor(
    private route: ActivatedRoute,
    fb: FormBuilder,
    private userService: UserService,
    private accessionHolderService: AccessionHolderService,
    private router: Router
  ) {
    this.form = fb.group({
      name: ['', Validators.required],
      permissions: fb.array(
        ALL_PERMISSIONS.map(permission =>
          fb.group({
            permission,
            selected: false
          })
        )
      ),
      accessionHolderId: [null]
    });

    this.permissions
      .at(ALL_PERMISSIONS.indexOf('ORDER_MANAGEMENT'))
      .get('selected')
      .valueChanges.subscribe(orderManagementSelected => {
        const accessionHolderControl = this.form.get('accessionHolderId');
        if (orderManagementSelected) {
          accessionHolderControl.setValidators(Validators.required);
        } else {
          accessionHolderControl.setValidators([]);
        }
        accessionHolderControl.updateValueAndValidity();
      });
  }

  get permissions(): FormArray {
    return this.form.get('permissions') as FormArray;
  }

  ngOnInit() {
    this.accessionHolderService.list().subscribe(accessionHolders => (this.grcOptionGroups = this.toGrcOptionGroups(accessionHolders)));

    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.mode = 'update';
      this.userService.get(+userId).subscribe(user => {
        this.editedUser = user;

        const formValue: FormValue = {
          name: user.name,
          accessionHolderId: user.accessionHolder?.id ?? null,
          permissions: ALL_PERMISSIONS.map(permission => ({
            permission,
            selected: user.permissions.includes(permission)
          }))
        };
        this.form.setValue(formValue);
      });
    }
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    const formValue: FormValue = this.form.value;
    const command: UserCommand = {
      name: formValue.name,
      accessionHolderId: formValue.accessionHolderId,
      permissions: formValue.permissions.filter(({ selected }) => selected).map(({ permission }) => permission)
    };

    let obs: Observable<User | void>;
    if (this.mode === 'update') {
      obs = this.userService.update(this.editedUser.id, command);
    } else {
      obs = this.userService.create(command);
    }

    obs.subscribe(() => this.router.navigate(['/users']));
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
