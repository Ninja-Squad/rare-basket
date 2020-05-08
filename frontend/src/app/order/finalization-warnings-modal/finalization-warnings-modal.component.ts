import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'rb-finalization-warnings-modal',
  templateUrl: './finalization-warnings-modal.component.html',
  styleUrls: ['./finalization-warnings-modal.component.scss']
})
export class FinalizationWarningsModalComponent {
  messages: Array<string>;
  warningIcon = faExclamationTriangle;

  constructor(public activeModal: NgbActiveModal) {}

  init(messages: Array<string>) {
    this.messages = messages;
  }
}
