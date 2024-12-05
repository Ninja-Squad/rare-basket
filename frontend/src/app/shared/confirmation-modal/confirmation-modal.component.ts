import { Component, Input, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
  imports: [TranslateModule]
})
export class ConfirmationModalComponent {
  activeModal = inject(NgbActiveModal);

  @Input({ required: true }) message!: string;
  @Input({ required: true }) title!: string;
}
