import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-finalization-warnings-modal',
  templateUrl: './finalization-warnings-modal.component.html',
  styleUrl: './finalization-warnings-modal.component.scss',
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule]
})
export class FinalizationWarningsModalComponent {
  messages: Array<string> = [];
  warningIcon = faExclamationTriangle;

  constructor(public activeModal: NgbActiveModal) {}

  init(messages: Array<string>) {
    this.messages = messages;
  }
}
