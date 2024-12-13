import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Toast, ToastService } from '../../shared/toast.service';
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { delay } from 'rxjs';

@Component({
  selector: 'rb-toasts',
  templateUrl: './toasts.component.html',
  styleUrl: './toasts.component.scss',
  imports: [NgbToast, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastsComponent {
  private toastService = inject(ToastService);

  toasts = signal<Array<Toast>>([]);

  constructor() {
    this.toastService
      .toasts()
      .pipe(
        // add a delay because otherwise errors caused by toSignal aren't displayed
        delay(1),
        takeUntilDestroyed()
      )
      .subscribe(toast => {
        this.toasts.update(toasts => [...toasts, toast]);
      });
  }

  remove(toast: Toast) {
    this.toasts.update(toasts => toasts.filter(t => t !== toast));
  }

  icon(toast: Toast) {
    return toast.type === 'success' ? faCheckCircle : faExclamationCircle;
  }
}
