import { Component, inject } from '@angular/core';
import { Grc, GrcCommand } from '../../shared/user.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GrcService } from '../../shared/grc.service';
import { Observable } from 'rxjs';
import { ToastService } from '../../shared/toast.service';
import { ValidationErrorsComponent } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-edit-grc',
  templateUrl: './edit-grc.component.html',
  styleUrl: './edit-grc.component.scss',
  imports: [TranslateModule, ReactiveFormsModule, FormControlValidationDirective, ValidationErrorsComponent, RouterLink]
})
export class EditGrcComponent {
  private route = inject(ActivatedRoute);
  private grcService = inject(GrcService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  mode: 'create' | 'update' = 'create';
  editedGrc: Grc | null = null;
  form = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    institution: ['', Validators.required],
    address: ['', Validators.required]
  });

  constructor() {
    const grcId = this.route.snapshot.paramMap.get('grcId');
    if (grcId) {
      this.mode = 'update';
      this.grcService.get(+grcId).subscribe(grc => {
        this.editedGrc = grc;
        this.form.setValue({
          name: grc.name,
          institution: grc.institution,
          address: grc.address
        });
      });
    }
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();
    const command: GrcCommand = {
      name: formValue.name,
      institution: formValue.institution,
      address: formValue.address
    };

    let obs: Observable<Grc | void>;
    if (this.mode === 'update') {
      obs = this.grcService.update(this.editedGrc!.id, command);
    } else {
      obs = this.grcService.create(command);
    }

    obs.subscribe(() => {
      this.router.navigate(['/grcs']);
      this.toastService.success(`grc.edit.success.${this.mode}`, { name: command.name });
    });
  }
}
