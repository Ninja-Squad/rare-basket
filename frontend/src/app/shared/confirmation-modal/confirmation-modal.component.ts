import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
  standalone: true,
  imports: [TranslateModule]
})
export class ConfirmationModalComponent {
  @Input({ required: true }) message!: string;
  @Input({ required: true }) title!: string;

  constructor(public activeModal: NgbActiveModal) {}
}
