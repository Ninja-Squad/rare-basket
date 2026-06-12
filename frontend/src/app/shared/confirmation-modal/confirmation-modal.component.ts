import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateDirective } from '@ngx-translate/core';

@Component({
  selector: 'rb-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
  imports: [TranslateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationModalComponent {
  readonly activeModal = inject(NgbActiveModal);

  readonly message = signal<string>('');
  readonly title = signal<string>('');
}
