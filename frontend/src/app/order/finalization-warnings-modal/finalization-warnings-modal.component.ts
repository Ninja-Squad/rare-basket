import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateDirective } from '@ngx-translate/core';

@Component({
  selector: 'rb-finalization-warnings-modal',
  templateUrl: './finalization-warnings-modal.component.html',
  styleUrl: './finalization-warnings-modal.component.scss',
  imports: [TranslateDirective, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinalizationWarningsModalComponent {
  readonly activeModal = inject(NgbActiveModal);

  readonly messages = signal<Array<string>>([]);
  readonly warningIcon = faExclamationTriangle;

  init(messages: Array<string>) {
    this.messages.set(messages);
  }
}
