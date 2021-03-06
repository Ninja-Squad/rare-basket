import { Component, OnInit } from '@angular/core';
import { AccessionHolder, AccessionHolderCommand, Grc } from '../../shared/user.model';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessionHolderService } from '../../shared/accession-holder.service';
import { GrcService } from '../../shared/grc.service';
import { Observable } from 'rxjs';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'rb-edit-accession-holder',
  templateUrl: './edit-accession-holder.component.html',
  styleUrls: ['./edit-accession-holder.component.scss']
})
export class EditAccessionHolderComponent implements OnInit {
  mode: 'create' | 'update' = 'create';
  editedAccessionHolder: AccessionHolder;
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    grcId: [null as number, Validators.required]
  });
  grcs: Array<Grc>;

  constructor(
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private accessionHolderService: AccessionHolderService,
    private grcService: GrcService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.grcService.list().subscribe(grcs => (this.grcs = grcs));
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

    const formValue = this.form.value;
    const command: AccessionHolderCommand = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      grcId: formValue.grcId
    };

    let obs: Observable<AccessionHolder | void>;
    if (this.mode === 'update') {
      obs = this.accessionHolderService.update(this.editedAccessionHolder.id, command);
    } else {
      obs = this.accessionHolderService.create(command);
    }

    obs.subscribe(() => {
      this.router.navigate(['/accession-holders']);
      this.toastService.success(`accession-holder.edit.success.${this.mode}`, { name: command.name });
    });
  }
}
