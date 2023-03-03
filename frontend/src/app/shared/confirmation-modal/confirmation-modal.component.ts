import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
  standalone: true,
  imports: [TranslateModule]
})
export class ConfirmationModalComponent {
  @Input() message: string;
  @Input() title: string;

  constructor(public activeModal: NgbActiveModal) {}
}
