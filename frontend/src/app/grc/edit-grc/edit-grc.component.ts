import { Component, OnInit } from '@angular/core';
import { Grc, GrcCommand } from '../../shared/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GrcService } from '../../shared/grc.service';
import { Observable } from 'rxjs';

interface FormValue {
  name: string;
  institution: string;
  address: string;
}

@Component({
  selector: 'rb-edit-grc',
  templateUrl: './edit-grc.component.html',
  styleUrls: ['./edit-grc.component.scss']
})
export class EditGrcComponent implements OnInit {
  mode: 'create' | 'update' = 'create';
  editedGrc: Grc;
  form: FormGroup;

  constructor(private route: ActivatedRoute, fb: FormBuilder, private grcService: GrcService, private router: Router) {
    this.form = fb.group({
      name: ['', Validators.required],
      institution: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const grcId = this.route.snapshot.paramMap.get('grcId');
    if (grcId) {
      this.mode = 'update';
      this.grcService.get(+grcId).subscribe(grc => {
        this.editedGrc = grc;

        const formValue: FormValue = {
          name: grc.name,
          institution: grc.institution,
          address: grc.address
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
    const command: GrcCommand = {
      name: formValue.name,
      institution: formValue.institution,
      address: formValue.address
    };

    let obs: Observable<Grc | void>;
    if (this.mode === 'update') {
      obs = this.grcService.update(this.editedGrc.id, command);
    } else {
      obs = this.grcService.create(command);
    }

    obs.subscribe(() => this.router.navigate(['/grcs']));
  }
}
