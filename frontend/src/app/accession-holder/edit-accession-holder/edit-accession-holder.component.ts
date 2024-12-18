import { Component, inject } from '@angular/core';
import { AccessionHolder, AccessionHolderCommand, Grc } from '../../shared/user.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { GrcService } from '../../shared/grc.service';
import { Observable } from 'rxjs';
import { ToastService } from '../../shared/toast.service';

import { ValidationErrorsComponent } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-edit-accession-holder',
  templateUrl: './edit-accession-holder.component.html',
  styleUrl: './edit-accession-holder.component.scss',
  imports: [TranslateModule, ReactiveFormsModule, FormControlValidationDirective, ValidationErrorsComponent, RouterLink]
})
export class EditAccessionHolderComponent {
  private route = inject(ActivatedRoute);
  private accessionHolderService = inject(AccessionHolderService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  mode: 'create' | 'update' = 'create';
  editedAccessionHolder: AccessionHolder | null = null;
  form = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    grcId: [null as number | null, Validators.required]
  });
  grcs: Array<Grc> | null = null;

  constructor() {
    const grcService = inject(GrcService);
    grcService.list().subscribe(grcs => (this.grcs = grcs));
    const accessionHolderId = this.route.snapshot.paramMap.get('accessionHolderId');
    if (accessionHolderId) {
      this.mode = 'update';
      this.accessionHolderService.get(+accessionHolderId).subscribe(accessionHolder => {
        this.editedAccessionHolder = accessionHolder;
        this.form.setValue({
          name: accessionHolder.name,
          email: accessionHolder.email,
          phone: accessionHolder.phone,
          grcId: accessionHolder.grc.id
        });
      });
    }
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();
    const command: AccessionHolderCommand = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      grcId: formValue.grcId!
    };

    let obs: Observable<AccessionHolder | void>;
    if (this.mode === 'update') {
      obs = this.accessionHolderService.update(this.editedAccessionHolder!.id, command);
    } else {
      obs = this.accessionHolderService.create(command);
    }

    obs.subscribe(() => {
      this.router.navigate(['/accession-holders']);
      this.toastService.success(`accession-holder.edit.success.${this.mode}`, { name: command.name });
    });
  }
}
