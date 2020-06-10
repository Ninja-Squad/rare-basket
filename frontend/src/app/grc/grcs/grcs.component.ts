import { Component, OnInit } from '@angular/core';
import { Grc } from '../../shared/user.model';
import { ConfirmationService } from '../../shared/confirmation.service';
import { switchMap } from 'rxjs/operators';
import { GrcService } from '../../shared/grc.service';
import { faBuilding, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'rb-grcs',
  templateUrl: './grcs.component.html',
  styleUrls: ['./grcs.component.scss']
})
export class GrcsComponent implements OnInit {
  grcs: Array<Grc>;

  grcIcon = faBuilding;
  createGrcIcon = faPlus;
  deleteGrcIcon = faTrash;

  constructor(private grcService: GrcService, private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.grcService.list().subscribe(grcs => (this.grcs = grcs));
  }

  deleteGrc(grc: Grc) {
    this.confirmationService
      .confirm({ messageKey: 'grc.grcs.delete-confirmation' })
      .pipe(switchMap(() => this.grcService.delete(grc.id)))
      .pipe(switchMap(() => this.grcService.list()))
      .subscribe(grcs => (this.grcs = grcs));
  }
}
